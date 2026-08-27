import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatIndicator, StatLabel, StatValue } from "@/components/ui/stat";
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  toOptions,
} from "@/constant";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount, formatNumber } from "@/lib/amount";
import {
  useDeleteExpenseMutation,
  useDeleteIncomeMutation,
  useGetExpenseSummaryQuery,
  useGetExpensesQuery,
  useGetFinanceCategoriesQuery,
  useGetIncomeSummaryQuery,
  useGetIncomesQuery,
} from "@/redux/apis/financeApis";
import { useGetSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { categoryRefName, type Expense, type Income } from "@/types/domain/finance";
import type { PaymentMethod } from "@/types/domain/soldSubscription";
import { CalendarDays, ListChecks, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { financeEntryColumns } from "../finance-entries.columns";
import { FINANCE_ENTRY_COPY, type FinanceEntryKind } from "../finance-entry-copy";
import { FinanceEntryFormModal } from "./FinanceEntryFormModal";

type Entry = Income | Expense;

interface FinanceEntriesPageProps {
  kind: FinanceEntryKind;
}

export function FinanceEntriesPage({ kind }: FinanceEntriesPageProps) {
  const copy = FINANCE_ENTRY_COPY[kind];
  const isIncome = kind === "INCOME";

  const { filters, setFilter, clearFilters } = useQueryFilters();
  const { data: config } = useGetSystemConfigQuery();
  const { data: categoryData } = useGetFinanceCategoriesQuery({ limit: 100, type: kind });

  const listArgs = {
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    categoryId: filters.categoryId as string | undefined,
    paymentMethod: filters.paymentMethod as PaymentMethod | undefined,
    dateFrom: filters.from as string | undefined,
    dateTo: filters.to as string | undefined,
  };

  const incomeQuery = useGetIncomesQuery(listArgs, { skip: !isIncome });
  const expenseQuery = useGetExpensesQuery(listArgs, { skip: isIncome });
  const incomeSummary = useGetIncomeSummaryQuery(undefined, { skip: !isIncome });
  const expenseSummary = useGetExpenseSummaryQuery(undefined, { skip: isIncome });

  const { data, isLoading, isFetching } = isIncome ? incomeQuery : expenseQuery;
  const { data: summary, isLoading: isSummaryLoading } = isIncome
    ? incomeSummary
    : expenseSummary;

  const [deleteIncome, deleteIncomeState] = useDeleteIncomeMutation();
  const [deleteExpense, deleteExpenseState] = useDeleteExpenseMutation();
  const isDeleting = isIncome ? deleteIncomeState.isLoading : deleteExpenseState.isLoading;

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Entry | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Entry | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (entry: Entry) => {
    setEditing(entry);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      if (isIncome) {
        await deleteIncome(pendingDelete._id).unwrap();
      } else {
        await deleteExpense(pendingDelete._id).unwrap();
      }
      toast.success(copy.deletedToast);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || copy.deleteErrorToast);
    } finally {
      setPendingDelete(null);
    }
  };

  const categories = React.useMemo(() => categoryData?.data ?? [], [categoryData]);

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "categoryId",
        label: "Category",
        type: "select",
        options: categories.map((category) => ({
          label: category.name,
          value: category._id,
        })),
      },
      {
        name: "paymentMethod",
        label: "Method",
        type: "select",
        options: toOptions(PAYMENT_METHOD_LABELS),
      },
      { name: "date", label: "Date", type: "date-range" },
    ],
    [categories]
  );

  const columns = React.useMemo(
    () =>
      financeEntryColumns<Entry>({
        kind,
        onEdit: openEdit,
        onDelete: setPendingDelete,
      }),
    [kind]
  );

  const entries = (data?.data ?? []) as Entry[];
  const meta = data?.meta;
  const currency = config?.defaultCurrency ?? "BDT";

  const stats = [
    {
      label: copy.totalLabel,
      value: formatAmount(summary?.totalAmount, currency),
      icon: Wallet,
      color: isIncome ? ("success" as const) : ("warning" as const),
    },
    {
      label: copy.thisMonthLabel,
      value: formatAmount(summary?.thisMonthAmount, currency),
      icon: CalendarDays,
      color: "info" as const,
    },
    {
      label: copy.countLabel,
      value: formatNumber(summary?.totalCount),
      icon: ListChecks,
      color: "info" as const,
    },
  ];

  return (
    <>
      <PageHeader title={copy.pageTitle} description={copy.pageDescription} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        searchPlaceholder={copy.searchPlaceholder}
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          <Button className="cursor-pointer" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            {copy.newButtonLabel}
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={entries}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(entry) => (
          <div className="grid gap-x-8 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{categoryRefName(entry.categoryId)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Reference</span>
              <span className="truncate font-mono font-medium">{entry.reference || "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Invoice</span>
              {entry.invoice ? (
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate font-mono font-medium">
                    {entry.invoice.invoiceNumber}
                  </span>
                  <StatusBadge
                    color={INVOICE_STATUS_COLORS[entry.invoice.status]}
                    label={INVOICE_STATUS_LABELS[entry.invoice.status]}
                  />
                </span>
              ) : (
                <span className="font-medium">—</span>
              )}
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{copy.partyLabel}</span>
              <span className="font-medium">
                {(isIncome ? (entry as Income).receivedFrom : (entry as Expense).paidTo) || "—"}
              </span>
            </div>
            {entry.notes && (
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="text-muted-foreground">Notes</span>
                <p className="mt-0.5 whitespace-pre-wrap font-medium">{entry.notes}</p>
              </div>
            )}
          </div>
        )}
        mobileCard={(entry) => {
          const locked = isIncome && (entry as Income).sourceType !== "MANUAL";
          return (
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{entry.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {categoryRefName(entry.categoryId)}
                  </p>
                </div>
                <span className="shrink-0 font-medium tabular-nums">
                  {formatAmount(entry.amount, entry.currency)}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(entry.date).toLocaleDateString()} ·{" "}
                {PAYMENT_METHOD_LABELS[entry.paymentMethod]}
              </p>
              {entry.invoice && (
                <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                  {entry.invoice.invoiceNumber}
                </p>
              )}
              <div className="mt-3 flex justify-end gap-2 border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => openEdit(entry)}
                  disabled={locked}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete(entry)}
                  disabled={locked}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          );
        }}
      />

      <FinanceEntryFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        kind={kind}
        entry={editing}
        defaultCurrency={currency}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="This permanently removes the entry. This cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
