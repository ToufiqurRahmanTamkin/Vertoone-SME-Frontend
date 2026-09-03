import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useGetBrandOptionsQuery } from "@/redux/apis/brandApis";
import {
  useDeleteProductMutation,
  useGetProductSummaryQuery,
  useGetProductsQuery,
} from "@/redux/apis/productApis";
import { useGetProductCategoryOptionsQuery } from "@/redux/apis/productCategoryApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PRODUCT_CHANNEL_LABELS,
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
  type Product,
  type ProductChannel,
  type ProductType,
} from "@/types/domain/product";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ProductFormModal } from "./components/ProductFormModal";
import { ProductRowActions, productColumns } from "./products.columns";

export default function ProductsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/products/all-products");

  const { data: categoryOptions = [] } = useGetProductCategoryOptionsQuery();
  const { data: brandOptions = [] } = useGetBrandOptionsQuery();

  const { data, isLoading, isFetching } = useGetProductsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    categoryId: filters.categoryId as string | undefined,
    brandId: filters.brandId as string | undefined,
    type: filters.type as ProductType | undefined,
    channel: filters.channel as ProductChannel | undefined,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetProductSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Product | null>(null);
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

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
        name: "brandId",
        label: "Brand",
        type: "select",
        options: brandOptions.map((brand) => ({ label: brand.name, value: brand._id })),
      },
      {
        name: "type",
        label: "Type",
        type: "select",
        options: PRODUCT_TYPES.map((type) => ({
          label: PRODUCT_TYPE_LABELS[type],
          value: type,
        })),
      },
      {
        name: "channel",
        label: "Channel",
        type: "select",
        options: (["pos", "shop"] as ProductChannel[]).map((channel) => ({
          label: PRODUCT_CHANNEL_LABELS[channel],
          value: channel,
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
    [categoryOptions, brandOptions]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteProduct(pendingDelete._id).unwrap();
      toast.success("Product deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the product");
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

  const columns = React.useMemo(() => productColumns(rowActions), [rowActions]);

  const products = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;
  const hasCategories = categoryOptions.length > 0;

  return (
    <>
      <PageHeader
        title="All Products"
        description="Everything you buy, stock or sell, grouped by category and brand."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Products</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>Offered on new orders</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>On the counter</StatLabel>
          <StatValue>{summary?.posCount ?? 0}</StatValue>
          <StatDescription>Sellable through Point of Sale</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Stock value</StatLabel>
          <StatValue>{(summary?.stockValue ?? 0).toLocaleString()}</StatValue>
          <StatDescription>Opening stock at purchase price</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search products, SKU or barcode..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New product"
              onClick={openCreate}
              disabled={isLimitReached || !hasCategories}
              title={
                !hasCategories
                  ? "Create a product category first."
                  : isLimitReached
                    ? `Your plan allows ${limit} products. Delete one or upgrade to add more.`
                    : undefined
              }
            />
          )
        }
      />

      {!hasCategories && (
        <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          Every product belongs to a category. Create one under Products · Categories first.
        </p>
      )}

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} products your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(product) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-md border object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{product.name}</p>
                  <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                    {product.sku}
                  </p>
                </div>
              </div>
              <StatusBadge
                color={product.isActive ? "green" : "zinc"}
                label={product.isActive ? "Active" : "Inactive"}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="truncate font-medium">
                  {product.category?.name ?? "—"}
                  {product.subCategory ? ` · ${product.subCategory.name}` : ""}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Brand</dt>
                <dd className="font-medium">{product.brand?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Selling price</dt>
                <dd className="font-medium tabular-nums">
                  {product.sellingPrice.toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Stock</dt>
                <dd className="font-medium tabular-nums">
                  {product.openingStock.toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="mt-3 flex flex-wrap gap-1">
              {product.channels.pos && (
                <Badge variant="outline" className="text-[10px]">
                  POS
                </Badge>
              )}
              {product.channels.shop && (
                <Badge variant="outline" className="text-[10px]">
                  Shop
                </Badge>
              )}
            </div>

            <div className="mt-3 border-t pt-3">
              <ProductRowActions product={product} {...rowActions} />
            </div>
          </div>
        )}
      />

      <ProductFormModal open={formOpen} onOpenChange={setFormOpen} product={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The product is removed from new orders and the counter. Past records keep pointing at it."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
