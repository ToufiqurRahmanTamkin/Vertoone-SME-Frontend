import { ActionButton } from "@/components/shared/action-button";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Stat,
  StatDescription,
  StatGrid,
  StatIndicator,
  StatLabel,
  StatValue,
} from "@/components/ui/stat";
import {
  INVOICE_ORIGIN_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_COLORS,
  INVOICE_TYPE_LABELS,
  toOptions,
} from "@/constant";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useDeleteInvoiceMutation,
  useGetInvoiceSummaryQuery,
  useGetInvoicesQuery,
} from "@/redux/apis/financeApis";
import { useGetSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  isInvoiceLinked,
  type Invoice,
  type InvoiceStatus,
  type InvoiceType,
} from "@/types/domain/invoice";
import { Clock3, FileText, Plus, TrendingDown, TrendingUp } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { InvoiceDetailDialog } from "./components/InvoiceDetailDialog";
import { InvoiceFormModal } from "./components/InvoiceFormModal";
import { InvoiceRowActions } from "./components/InvoiceRowActions";
import { invoiceColumns } from "./invoices.columns";

const FILTERS: FilterConfig[] = [
  { name: "type", label: "Kind", type: "select", options: toOptions(INVOICE_TYPE_LABELS) },
  { name: "status", label: "Status", type: "select", options: toOptions(INVOICE_STATUS_LABELS) },
  {
    name: "linked",
    label: "Ledger",
    type: "select",
    options: [
      { label: "Linked to an entry", value: "true" },
      { label: "Not linked yet", value: "false" },
    ],
  },
  {
    name: "overdue",
    label: "Overdue",
    type: "select",
    options: [{ label: "Past its due date", value: "true" }],
  },
  { name: "date", label: "Issued", type: "date-range" },
];

export default function InvoicesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const { data: config } = useGetSystemConfigQuery();

  const { data, isLoading, isFetching } = useGetInvoicesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    type: filters.type as InvoiceType | undefined,
    status: filters.status as InvoiceStatus | undefined,
    linked: filters.linked === undefined ? undefined : filters.linked === "true",
    overdue: filters.overdue === "true" ? true : undefined,
    dateFrom: filters.from as string | undefined,
    dateTo: filters.to as string | undefined,
  });
  const { data: summary, isLoading: isSummaryLoading } = useGetInvoiceSummaryQuery();

  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Invoice | null>(null);
  const [viewing, setViewing] = React.useState<Invoice | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Invoice | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (invoice: Invoice) => {
    setEditing(invoice);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteInvoice(pendingDelete._id).unwrap();
      toast.success("Invoice deleted");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the invoice");
    } finally {
      setPendingDelete(null);
    }
  };

  const rowActions = React.useMemo(
    () => ({ onView: setViewing, onEdit: openEdit, onDelete: setPendingDelete }),
    []
  );

  const columns = React.useMemo(() => invoiceColumns(rowActions), [rowActions]);

  const invoices = data?.data ?? [];
  const meta = data?.meta;
  const currency = config?.defaultCurrency ?? "BDT";

  const stats = [
    {
      label: "Invoices",
      value: formatNumber(summary?.totalCount),
      description: `${formatNumber(summary?.paidCount)} paid · ${formatNumber(
        summary?.draftCount
      )} draft`,
      icon: FileText,
      color: "info" as const,
    },
    {
      label: "Receivable",
      value: formatAmountValue(summary?.incomeAmount),
      description: "Billed to customers, cancellations aside",
      icon: TrendingUp,
      color: "success" as const,
    },
    {
      label: "Payable",
      value: formatAmountValue(summary?.expenseAmount),
      description: "Billed to you, cancellations aside",
      icon: TrendingDown,
      color: "warning" as const,
    },
    {
      label: "Outstanding",
      value: formatAmountValue(summary?.outstandingAmount),
      description: `${formatNumber(summary?.overdueCount)} overdue`,
      icon: Clock3,
      color: (summary?.overdueCount ?? 0) > 0 ? ("error" as const) : ("info" as const),
    },
  ];

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Every invoice sits against one income or expense entry. Bill an entry you already recorded, or let the invoice create one. Marking an invoice paid marks its entry paid."
        actions={<CurrencyNote currency={currency} />}
      />

      <StatGrid className="xl:grid-cols-4">
        {stats.map(({ label, value, description, icon: Icon, color }) => (
          <Stat key={label}>
            <StatLabel>{label}</StatLabel>
            {isSummaryLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <StatValue className="truncate">{value}</StatValue>
            )}
            <StatIndicator variant="icon" color={color}>
              <Icon />
            </StatIndicator>
            {!isSummaryLoading && description && (
              <StatDescription>{description}</StatDescription>
            )}
          </Stat>
        ))}
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search invoice no., title, party..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={<ActionButton icon={Plus} label="New invoice" onClick={openCreate} />}
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
                <p className="truncate font-mono text-xs font-semibold">{invoice.invoiceNumber}</p>
                <p className="truncate text-sm font-medium">{invoice.title}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="font-medium tabular-nums">
                  {formatAmountValue(invoice.amount)}
                </span>
                <InvoiceRowActions invoice={invoice} {...rowActions} />
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge
                color={INVOICE_TYPE_COLORS[invoice.type]}
                label={INVOICE_TYPE_LABELS[invoice.type]}
              />
              <StatusBadge
                color={INVOICE_STATUS_COLORS[invoice.status]}
                label={INVOICE_STATUS_LABELS[invoice.status]}
              />
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Issued {formatDate(invoice.issueDate)} ·{" "}
              {isInvoiceLinked(invoice) ? INVOICE_ORIGIN_LABELS[invoice.origin] : "Not linked"}
            </p>
          </div>
        )}
      />

      <InvoiceFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        invoice={editing}
        defaultCurrency={currency}
      />

      <InvoiceDetailDialog
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
        invoice={viewing}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete invoice ${pendingDelete?.invoiceNumber ?? ""}?`}
        description="The income or expense entry it bills is removed with it. This cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
