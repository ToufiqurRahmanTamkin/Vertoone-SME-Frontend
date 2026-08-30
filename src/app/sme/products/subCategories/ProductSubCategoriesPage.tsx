import { ActionButton, CardActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useGetProductCategoryOptionsQuery } from "@/redux/apis/productCategoryApis";
import {
  useDeleteProductSubCategoryMutation,
  useGetProductSubCategoriesQuery,
  useGetProductSubCategorySummaryQuery,
} from "@/redux/apis/productSubCategoryApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { ProductSubCategory } from "@/types/domain/productSubCategory";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ProductSubCategoryFormModal } from "./components/ProductSubCategoryFormModal";
import { ProductSubCategoryImportModal } from "./components/ProductSubCategoryImportModal";
import { productSubCategoryColumns } from "./product-sub-categories.columns";

export default function ProductSubCategoriesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/products/sub-categories");

  const { data: categoryOptions = [] } = useGetProductCategoryOptionsQuery();

  const { data, isLoading, isFetching } = useGetProductSubCategoriesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    categoryId: filters.categoryId as string | undefined,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetProductSubCategorySummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProductSubCategory | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<ProductSubCategory | null>(null);
  const [deleteSubCategory, { isLoading: isDeleting }] = useDeleteProductSubCategoryMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "categoryId",
        label: "Category",
        type: "select",
        options: categoryOptions.map((category) => ({
          label: category.name,
          value: category._id,
        })),
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
    ],
    [categoryOptions]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (subCategory: ProductSubCategory) => {
    setEditing(subCategory);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteSubCategory(pendingDelete._id).unwrap();
      toast.success("Sub category deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the sub category");
    }
  };

  const columns = React.useMemo(
    () =>
      productSubCategoryColumns({
        onEdit: openEdit,
        onDelete: setPendingDelete,
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const subCategories = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;
  const hasCategories = categoryOptions.length > 0;

  return (
    <>
      <PageHeader
        title="Product Sub Categories"
        description="The finer split inside each category. Pick the category first, then name the sub category."
      />

      <StatGrid className="sm:grid-cols-3">
        <Stat>
          <StatLabel>Sub categories</StatLabel>
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
          <StatLabel>Categories</StatLabel>
          <StatValue>{summary?.categoryCount ?? 0}</StatValue>
          <StatDescription>Parents these sit under</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search sub categories..."
        filters={tableFilters}
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
                disabled={isLimitReached || !hasCategories}
                title={
                  !hasCategories
                    ? "Create a product category first."
                    : isLimitReached
                      ? `Your plan allows ${limit} sub categories. Delete one or upgrade to add more.`
                      : "Create many sub categories from a spreadsheet"
                }
              />
              <ActionButton
                icon={Plus}
                label="New sub category"
                onClick={openCreate}
                disabled={isLimitReached || !hasCategories}
                title={
                  !hasCategories
                    ? "Create a product category first."
                    : isLimitReached
                      ? `Your plan allows ${limit} sub categories. Delete one or upgrade to add more.`
                      : undefined
                }
              />
            </>
          )
        }
      />

      {!hasCategories && (
        <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          Sub categories hang off a category. Create one under Products · Categories first.
        </p>
      )}

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} sub categories your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={subCategories}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(subCategory) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <ColorChip color={subCategory.color} label={subCategory.name} />
              <StatusBadge
                color={subCategory.isActive ? "green" : "zinc"}
                label={subCategory.isActive ? "Active" : "Inactive"}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium">{subCategory.category?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Products</dt>
                <dd className="font-medium tabular-nums">{subCategory.productCount}</dd>
              </div>
            </dl>

            <div className="mt-3 flex justify-end gap-2 border-t pt-3">
              <CardActionButton
                icon={Pencil}
                label="Edit"
                onClick={() => openEdit(subCategory)}
                disabled={!access.canEdit}
              />
              <CardActionButton
                icon={Trash2}
                label="Delete"
                className="text-destructive hover:text-destructive"
                onClick={() => setPendingDelete(subCategory)}
                disabled={!access.canDelete}
              />
            </div>
          </div>
        )}
      />

      <ProductSubCategoryFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        subCategory={editing}
        defaultCategoryId={filters.categoryId as string | undefined}
      />

      <ProductSubCategoryImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        categories={categoryOptions.map((category) => ({
          _id: category._id,
          name: category.name,
        }))}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="Sub categories that still hold products cannot be deleted. Move those products first."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
