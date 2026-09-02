import { ActionButton, CardActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { FINANCE_CATEGORY_TYPE_COLORS, FINANCE_CATEGORY_TYPE_LABELS, toOptions } from "@/constant";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteFinanceCategoryMutation,
  useGetFinanceCategoriesQuery,
} from "@/redux/apis/financeApis";
import { useGetAiAllowanceQuery } from "@/redux/apis/aiApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { FinanceCategory, FinanceCategoryType } from "@/types/domain/finance";
import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AiCategoriesModal } from "./components/AiCategoriesModal";
import { FinanceCategoryFormModal } from "./components/FinanceCategoryFormModal";
import { financeCategoryColumns } from "./finance-categories.columns";

const FILTERS: FilterConfig[] = [
  {
    name: "type",
    label: "Type",
    type: "select",
    options: toOptions(FINANCE_CATEGORY_TYPE_LABELS),
  },
  {
    name: "isActive",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
];

export default function FinanceCategoriesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();

  const { data, isLoading, isFetching } = useGetFinanceCategoriesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    type: filters.type as FinanceCategoryType | undefined,
    isActive: filters.isActive as unknown as boolean | undefined,
  });

  const [formOpen, setFormOpen] = React.useState(false);
  const [aiOpen, setAiOpen] = React.useState(false);
  const { data: ai } = useGetAiAllowanceQuery();
  const [editing, setEditing] = React.useState<FinanceCategory | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<FinanceCategory | null>(null);
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteFinanceCategoryMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: FinanceCategory) => {
    setEditing(category);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCategory(pendingDelete._id).unwrap();
      toast.success("Category deleted");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the category");
    } finally {
      setPendingDelete(null);
    }
  };

  const columns = React.useMemo(
    () => financeCategoryColumns({ onEdit: openEdit, onDelete: setPendingDelete }),
    []
  );

  const categories = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Finance Categories"
        description="Buckets for income and expense entries. Each category belongs to one side of the books."
      />

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search categories..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          <>
            {ai?.isConfigured && (
              <ActionButton
                icon={Sparkles}
                label="Generate with AI"
                variant="outline"
                onClick={() => setAiOpen(true)}
              />
            )}
            <ActionButton icon={Plus} label="New category" onClick={openCreate} />
          </>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(category) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{category.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {category.isActive ? "Active" : "Inactive"}
                  {category.isSystem ? " · System" : ""}
                </p>
              </div>
              <StatusBadge
                color={FINANCE_CATEGORY_TYPE_COLORS[category.type]}
                label={FINANCE_CATEGORY_TYPE_LABELS[category.type]}
              />
            </div>
            {category.description && (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                {category.description}
              </p>
            )}
            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <CardActionButton icon={Pencil} label="Edit" onClick={() => openEdit(category)} />
              <CardActionButton
                icon={Trash2}
                label="Delete"
                className="text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(category)}
                disabled={category.isSystem}
              />
            </div>
          </div>
        )}
      />

      <FinanceCategoryFormModal open={formOpen} onOpenChange={setFormOpen} category={editing} />

      <AiCategoriesModal open={aiOpen} onOpenChange={setAiOpen} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="Categories already used by an entry cannot be deleted — deactivate them instead."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
