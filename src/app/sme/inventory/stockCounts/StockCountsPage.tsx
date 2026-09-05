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
import { formatDate } from "@/lib/date";
import {
  useCancelStockCountMutation,
  useCompleteStockCountMutation,
  useDeleteStockCountMutation,
  useGetStockCountSummaryQuery,
  useGetStockCountsQuery,
  useStartStockCountMutation,
} from "@/redux/apis/stockCountApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  STOCK_COUNT_STATUSES,
  STOCK_COUNT_STATUS_COLORS,
  STOCK_COUNT_STATUS_LABELS,
  type StockCount,
  type StockCountStatus,
} from "@/types/domain/stockCount";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { StockCountFormModal } from "./components/StockCountFormModal";
import { StockCountRowActions, stockCountColumns } from "./stock-counts.columns";

export default function StockCountsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/inventory/stock-counts");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
  const { data: warehouses = [] } = useGetWarehouseOptionsQuery();

  const { data, isLoading, isFetching } = useGetStockCountsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    warehouseId: filters.warehouseId as string | undefined,
    status: filters.status as StockCountStatus | undefined,
  });

  const { data: summary } = useGetStockCountSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StockCount | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<StockCount | null>(null);
  const [pendingComplete, setPendingComplete] = React.useState<StockCount | null>(null);
  const [pendingCancel, setPendingCancel] = React.useState<StockCount | null>(null);

  const [startCount] = useStartStockCountMutation();
  const [completeCount, { isLoading: isCompleting }] = useCompleteStockCountMutation();
  const [cancelCount, { isLoading: isCancelling }] = useCancelStockCountMutation();
  const [deleteCount, { isLoading: isDeleting }] = useDeleteStockCountMutation();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: STOCK_COUNT_STATUSES.map((status) => ({
          label: STOCK_COUNT_STATUS_LABELS[status],
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
    ],
    [warehouses]
  );

  const runStart = async (count: StockCount) => {
    try {
      await startCount(count._id).unwrap();
      toast.success(`Count ${count.countNumber} is under way`);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not start the count");
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onEdit: (count: StockCount) => {
        setEditing(count);
        setFormOpen(true);
      },
      onStart: runStart,
      onComplete: setPendingComplete,
      onCancel: setPendingCancel,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => stockCountColumns(rowActions), [rowActions]);

  const confirmComplete = async () => {
    if (!pendingComplete) return;
    try {
      await completeCount(pendingComplete._id).unwrap();
      toast.success("Count closed and posted to stock");
      setPendingComplete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not close the count");
    }
  };

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    try {
      await cancelCount(pendingCancel._id).unwrap();
      toast.success("Count cancelled");
      setPendingCancel(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not cancel the count");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCount(pendingDelete._id).unwrap();
      toast.success("Count deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the count");
    }
  };

  const counts = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Stock counts"
        description="Physical counts, the variances they turn up, and the corrections they post to stock."
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/inventory/overview" label="Inventory overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Counts</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Open now</StatLabel>
          <StatValue>{formatNumber((summary?.draftCount ?? 0) + (summary?.inProgressCount ?? 0))}</StatValue>
          <StatDescription>
            {formatNumber(summary?.completedCount ?? 0)} closed and posted
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Units found</StatLabel>
          <StatValue>{formatNumber(summary?.gainUnits ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.lossUnits ?? 0)} units short across closed counts
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Value impact</StatLabel>
          <StatValue>{formatAmountValue(summary?.varianceValue)}</StatValue>
          <StatDescription>Net effect of every closed count</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search counts by number or reference..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New count"
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} counts. Delete one or upgrade to add more.`
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
          You have used all {limit} stock counts your plan allows. Delete one or upgrade your
          subscription to add more.
        </p>
      )}

      <DataTable
        columns={columns}
        data={counts}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        expandableContent={(count) => (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Lines that came up short or over
            </p>
            {count.items.filter((item) => item.variance !== 0).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Every line matched the system figure.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {count.items
                  .filter((item) => item.variance !== 0)
                  .map((item) => (
                    <li
                      key={item._id}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.name}</p>
                        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                          {item.sku}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="tabular-nums">
                          {formatNumber(item.systemQuantity)} →{" "}
                          {formatNumber(item.countedQuantity)}
                        </p>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {item.variance > 0 ? "+" : ""}
                          {formatNumber(item.variance)} ·{" "}
                          {formatAmountValue(item.varianceValue)}
                        </p>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}
        mobileCard={(count) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">{count.countNumber}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(count.countDate)} · {count.warehouse?.name ?? "—"}
                </p>
              </div>
              <StatusBadge
                color={STOCK_COUNT_STATUS_COLORS[count.status]}
                label={STOCK_COUNT_STATUS_LABELS[count.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Lines</dt>
                <dd className="font-medium tabular-nums">
                  {count.itemCount} ({count.varianceItems} off)
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Variance</dt>
                <dd className="font-medium tabular-nums">
                  +{formatNumber(count.gainUnits)} / −{formatNumber(count.lossUnits)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Value</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(count.varianceValue)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Accuracy</dt>
                <dd className="font-medium tabular-nums">{count.accuracyPercent}%</dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <StockCountRowActions count={count} {...rowActions} />
            </div>
          </div>
        )}
      />

      <StockCountFormModal open={formOpen} onOpenChange={setFormOpen} count={editing} />

      <ConfirmDialog
        open={Boolean(pendingComplete)}
        onOpenChange={(open) => !open && setPendingComplete(null)}
        title={`Close count ${pendingComplete?.countNumber ?? ""}?`}
        description="Every variance is posted to stock as a movement. This cannot be edited afterwards."
        confirmText="Close and post"
        isLoading={isCompleting}
        onConfirm={confirmComplete}
      />

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        onOpenChange={(open) => !open && setPendingCancel(null)}
        title={`Cancel count ${pendingCancel?.countNumber ?? ""}?`}
        description="If the count was already posted, its stock movements are reversed."
        confirmText="Cancel count"
        variant="destructive"
        isLoading={isCancelling}
        onConfirm={confirmCancel}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete count ${pendingDelete?.countNumber ?? ""}?`}
        description="Only counts that have not been posted can be deleted."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
