import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  useApproveStockAdjustmentMutation,
  useCancelStockAdjustmentMutation,
  useDeleteStockAdjustmentMutation,
  useGetStockAdjustmentSummaryQuery,
  useGetStockAdjustmentsQuery,
} from "@/redux/apis/stockAdjustmentApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import {
  STOCK_ADJUSTMENT_REASONS,
  STOCK_ADJUSTMENT_REASON_LABELS,
  STOCK_ADJUSTMENT_STATUSES,
  STOCK_ADJUSTMENT_STATUS_COLORS,
  STOCK_ADJUSTMENT_STATUS_LABELS,
  type StockAdjustment,
  type StockAdjustmentReason,
  type StockAdjustmentStatus,
} from "@/types/domain/stockAdjustment";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { adjustmentColumns } from "./adjustments.columns";
import { StockAdjustmentFormModal } from "./components/StockAdjustmentFormModal";

type PendingAction =
  | { kind: "approve" | "cancel" | "delete"; adjustment: StockAdjustment }
  | null;

export default function StockAdjustmentsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/inventory/stock-adjustments");

  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: STOCK_ADJUSTMENT_STATUSES.map((status) => ({
          label: STOCK_ADJUSTMENT_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "reason",
        label: "Reason",
        type: "select",
        options: STOCK_ADJUSTMENT_REASONS.map((reason) => ({
          label: STOCK_ADJUSTMENT_REASON_LABELS[reason],
          value: reason,
        })),
      },
      {
        name: "warehouseId",
        label: "Warehouse",
        type: "select",
        options: warehouseOptions.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse._id,
        })),
      },
    ],
    [warehouseOptions]
  );

  const { data, isLoading, isFetching } = useGetStockAdjustmentsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as StockAdjustmentStatus | undefined,
    reason: filters.reason as StockAdjustmentReason | undefined,
    warehouseId: filters.warehouseId as string | undefined,
  });

  const { data: summary } = useGetStockAdjustmentSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StockAdjustment | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [approveAdjustment, { isLoading: isApproving }] = useApproveStockAdjustmentMutation();
  const [cancelAdjustment, { isLoading: isCancelling }] = useCancelStockAdjustmentMutation();
  const [deleteAdjustment, { isLoading: isDeleting }] = useDeleteStockAdjustmentMutation();

  const run = async (action: Promise<unknown>, success: string, failure: string) => {
    try {
      await action;
      toast.success(success);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || failure);
    }
  };

  const columns = React.useMemo(
    () =>
      adjustmentColumns({
        onEdit: (adjustment) => {
          setEditing(adjustment);
          setFormOpen(true);
        },
        onApprove: (adjustment) => setPending({ kind: "approve", adjustment }),
        onCancel: (adjustment) => setPending({ kind: "cancel", adjustment }),
        onDelete: (adjustment) => setPending({ kind: "delete", adjustment }),
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const confirmPending = async () => {
    if (!pending) return;
    const { adjustmentNumber, _id } = pending.adjustment;

    if (pending.kind === "approve") {
      await run(
        approveAdjustment(_id).unwrap(),
        `${adjustmentNumber} approved and stock updated`,
        "Could not approve the adjustment"
      );
    } else if (pending.kind === "cancel") {
      await run(
        cancelAdjustment(_id).unwrap(),
        `${adjustmentNumber} cancelled`,
        "Could not cancel the adjustment"
      );
    } else {
      await run(
        deleteAdjustment(_id).unwrap(),
        "Adjustment deleted",
        "Could not delete the adjustment"
      );
    }

    setPending(null);
  };

  const adjustments = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const confirmCopy = () => {
    if (!pending) return { title: "", description: "", confirmText: "Confirm" };

    if (pending.kind === "approve") {
      return {
        title: `Approve ${pending.adjustment.adjustmentNumber}?`,
        description:
          "Stock moves as soon as you approve. Cancelling later puts the movement back.",
        confirmText: "Approve",
      };
    }
    if (pending.kind === "cancel") {
      return {
        title: `Cancel ${pending.adjustment.adjustmentNumber}?`,
        description: "Any stock this adjustment moved is put back the way it was.",
        confirmText: "Cancel adjustment",
      };
    }
    return {
      title: `Delete ${pending.adjustment.adjustmentNumber}?`,
      description: "Only drafts and cancelled adjustments can be deleted.",
      confirmText: "Delete",
    };
  };

  const copy = confirmCopy();

  return (
    <>
      <PageHeader
        title="Stock adjustments"
        description="Corrections from stock counts, damage and loss. Nothing moves until approved."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Adjustments</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Awaiting approval</StatLabel>
          <StatValue>{summary?.draftCount ?? 0}</StatValue>
          <StatDescription>Drafts that have not touched stock yet</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Units corrected</StatLabel>
          <StatValue>
            {formatNumber((summary?.increaseQuantity ?? 0) + (summary?.decreaseQuantity ?? 0))}
          </StatValue>
          <StatDescription>
            +{formatNumber(summary?.increaseQuantity ?? 0)} in, −
            {formatNumber(summary?.decreaseQuantity ?? 0)} out
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Value impact</StatLabel>
          <StatValue>{formatAmount(summary?.valueImpact ?? 0)}</StatValue>
          <StatDescription>Across every approved adjustment</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search adjustments..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New adjustment"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} adjustments. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      <DataTable
        columns={columns}
        data={adjustments}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(adjustment) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">
                  {adjustment.adjustmentNumber}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(adjustment.adjustmentDate)} ·{" "}
                  {STOCK_ADJUSTMENT_REASON_LABELS[adjustment.reason]}
                </p>
              </div>
              <StatusBadge
                color={STOCK_ADJUSTMENT_STATUS_COLORS[adjustment.status] as StatusColor}
                label={STOCK_ADJUSTMENT_STATUS_LABELS[adjustment.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Warehouse</dt>
                <dd className="font-medium">{adjustment.warehouse?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Movement</dt>
                <dd className="font-medium tabular-nums">
                  +{formatNumber(adjustment.increaseQuantity)} / −
                  {formatNumber(adjustment.decreaseQuantity)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Value impact</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmount(adjustment.valueImpact)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      />

      <StockAdjustmentFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        adjustment={editing}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={copy.title}
        description={copy.description}
        confirmText={copy.confirmText}
        variant={pending?.kind === "approve" ? undefined : "destructive"}
        isLoading={isApproving || isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
