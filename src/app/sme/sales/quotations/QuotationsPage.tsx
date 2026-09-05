import { ActionButton } from "@/components/shared/action-button";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
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
  useAcceptQuotationMutation,
  useDeleteQuotationMutation,
  useGetQuotationSummaryQuery,
  useGetQuotationsQuery,
  useRejectQuotationMutation,
  useSendQuotationMutation,
} from "@/redux/apis/quotationApis";
import { useConvertQuotationMutation } from "@/redux/apis/salesOrderApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  QUOTATION_STATUSES,
  QUOTATION_STATUS_COLORS,
  QUOTATION_STATUS_LABELS,
  type Quotation,
  type QuotationStatus,
} from "@/types/domain/quotation";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ConvertQuotationDialog } from "./components/ConvertQuotationDialog";
import { QuotationFormModal } from "./components/QuotationFormModal";
import { quotationColumns } from "./quotations.columns";

type PendingAction = {
  kind: "accept" | "reject" | "delete";
  quotation: Quotation;
} | null;

export default function QuotationsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/sales/quotations");

  const { data: contactOptions = [] } = useGetContactOptionsQuery();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: QUOTATION_STATUSES.map((status) => ({
          label: QUOTATION_STATUS_LABELS[status],
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
    ],
    [contactOptions]
  );

  const { data, isLoading, isFetching } = useGetQuotationsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as QuotationStatus | undefined,
    customerId: filters.customerId as string | undefined,
  });

  const { data: summary } = useGetQuotationSummaryQuery();
  const currency = summary?.currency ?? "BDT";

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Quotation | null>(null);
  const [converting, setConverting] = React.useState<Quotation | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [sendQuotation] = useSendQuotationMutation();
  const [acceptQuotation, { isLoading: isAccepting }] = useAcceptQuotationMutation();
  const [rejectQuotation, { isLoading: isRejecting }] = useRejectQuotationMutation();
  const [deleteQuotation, { isLoading: isDeleting }] = useDeleteQuotationMutation();
  const [convertQuotation, { isLoading: isConverting }] = useConvertQuotationMutation();

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
      quotationColumns({
        onEdit: (quotation) => {
          setEditing(quotation);
          setFormOpen(true);
        },
        onSend: (quotation) =>
          void run(
            sendQuotation(quotation._id).unwrap(),
            `${quotation.quotationNumber} marked as sent`,
            "Could not mark the quotation as sent"
          ),
        onAccept: (quotation) => setPending({ kind: "accept", quotation }),
        onReject: (quotation) => setPending({ kind: "reject", quotation }),
        onConvert: setConverting,
        onDelete: (quotation) => setPending({ kind: "delete", quotation }),
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete, sendQuotation]
  );

  const confirmPending = async () => {
    if (!pending) return;

    const { quotation } = pending;

    if (pending.kind === "accept") {
      await run(
        acceptQuotation(quotation._id).unwrap(),
        `${quotation.quotationNumber} marked as accepted`,
        "Could not accept the quotation"
      );
    } else if (pending.kind === "reject") {
      await run(
        rejectQuotation(quotation._id).unwrap(),
        `${quotation.quotationNumber} marked as rejected`,
        "Could not reject the quotation"
      );
    } else {
      await run(
        deleteQuotation(quotation._id).unwrap(),
        "Quotation deleted",
        "Could not delete the quotation"
      );
    }

    setPending(null);
  };

  const quotations = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const copy = (() => {
    if (!pending) return { title: "", description: "", confirmText: "Confirm" };
    if (pending.kind === "accept") {
      return {
        title: `Mark ${pending.quotation.quotationNumber} as accepted?`,
        description:
          "The customer has agreed to the price. Convert it to a sales order to reserve the stock.",
        confirmText: "Mark accepted",
      };
    }
    if (pending.kind === "reject") {
      return {
        title: `Mark ${pending.quotation.quotationNumber} as rejected?`,
        description: "The quotation closes. Nothing is reserved and no stock moves.",
        confirmText: "Mark rejected",
      };
    }
    return {
      title: `Delete ${pending.quotation.quotationNumber}?`,
      description: "A quotation that has already become a sales order cannot be deleted.",
      confirmText: "Delete",
    };
  })();

  return (
    <>
      <PageHeader
        title="Quotations"
        description="Prices you have offered customers, and which of them turned into orders."
        actions={<CurrencyNote currency={currency} />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Quotations</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Awaiting a reply</StatLabel>
          <StatValue>{summary?.sentCount ?? 0}</StatValue>
          <StatDescription>{summary?.draftCount ?? 0} still in draft</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Open value</StatLabel>
          <StatValue>{formatAmountValue(summary?.openValue ?? 0)}</StatValue>
          <StatDescription>Sitting with customers right now</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Accepted value</StatLabel>
          <StatValue>{formatAmountValue(summary?.acceptedValue ?? 0)}</StatValue>
          <StatDescription>Across {summary?.acceptedCount ?? 0} accepted quotes</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search quotations..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New quotation"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} quotations. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      <DataTable
        columns={columns}
        data={quotations}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(quotation) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">
                  {quotation.quotationNumber}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {quotation.customer?.name ?? quotation.customerName} ·{" "}
                  {formatDate(quotation.quotationDate)}
                </p>
              </div>
              <StatusBadge
                color={QUOTATION_STATUS_COLORS[quotation.status] as StatusColor}
                label={QUOTATION_STATUS_LABELS[quotation.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Valid until</dt>
                <dd className="font-medium">{formatDate(quotation.validUntil)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-medium tabular-nums">{formatAmount(quotation.grandTotal)}</dd>
              </div>
              {quotation.salesOrderNumber && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sales order</dt>
                  <dd className="font-mono font-medium uppercase">{quotation.salesOrderNumber}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      />

      <QuotationFormModal open={formOpen} onOpenChange={setFormOpen} quotation={editing} />

      <ConvertQuotationDialog
        open={Boolean(converting)}
        onOpenChange={(open) => !open && setConverting(null)}
        quotation={converting}
        isLoading={isConverting}
        onSubmit={async (body) => {
          if (!converting) return;
          const ok = await run(
            convertQuotation({ quotationId: converting._id, body }).unwrap(),
            `${converting.quotationNumber} is now a sales order`,
            "Could not convert the quotation"
          );
          if (ok) setConverting(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={copy.title}
        description={copy.description}
        confirmText={copy.confirmText}
        variant={pending?.kind === "delete" ? "destructive" : undefined}
        isLoading={isAccepting || isRejecting || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
