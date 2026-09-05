import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import {
  useDeleteBundleMutation,
  useGetBundleSummaryQuery,
  useGetBundlesQuery,
} from "@/redux/apis/productBundleApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  BUNDLE_TYPES,
  BUNDLE_TYPE_LABELS,
  type BundleType,
  type ProductBundle,
} from "@/types/domain/productBundle";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { BundleRowActions, bundleColumns } from "./bundles.columns";
import { BundleFormModal } from "./components/BundleFormModal";

const FILTERS: FilterConfig[] = [
  {
    name: "type",
    label: "Kind",
    type: "select",
    options: BUNDLE_TYPES.map((type) => ({ label: BUNDLE_TYPE_LABELS[type], value: type })),
  },
  {
    name: "channel",
    label: "Channel",
    type: "select",
    options: [
      { label: "Point of Sale", value: "pos" },
      { label: "Online shop", value: "shop" },
    ],
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

export default function BundlesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/products/bundles");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();

  const { data, isLoading, isFetching } = useGetBundlesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    type: filters.type as BundleType | undefined,
    channel: filters.channel as "pos" | "shop" | undefined,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetBundleSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProductBundle | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<ProductBundle | null>(null);
  const [deleteBundle, { isLoading: isDeleting }] = useDeleteBundleMutation();

  const openEdit = (bundle: ProductBundle) => {
    setEditing(bundle);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteBundle(pendingDelete._id).unwrap();
      toast.success("Bundle deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the bundle");
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

  const columns = React.useMemo(() => bundleColumns(rowActions), [rowActions]);

  const bundles = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Bundles & kits"
        description="Several products grouped and sold together as one item, priced as a set."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/products/overview" label="Products overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Bundles</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{formatNumber(summary?.activeCount ?? 0)}</StatValue>
          <StatDescription>{formatNumber(summary?.kitCount ?? 0)} of them are kits</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Average saving</StatLabel>
          <StatValue>{summary?.averageSavings ?? 0}%</StatValue>
          <StatDescription>Off the sum of the parts</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Buildable now</StatLabel>
          <StatValue>{formatNumber(summary?.buildableCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.componentCount ?? 0)} component lines in total
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search bundles..."
        filters={FILTERS}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New bundle"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} bundles. Delete one or upgrade to add more.`
                  : undefined
              }
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} bundles your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={bundles}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(bundle) => (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              What is inside
            </p>
            <ul className="divide-y rounded-lg border">
              {bundle.components.map((component) => (
                <li
                  key={component._id}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{component.name}</p>
                    <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                      {component.sku}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular-nums">
                      {formatNumber(component.quantity)} ×{" "}
                      {formatAmountValue(component.unitPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatNumber(component.onHand)} on hand · builds{" "}
                      {formatNumber(component.buildable)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        mobileCard={(bundle) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{bundle.name}</p>
                <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                  {bundle.code}
                </p>
              </div>
              <StatusBadge
                color={bundle.isActive ? "green" : "zinc"}
                label={bundle.isActive ? "Active" : "Inactive"}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Parts</dt>
                <dd className="font-medium tabular-nums">{bundle.componentCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Bundle price</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(bundle.sellingPrice)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Saving</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(bundle.savings)} ({bundle.savingsPercent}%)
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Can build</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(bundle.buildableQuantity)}
                </dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <BundleRowActions bundle={bundle} {...rowActions} />
            </div>
          </div>
        )}
      />

      <BundleFormModal open={formOpen} onOpenChange={setFormOpen} bundle={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="The bundle stops being offered. The products inside it are left untouched."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
