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
  useDeleteBatchMutation,
  useGetBatchSummaryQuery,
  useGetBatchesQuery,
} from "@/redux/apis/inventoryBatchApis";
import { useGetProductOptionsQuery } from "@/redux/apis/productApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  BATCH_STATUSES,
  BATCH_STATUS_COLORS,
  BATCH_STATUS_LABELS,
  type BatchStatus,
  type InventoryBatch,
} from "@/types/domain/inventoryBatch";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { BatchRowActions, batchColumns, expiryLabel } from "./batches.columns";
import { BatchFormModal } from "./components/BatchFormModal";

export default function BatchesPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/inventory/batches");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();
  const { data: products = [] } = useGetProductOptionsQuery();

  const { data, isLoading, isFetching } = useGetBatchesQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    productId: filters.productId as string | undefined,
    warehouseId: filters.warehouseId as string | undefined,
    status: filters.status as BatchStatus | undefined,
  });

  const { data: summary } = useGetBatchSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<InventoryBatch | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<InventoryBatch | null>(null);
  const [deleteBatch, { isLoading: isDeleting }] = useDeleteBatchMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: BATCH_STATUSES.map((status) => ({
          label: BATCH_STATUS_LABELS[status],
          value: status,
        })),
      },
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
        name: "productId",
        label: "Product",
        type: "select",
        options: products.map((product) => ({ label: product.name, value: product._id })),
      },
    ],
    [warehouses, products]
  );

  const rowActions = React.useMemo(
    () => ({
      onEdit: (batch: InventoryBatch) => {
        setEditing(batch);
        setFormOpen(true);
      },
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => batchColumns(rowActions), [rowActions]);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteBatch(pendingDelete._id).unwrap();
      toast.success("Batch deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the batch");
    }
  };

  const batches = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Batches & expiry"
        description="Batch numbers, manufacture dates and what is running out of shelf life."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/inventory/overview" label="Inventory overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Batches</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Expiring soon</StatLabel>
          <StatValue>{formatNumber(summary?.expiringCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.expiredCount ?? 0)} already past their date
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Tracked stock</StatLabel>
          <StatValue>{formatNumber(summary?.trackedQuantity ?? 0)}</StatValue>
          <StatDescription>Units sitting in a batch</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>At risk</StatLabel>
          <StatValue>{formatAmountValue(summary?.expiringValue)}</StatValue>
          <StatDescription>
            Of {formatAmountValue(summary?.stockValue)} held in batches
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search batches by number or lot..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New batch"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} batches. Delete one or upgrade to add more.`
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
          You have used all {limit} batches your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={batches}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(batch) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">{batch.batchNumber}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {batch.product?.name ?? "—"}
                </p>
              </div>
              <StatusBadge
                color={BATCH_STATUS_COLORS[batch.status]}
                label={BATCH_STATUS_LABELS[batch.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Held at</dt>
                <dd className="truncate font-medium">{batch.warehouse?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Remaining</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(batch.quantity)} of {formatNumber(batch.initialQuantity)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Value</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(batch.stockValue)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Expiry</dt>
                <dd className="font-medium">{expiryLabel(batch)}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <BatchRowActions batch={batch} {...rowActions} />
            </div>
          </div>
        )}
      />

      <BatchFormModal open={formOpen} onOpenChange={setFormOpen} batch={editing} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete batch "${pendingDelete?.batchNumber ?? ""}"?`}
        description="The batch record is removed. Stock levels themselves are left untouched."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
