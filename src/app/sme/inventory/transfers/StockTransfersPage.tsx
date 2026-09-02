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
  useCancelStockTransferMutation,
  useDeleteStockTransferMutation,
  useDispatchStockTransferMutation,
  useGetStockTransferSummaryQuery,
  useGetStockTransfersQuery,
  useReceiveStockTransferMutation,
} from "@/redux/apis/stockTransferApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import {
  STOCK_TRANSFER_STATUSES,
  STOCK_TRANSFER_STATUS_COLORS,
  STOCK_TRANSFER_STATUS_LABELS,
  type StockTransfer,
  type StockTransferStatus,
} from "@/types/domain/stockTransfer";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { StockTransferFormModal } from "./components/StockTransferFormModal";
import { transferColumns } from "./transfers.columns";

type PendingAction = { kind: "cancel" | "delete"; transfer: StockTransfer } | null;

export default function StockTransfersPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/inventory/stock-transfers");

  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: STOCK_TRANSFER_STATUSES.map((status) => ({
          label: STOCK_TRANSFER_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "fromWarehouseId",
        label: "From",
        type: "select",
        options: warehouseOptions.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse._id,
        })),
      },
      {
        name: "toWarehouseId",
        label: "To",
        type: "select",
        options: warehouseOptions.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse._id,
        })),
      },
    ],
    [warehouseOptions]
  );

  const { data, isLoading, isFetching } = useGetStockTransfersQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as StockTransferStatus | undefined,
    fromWarehouseId: filters.fromWarehouseId as string | undefined,
    toWarehouseId: filters.toWarehouseId as string | undefined,
  });

  const { data: summary } = useGetStockTransferSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<StockTransfer | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [dispatchTransfer] = useDispatchStockTransferMutation();
  const [receiveTransfer] = useReceiveStockTransferMutation();
  const [cancelTransfer, { isLoading: isCancelling }] = useCancelStockTransferMutation();
  const [deleteTransfer, { isLoading: isDeleting }] = useDeleteStockTransferMutation();

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
      transferColumns({
        onEdit: (transfer) => {
          setEditing(transfer);
          setFormOpen(true);
        },
        onDispatch: (transfer) =>
          void run(
            dispatchTransfer(transfer._id).unwrap(),
            `${transfer.transferNumber} dispatched`,
            "Could not dispatch the transfer"
          ),
        onReceive: (transfer) =>
          void run(
            receiveTransfer(transfer._id).unwrap(),
            `${transfer.transferNumber} received`,
            "Could not receive the transfer"
          ),
        onCancel: (transfer) => setPending({ kind: "cancel", transfer }),
        onDelete: (transfer) => setPending({ kind: "delete", transfer }),
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete, dispatchTransfer, receiveTransfer]
  );

  const confirmPending = async () => {
    if (!pending) return;

    if (pending.kind === "cancel") {
      await run(
        cancelTransfer(pending.transfer._id).unwrap(),
        `${pending.transfer.transferNumber} cancelled`,
        "Could not cancel the transfer"
      );
    } else {
      await run(
        deleteTransfer(pending.transfer._id).unwrap(),
        "Transfer deleted",
        "Could not delete the transfer"
      );
    }

    setPending(null);
  };

  const transfers = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Stock transfers"
        description="Move stock between warehouses. Nothing leaves the shelf until you dispatch."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Transfers</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Draft</StatLabel>
          <StatValue>{summary?.draftCount ?? 0}</StatValue>
          <StatDescription>Not dispatched yet</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>In transit</StatLabel>
          <StatValue>{summary?.inTransitCount ?? 0}</StatValue>
          <StatDescription>Off the source shelf, not yet received</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Value in transit</StatLabel>
          <StatValue>{formatAmount(summary?.inTransitValue ?? 0)}</StatValue>
          <StatDescription>At the source warehouse cost</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search transfers..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New transfer"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} transfers. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      <DataTable
        columns={columns}
        data={transfers}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(transfer) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">
                  {transfer.transferNumber}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(transfer.transferDate)}
                </p>
              </div>
              <StatusBadge
                color={STOCK_TRANSFER_STATUS_COLORS[transfer.status] as StatusColor}
                label={STOCK_TRANSFER_STATUS_LABELS[transfer.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">From</dt>
                <dd className="font-medium">{transfer.fromWarehouse?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">To</dt>
                <dd className="font-medium">{transfer.toWarehouse?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Units</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(transfer.totalQuantity)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      />

      <StockTransferFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        transfer={editing}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.kind === "cancel"
            ? `Cancel ${pending.transfer.transferNumber}?`
            : `Delete ${pending?.transfer.transferNumber ?? ""}?`
        }
        description={
          pending?.kind === "cancel"
            ? "Stock already dispatched is put back on the source shelf."
            : "The transfer is removed. Only drafts and cancelled transfers can be deleted."
        }
        confirmText={pending?.kind === "cancel" ? "Cancel transfer" : "Delete"}
        variant="destructive"
        isLoading={isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
