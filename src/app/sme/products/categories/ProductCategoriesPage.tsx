import { ActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteProductCategoryMutation,
  useGetProductCategoriesQuery,
  useGetProductCategorySummaryQuery,
} from "@/redux/apis/productCategoryApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { ProductCategory } from "@/types/domain/productCategory";
import { Plus, Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ProductCategoryFormModal } from "./components/ProductCategoryFormModal";
import { ProductCategoryImportModal } from "./components/ProductCategoryImportModal";
import { ProductCategoryRowActions, productCategoryColumns } from "./product-categories.columns";

const FILTERS: FilterConfig[] = [
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

export default function ProductCategoriesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/products/categories");

  const { data, isLoading, isFetching } = useGetProductCategoriesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetProductCategorySummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProductCategory | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<ProductCategory | null>(null);
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteProductCategoryMutation();

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: ProductCategory) => {
    setEditing(category);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCategory(pendingDelete._id).unwrap();
      toast.success("Category deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the category");
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: openEdit,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => productCategoryColumns(rowActions), [rowActions]);

  const categories = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Product Categories"
        description="How the catalogue is grouped for browsing and reporting. Every product belongs to one."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Categories</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Offered when creating a product</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Sub categories</StatLabel>
          <StatValue>{summary?.subCategoryCount ?? 0}</StatValue>
          <StatDescription>The finer split underneath</StatDescription>
        </Stat>
      </StatGrid>

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
          access.canCreate && (
            <>
              <ActionButton
                icon={Upload}
                label="Import"
                variant="outline"
                onClick={() => setImportOpen(true)}
                disabled={isLimitReached}
                title={
                  isLimitReached
                    ? `Your plan allows ${limit} categories. Delete one or upgrade to add more.`
                    : "Create many categories from a spreadsheet"
                }
              />
              <ActionButton
                icon={Plus}
                label="New category"
                onClick={openCreate}
                disabled={isLimitReached}
                title={
                  isLimitReached
                    ? `Your plan allows ${limit} categories. Delete one or upgrade to add more.`
                    : undefined
                }
              />
            </>
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} categories your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

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
              <ColorChip color={category.color} label={category.name} />
              <StatusBadge
                color={category.isActive ? "green" : "zinc"}
                label={category.isActive ? "Active" : "Inactive"}
              />
            </div>

            {category.description && (
              <p className="mt-3 text-xs text-muted-foreground">{category.description}</p>
            )}

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sub categories</dt>
                <dd className="font-medium tabular-nums">{category.subCategoryCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Products</dt>
                <dd className="font-medium tabular-nums">{category.productCount}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <ProductCategoryRowActions category={category} {...rowActions} />
            </div>
          </div>
        )}
      />

      <ProductCategoryFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
      />

      <ProductCategoryImportModal open={importOpen} onOpenChange={setImportOpen} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="Categories that still hold sub categories or products cannot be deleted. Move those first."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
