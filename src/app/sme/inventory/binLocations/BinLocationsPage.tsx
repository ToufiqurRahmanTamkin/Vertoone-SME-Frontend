import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatNumber } from "@/lib/amount";
import {
  useDeleteBinLocationMutation,
  useGetBinLocationSummaryQuery,
  useGetBinLocationsQuery,
} from "@/redux/apis/binLocationApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  BIN_LOCATION_TYPES,
  BIN_LOCATION_TYPE_LABELS,
  type BinLocation,
  type BinLocationType,
} from "@/types/domain/binLocation";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { BinRowActions, binColumns } from "./bin-locations.columns";
import { BinLocationFormModal } from "./components/BinLocationFormModal";

export default function BinLocationsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/inventory/bin-locations");

  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();

  const { data, isLoading, isFetching } = useGetBinLocationsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    warehouseId: filters.warehouseId as string | undefined,
    type: filters.type as BinLocationType | undefined,
    isActive: filters.isActive === undefined ? undefined : filters.isActive === "true",
  });

  const { data: summary } = useGetBinLocationSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BinLocation | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<BinLocation | null>(null);
  const [deleteBin, { isLoading: isDeleting }] = useDeleteBinLocationMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "warehouseId",
        label: "Warehouse",
        type: "select",
        options: warehouses.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse._id,
        })),
      },
      {
        name: "type",
        label: "Used for",
        type: "select",
        options: BIN_LOCATION_TYPES.map((type) => ({
          label: BIN_LOCATION_TYPE_LABELS[type],
          value: type,
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
    [warehouses]
  );

  const rowActions = React.useMemo(
    () => ({
      onEdit: (bin: BinLocation) => {
        setEditing(bin);
        setFormOpen(true);
      },
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => binColumns(rowActions), [rowActions]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteBin(pendingDelete._id).unwrap();
      toast.success("Bin deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the bin");
    }
  };

  const bins = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Bin locations"
        description="Aisles, racks and bins inside each warehouse, and what is kept in them."
        actions={<BackLink to="/sme/inventory/overview" label="Inventory overview" />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Bins</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Active</StatLabel>
          <StatValue>{formatNumber(summary?.activeCount ?? 0)}</StatValue>
          <StatDescription>
            Across {formatNumber(summary?.warehouseCount ?? 0)} warehouses
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Products placed</StatLabel>
          <StatValue>{formatNumber(summary?.assignedProductCount ?? 0)}</StatValue>
          <StatDescription>Products with a home on the shelf</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Empty bins</StatLabel>
          <StatValue>{formatNumber(summary?.emptyCount ?? 0)}</StatValue>
          <StatDescription>Space waiting to be filled</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search bins by code, aisle or rack..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New bin"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} bins. Delete one or upgrade to add more.`
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
          You have used all {limit} bins your plan allows. Delete one or upgrade your subscription
          to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={bins}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(bin) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">{bin.code}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {bin.warehouse?.name ?? "—"}
                </p>
              </div>
              <StatusBadge
                color={bin.isActive ? "green" : "zinc"}
                label={bin.isActive ? "Active" : "Inactive"}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Where</dt>
                <dd className="truncate font-medium">{bin.path || "Not mapped"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Used for</dt>
                <dd className="font-medium">{BIN_LOCATION_TYPE_LABELS[bin.type]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Products</dt>
                <dd className="font-medium tabular-nums">{bin.productCount}</dd>
              </div>
            </dl>

            {bin.products.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {bin.products.slice(0, 4).map((product) => (
                  <Badge key={product._id} variant="secondary" className="text-[10px]">
                    {product.name}
                  </Badge>
                ))}
                {bin.products.length > 4 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{bin.products.length - 4}
                  </Badge>
                )}
              </div>
            )}

            <div className="mt-3 border-t pt-3">
              <BinRowActions bin={bin} {...rowActions} />
            </div>
          </div>
        )}
      />

      <BinLocationFormModal open={formOpen} onOpenChange={setFormOpen} bin={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete bin "${pendingDelete?.code ?? ""}"?`}
        description="The spot is removed. Stock levels and products themselves are left untouched."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
