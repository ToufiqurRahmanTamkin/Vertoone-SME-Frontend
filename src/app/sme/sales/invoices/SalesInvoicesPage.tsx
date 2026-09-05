import { ActionButton } from "@/components/shared/action-button";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { RecordPaymentDialog } from "@/components/shared/record-payment-dialog";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount, formatAmountValue } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetContactOptionsQuery } from "@/redux/apis/contactApis";
import {
  useCancelSalesInvoiceMutation,
  useDeleteSalesInvoiceMutation,
  useGetSalesInvoiceSummaryQuery,
  useGetSalesInvoicesQuery,
  useIssueSalesInvoiceMutation,
  useRecordInvoicePaymentMutation,
} from "@/redux/apis/salesInvoiceApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  SALES_INVOICE_STATUSES,
  SALES_INVOICE_STATUS_COLORS,
  SALES_INVOICE_STATUS_LABELS,
  type SalesInvoice,
  type SalesInvoiceStatus,
} from "@/types/domain/salesInvoice";
import {
  TRADE_PAYMENT_STATUSES,
  TRADE_PAYMENT_STATUS_LABELS,
  type TradePaymentStatus,
} from "@/types/domain/trade";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { SalesInvoiceFormModal } from "./components/SalesInvoiceFormModal";
import { salesInvoiceColumns } from "./invoices.columns";

type PendingAction = {
  kind: "issue" | "cancel" | "delete";
  invoice: SalesInvoice;
} | null;

export default function SalesInvoicesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/sales/invoices");

  const { data: contactOptions = [] } = useGetContactOptionsQuery();
  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: SALES_INVOICE_STATUSES.map((status) => ({
          label: SALES_INVOICE_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "paymentStatus",
        label: "Payment",
        type: "select",
        options: TRADE_PAYMENT_STATUSES.map((status) => ({
          label: TRADE_PAYMENT_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "customerId",
        label: "Customer",
        type: "select",
        options: contactOptions.map((contact) => ({
          label: contact.name || contact.email || contact.phone,
          value: contact._id,
        })),
      },
      {
        name: "warehouseId",
        label: "Warehouse",
        type: "select",
        options: warehouseOptions.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse._id,
        })),
      },
    ],
    [contactOptions, warehouseOptions]
  );

  const { data, isLoading, isFetching } = useGetSalesInvoicesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as SalesInvoiceStatus | undefined,
    paymentStatus: filters.paymentStatus as TradePaymentStatus | undefined,
    customerId: filters.customerId as string | undefined,
    warehouseId: filters.warehouseId as string | undefined,
  });

  const { data: summary } = useGetSalesInvoiceSummaryQuery();
  const currency = summary?.currency ?? "BDT";

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SalesInvoice | null>(null);
  const [paying, setPaying] = React.useState<SalesInvoice | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [issueInvoice, { isLoading: isIssuing }] = useIssueSalesInvoiceMutation();
  const [recordPayment, { isLoading: isPaying }] = useRecordInvoicePaymentMutation();
  const [cancelInvoice, { isLoading: isCancelling }] = useCancelSalesInvoiceMutation();
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteSalesInvoiceMutation();

  const run = async (action: Promise<unknown>, success: string, failure: string) => {
    try {
      await action;
      toast.success(success);
      return true;
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || failure);
      return false;
    }
  };

  const columns = React.useMemo(
    () =>
      salesInvoiceColumns({
        onEdit: (invoice) => {
          setEditing(invoice);
          setFormOpen(true);
        },
        onIssue: (invoice) => setPending({ kind: "issue", invoice }),
        onPay: setPaying,
        onCancel: (invoice) => setPending({ kind: "cancel", invoice }),
        onDelete: (invoice) => setPending({ kind: "delete", invoice }),
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const confirmPending = async () => {
    if (!pending) return;

    const { invoice } = pending;

    if (pending.kind === "issue") {
      await run(
        issueInvoice(invoice._id).unwrap(),
        `${invoice.invoiceNumber} issued`,
        "Could not issue the invoice"
      );
    } else if (pending.kind === "cancel") {
      await run(
        cancelInvoice(invoice._id).unwrap(),
        `${invoice.invoiceNumber} cancelled`,
        "Could not cancel the invoice"
      );
    } else {
      await run(
        deleteInvoice(invoice._id).unwrap(),
        "Invoice deleted",
        "Could not delete the invoice"
      );
    }

    setPending(null);
  };

  const invoices = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const copy = (() => {
    if (!pending) return { title: "", description: "", confirmText: "Confirm" };
    if (pending.kind === "issue") {
      return {
        title: `Issue ${pending.invoice.invoiceNumber}?`,
        description: pending.invoice.salesOrderId
          ? "The invoice is locked and goes on the customer's account. Stock already left the shelf when the order was delivered."
          : "The invoice is locked, the stock leaves the warehouse and the amount goes on the customer's account.",
        confirmText: "Issue invoice",
      };
    }
    if (pending.kind === "cancel") {
      return {
        title: `Cancel ${pending.invoice.invoiceNumber}?`,
        description:
          "Any stock this invoice moved is put back, and the amount comes off the customer's account.",
        confirmText: "Cancel invoice",
      };
    }
    return {
      title: `Delete ${pending.invoice.invoiceNumber}?`,
      description: "Only drafts with no payments recorded against them can be deleted.",
      confirmText: "Delete",
    };
  })();

  return (
    <>
      <PageHeader
        title="Invoices"
        description="What you have billed customers, what they have paid and what is overdue."
        actions={<CurrencyNote currency={currency} />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Invoices</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Issued</StatLabel>
          <StatValue>{summary?.issuedCount ?? 0}</StatValue>
          <StatDescription>{summary?.draftCount ?? 0} still in draft</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Owed by customers</StatLabel>
          <StatValue>{formatAmountValue(summary?.outstandingReceivable ?? 0)}</StatValue>
          <StatDescription>
            Billed on {formatAmountValue(summary?.invoicedValue ?? 0)} of invoices
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Overdue</StatLabel>
          <StatValue>{formatAmountValue(summary?.overdueValue ?? 0)}</StatValue>
          <StatDescription>Across {summary?.overdueCount ?? 0} late invoices</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search invoices..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New invoice"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} invoices. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(invoice) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">
                  {invoice.invoiceNumber}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {invoice.customer?.name ?? invoice.customerName} ·{" "}
                  {formatDate(invoice.invoiceDate)}
                </p>
              </div>
              <StatusBadge
                color={SALES_INVOICE_STATUS_COLORS[invoice.status] as StatusColor}
                label={SALES_INVOICE_STATUS_LABELS[invoice.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Due</dt>
                <dd className={invoice.isOverdue ? "font-medium text-red-600" : "font-medium"}>
                  {formatDate(invoice.dueDate)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-medium tabular-nums">{formatAmount(invoice.grandTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Balance due</dt>
                <dd className="font-medium tabular-nums">{formatAmount(invoice.balanceDue)}</dd>
              </div>
            </dl>
          </div>
        )}
      />

      <SalesInvoiceFormModal open={formOpen} onOpenChange={setFormOpen} invoice={editing} />

      <RecordPaymentDialog
        open={Boolean(paying)}
        onOpenChange={(open) => !open && setPaying(null)}
        title={`Payment from ${paying?.customer?.name ?? paying?.customerName ?? "customer"}`}
        description={`Recorded against ${paying?.invoiceNumber ?? ""}.`}
        outstanding={paying?.balanceDue ?? 0}
        isLoading={isPaying}
        onSubmit={async (body) => {
          if (!paying) return;
          const ok = await run(
            recordPayment({ id: paying._id, body }).unwrap(),
            `Payment recorded on ${paying.invoiceNumber}`,
            "Could not record the payment"
          );
          if (ok) setPaying(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={copy.title}
        description={copy.description}
        confirmText={copy.confirmText}
        variant={pending?.kind === "delete" ? "destructive" : undefined}
        isLoading={isIssuing || isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
