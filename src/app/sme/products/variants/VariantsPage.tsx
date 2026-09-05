import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { useGetProductOptionsQuery } from "@/redux/apis/productApis";
import {
  useDeleteProductOptionSetMutation,
  useDeleteProductVariantMutation,
  useGetProductOptionChoicesQuery,
  useGetProductOptionSetsQuery,
  useGetProductVariantSummaryQuery,
  useGetProductVariantsQuery,
} from "@/redux/apis/productVariantApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { ProductOption, ProductVariant } from "@/types/domain/productVariant";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { OptionSetFormModal } from "./components/OptionSetFormModal";
import { VariantFormModal } from "./components/VariantFormModal";
import {
  OptionRowActions,
  VariantRowActions,
  optionColumns,
  selectionLabel,
  variantColumns,
} from "./variants.columns";

export default function VariantsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/products/variants");
  const [tab, setTab] = React.useState("variants");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
  const { data: productOptions = [] } = useGetProductOptionsQuery();
  const { data: optionSets = [] } = useGetProductOptionChoicesQuery();

  const isVariants = tab === "variants";

  const {
    data: variants,
    isLoading: isLoadingVariants,
    isFetching: isFetchingVariants,
  } = useGetProductVariantsQuery(
    {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      productId: filters.productId as string | undefined,
      optionId: filters.optionId as string | undefined,
      isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
    },
    { skip: !isVariants }
  );

  const {
    data: options,
    isLoading: isLoadingOptions,
    isFetching: isFetchingOptions,
  } = useGetProductOptionSetsQuery(
    {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
    },
    { skip: isVariants }
  );

  const { data: summary } = useGetProductVariantSummaryQuery();

  const [variantFormOpen, setVariantFormOpen] = React.useState(false);
  const [optionFormOpen, setOptionFormOpen] = React.useState(false);
  const [editingVariant, setEditingVariant] = React.useState<ProductVariant | null>(null);
  const [editingOption, setEditingOption] = React.useState<ProductOption | null>(null);
  const [pendingVariant, setPendingVariant] = React.useState<ProductVariant | null>(null);
  const [pendingOption, setPendingOption] = React.useState<ProductOption | null>(null);

  const [deleteVariant, { isLoading: isDeletingVariant }] = useDeleteProductVariantMutation();
  const [deleteOption, { isLoading: isDeletingOption }] = useDeleteProductOptionSetMutation();

  const variantFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "productId",
        label: "Product",
        type: "select",
        options: productOptions.map((product) => ({
          label: product.name,
          value: product._id,
        })),
      },
      {
        name: "optionId",
        label: "Option set",
        type: "select",
        options: optionSets.map((option) => ({ label: option.name, value: option._id })),
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
    [productOptions, optionSets]
  );

  const optionFilters = React.useMemo<FilterConfig[]>(
    () => [
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
    []
  );

  const variantRowActions = React.useMemo(
    () => ({
      onEdit: (variant: ProductVariant) => {
        setEditingVariant(variant);
        setVariantFormOpen(true);
      },
      onDelete: setPendingVariant,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const optionRowActions = React.useMemo(
    () => ({
      onEdit: (option: ProductOption) => {
        setEditingOption(option);
        setOptionFormOpen(true);
      },
      onDelete: setPendingOption,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const variantTableColumns = React.useMemo(
    () => variantColumns(variantRowActions),
    [variantRowActions]
  );
  const optionTableColumns = React.useMemo(
    () => optionColumns(optionRowActions),
    [optionRowActions]
  );

  const confirmVariantDelete = async () => {
    if (!pendingVariant) return;
    try {
      await deleteVariant(pendingVariant._id).unwrap();
      toast.success("Variant deleted");
      setPendingVariant(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the variant");
    }
  };

  const confirmOptionDelete = async () => {
    if (!pendingOption) return;
    try {
      await deleteOption(pendingOption._id).unwrap();
      toast.success("Option set deleted");
      setPendingOption(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the option set");
    }
  };

  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;
  const activeMeta = isVariants ? variants?.meta : options?.meta;

  return (
    <>
      <PageHeader
        title="Variants & options"
        description="Sizes, colours and the other options a product is sold in, and the option sets they are built from."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/products/overview" label="Products overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Variants</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{formatNumber(summary?.activeCount ?? 0)}</StatValue>
          <StatDescription>Offered when selling</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Option sets</StatLabel>
          <StatValue>{formatNumber(summary?.optionCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.optionValueCount ?? 0)} values to choose from
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Products covered</StatLabel>
          <StatValue>{formatNumber(summary?.productCount ?? 0)}</StatValue>
          <StatDescription>Products sold in more than one form</StatDescription>
        </Stat>
      </StatGrid>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value);
          clearFilters();
        }}
      >
        <TabsList>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="options">Option sets</TabsTrigger>
        </TabsList>

        <TabsContent value="variants" className="mt-4 flex flex-col gap-4">
          <DataTableToolbar
            searchValue={filters.search}
            onSearchChange={(value) => setFilter("search", value)}
            searchPlaceholder="Search variants by name, SKU or barcode..."
            filters={variantFilters}
            currentFilters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            isLoading={isFetchingVariants}
            actions={
              access.canCreate && (
                <ActionButton
                  icon={Plus}
                  label="New variant"
                  disabled={isLimitReached}
                  title={
                    isLimitReached
                      ? `Your plan allows ${limit} variants. Delete one or upgrade to add more.`
                      : undefined
                  }
                  onClick={() => {
                    setEditingVariant(null);
                    setVariantFormOpen(true);
                  }}
                />
              )
            }
          />

          {isLimitReached && (
            <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
              You have used all {limit} variants your plan allows. Delete one or upgrade your
              subscription to add more.
            </p>
          )}

          <DataTable
            columns={variantTableColumns}
            data={variants?.data ?? []}
            isLoading={isLoadingVariants}
            pagination={
              activeMeta
                ? {
                    page: activeMeta.page,
                    limit: activeMeta.limit,
                    total: activeMeta.total,
                    pages: activeMeta.totalPages,
                  }
                : undefined
            }
            onPageChange={(page) => setFilter("page", page)}
            onLimitChange={(limit) => setFilter("limit", limit)}
            getRowId={(row) => row._id}
            mobileCard={(variant) => (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{variant.name || variant.sku}</p>
                    <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                      {variant.sku}
                    </p>
                  </div>
                  <StatusBadge
                    color={variant.isActive ? "green" : "zinc"}
                    label={variant.isActive ? "Active" : "Inactive"}
                  />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">{selectionLabel(variant)}</p>

                <dl className="mt-3 grid gap-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Product</dt>
                    <dd className="truncate font-medium">{variant.product?.name ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Selling price</dt>
                    <dd className="font-medium tabular-nums">
                      {formatAmountValue(variant.sellingPrice)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 border-t pt-3">
                  <VariantRowActions variant={variant} {...variantRowActions} />
                </div>
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="options" className="mt-4 flex flex-col gap-4">
          <DataTableToolbar
            searchValue={filters.search}
            onSearchChange={(value) => setFilter("search", value)}
            searchPlaceholder="Search option sets..."
            filters={optionFilters}
            currentFilters={filters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            isLoading={isFetchingOptions}
            actions={
              access.canCreate && (
                <ActionButton
                  icon={Plus}
                  label="New option set"
                  onClick={() => {
                    setEditingOption(null);
                    setOptionFormOpen(true);
                  }}
                />
              )
            }
          />

          <DataTable
            columns={optionTableColumns}
            data={options?.data ?? []}
            isLoading={isLoadingOptions}
            pagination={
              activeMeta
                ? {
                    page: activeMeta.page,
                    limit: activeMeta.limit,
                    total: activeMeta.total,
                    pages: activeMeta.totalPages,
                  }
                : undefined
            }
            onPageChange={(page) => setFilter("page", page)}
            onLimitChange={(limit) => setFilter("limit", limit)}
            getRowId={(row) => row._id}
            mobileCard={(option) => (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate font-semibold">{option.name}</p>
                  <StatusBadge
                    color={option.isActive ? "green" : "zinc"}
                    label={option.isActive ? "Active" : "Inactive"}
                  />
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {option.values.map((value) => (
                    <Badge key={value} variant="secondary" className="text-[10px]">
                      {value}
                    </Badge>
                  ))}
                </div>

                <dl className="mt-3 grid gap-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Variants</dt>
                    <dd className="font-medium tabular-nums">{option.variantCount}</dd>
                  </div>
                </dl>

                <div className="mt-3 border-t pt-3">
                  <OptionRowActions option={option} {...optionRowActions} />
                </div>
              </div>
            )}
          />
        </TabsContent>
      </Tabs>

      <VariantFormModal
        open={variantFormOpen}
        onOpenChange={setVariantFormOpen}
        variant={editingVariant}
      />

      <OptionSetFormModal
        open={optionFormOpen}
        onOpenChange={setOptionFormOpen}
        option={editingOption}
      />

      <ConfirmDialog
        open={Boolean(pendingVariant)}
        onOpenChange={(open) => !open && setPendingVariant(null)}
        title={`Delete "${pendingVariant?.name || pendingVariant?.sku || ""}"?`}
        description="The variant stops being offered. Documents that already carry it keep their record."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeletingVariant}
        onConfirm={confirmVariantDelete}
      />

      <ConfirmDialog
        open={Boolean(pendingOption)}
        onOpenChange={(open) => !open && setPendingOption(null)}
        title={`Delete "${pendingOption?.name ?? ""}"?`}
        description="Option sets still used by a variant cannot be deleted. Remove those variants first."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeletingOption}
        onConfirm={confirmOptionDelete}
      />
    </>
  );
}
