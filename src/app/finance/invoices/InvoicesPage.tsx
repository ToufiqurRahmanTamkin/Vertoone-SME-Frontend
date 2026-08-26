import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";
import {
  INVOICE_ORIGIN_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_COLORS,
  INVOICE_TYPE_LABELS,
  toOptions,
} from "@/constant";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount, formatNumber } from "@/lib/amount";
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
import { Clock3, Eye, FileText, Pencil, Plus, TrendingDown, TrendingUp, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { InvoiceDetailDialog } from "./components/InvoiceDetailDialog";
import { InvoiceFormModal } from "./components/InvoiceFormModal";
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
      { label: "Standalone", value: "false" },
    ],
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

  const columns = React.useMemo(
    () => invoiceColumns({ onView: setViewing, onEdit: openEdit, onDelete: setPendingDelete }),
    []
  );

  const invoices = data?.data ?? [];
  const meta = data?.meta;
  const currency = config?.defaultCurrency ?? "BDT";

  const stats = [
    {
      label: "Invoices",
      value: formatNumber(summary?.totalCount),
      icon: FileText,
      color: "info" as const,
    },
    {
      label: "Receivable",
      value: formatAmount(summary?.incomeAmount, currency),
      icon: TrendingUp,
      color: "success" as const,
    },
    {
      label: "Payable",
      value: formatAmount(summary?.expenseAmount, currency),
      icon: TrendingDown,
      color: "warning" as const,
    },
    {
      label: "Outstanding",
      value: formatAmount(summary?.outstandingAmount, currency),
      icon: Clock3,
      color: "info" as const,
    },
  ];

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Every income and expense entry is invoiced. Raise a standalone invoice here and attach it to an entry whenever you are ready."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
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
          </Stat>
        ))}
      </div>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search invoice no., title, party..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          <Button className="cursor-pointer" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            New invoice
          </Button>
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
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono text-xs font-semibold">{invoice.invoiceNumber}</p>
                <p className="truncate text-sm font-medium">{invoice.title}</p>
              </div>
              <span className="shrink-0 font-medium tabular-nums">
                {formatAmount(invoice.amount, invoice.currency)}
              </span>
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
              {isInvoiceLinked(invoice) ? INVOICE_ORIGIN_LABELS[invoice.origin] : "Unlinked"}
            </p>

            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setViewing(invoice)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => openEdit(invoice)}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(invoice)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
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
        description="The ledger entry it bills stays put — only the invoice is removed."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
