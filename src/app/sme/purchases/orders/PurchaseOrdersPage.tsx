import { ActionButton } from "@/components/shared/action-button";
import { FulfilmentDialog, type FulfilmentRow } from "@/components/shared/fulfilment-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { RecordPaymentDialog } from "@/components/shared/record-payment-dialog";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useCancelPurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useGetPurchaseOrderSummaryQuery,
  useGetPurchaseOrdersQuery,
  usePlacePurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
  useRecordPurchasePaymentMutation,
} from "@/redux/apis/purchaseOrderApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PURCHASE_ORDER_STATUSES,
  PURCHASE_ORDER_STATUS_COLORS,
  PURCHASE_ORDER_STATUS_LABELS,
  type PurchaseOrder,
  type PurchaseOrderStatus,
} from "@/types/domain/purchaseOrder";
import {
  TRADE_PAYMENT_STATUSES,
  TRADE_PAYMENT_STATUS_LABELS,
  type TradePaymentStatus,
} from "@/types/domain/trade";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { PurchaseOrderFormModal } from "./components/PurchaseOrderFormModal";
import { purchaseOrderColumns } from "./orders.columns";

type PendingAction = { kind: "cancel" | "delete"; order: PurchaseOrder } | null;

export default function PurchaseOrdersPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/purchases/orders");

  const { data: supplierOptions = [] } = useGetSupplierOptionsQuery();
  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: PURCHASE_ORDER_STATUSES.map((status) => ({
          label: PURCHASE_ORDER_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "paymentStatus",
        label: "Payment",
        type: "select",
        options: TRADE_PAYMENT_STATUSES.map((status) => ({
          label: TRADE_PAYMENT_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "supplierId",
        label: "Supplier",
        type: "select",
        options: supplierOptions.map((supplier) => ({
          label: supplier.name,
          value: supplier._id,
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
    [supplierOptions, warehouseOptions]
  );

  const { data, isLoading, isFetching } = useGetPurchaseOrdersQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as PurchaseOrderStatus | undefined,
    paymentStatus: filters.paymentStatus as TradePaymentStatus | undefined,
    supplierId: filters.supplierId as string | undefined,
    warehouseId: filters.warehouseId as string | undefined,
  });

  const { data: summary } = useGetPurchaseOrderSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PurchaseOrder | null>(null);
  const [receiving, setReceiving] = React.useState<PurchaseOrder | null>(null);
  const [paying, setPaying] = React.useState<PurchaseOrder | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [placeOrder] = usePlacePurchaseOrderMutation();
  const [receiveOrder, { isLoading: isReceiving }] = useReceivePurchaseOrderMutation();
  const [recordPayment, { isLoading: isPaying }] = useRecordPurchasePaymentMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelPurchaseOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeletePurchaseOrderMutation();

  const run = async (action: Promise<unknown>, success: string, failure: string) => {
    try {
      await action;
      toast.success(success);
      return true;
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || failure);
      return false;
    }
  };

  const columns = React.useMemo(
    () =>
      purchaseOrderColumns({
        onEdit: (order) => {
          setEditing(order);
          setFormOpen(true);
        },
        onPlace: (order) =>
          void run(
            placeOrder(order._id).unwrap(),
            `${order.orderNumber} placed with the supplier`,
            "Could not place the order"
          ),
        onReceive: setReceiving,
        onPay: setPaying,
        onCancel: (order) => setPending({ kind: "cancel", order }),
        onDelete: (order) => setPending({ kind: "delete", order }),
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete, placeOrder]
  );

  const receiveRows = React.useMemo<FulfilmentRow[]>(
    () =>
      (receiving?.items ?? []).map((item) => ({
        itemId: item._id,
        name: item.name,
        sku: item.sku,
        ordered: item.quantity,
        done: item.receivedQuantity,
        pending: item.pendingQuantity,
      })),
    [receiving]
  );

  const confirmPending = async () => {
    if (!pending) return;

    if (pending.kind === "cancel") {
      await run(
        cancelOrder(pending.order._id).unwrap(),
        `${pending.order.orderNumber} cancelled`,
        "Could not cancel the order"
      );
    } else {
      await run(
        deleteOrder(pending.order._id).unwrap(),
        "Purchase order deleted",
        "Could not delete the order"
      );
    }

    setPending(null);
  };

  const orders = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Purchase orders"
        description="What you have ordered from suppliers, what has arrived and what you still owe."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Orders</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Awaiting delivery</StatLabel>
          <StatValue>{summary?.openCount ?? 0}</StatValue>
          <StatDescription>{summary?.draftCount ?? 0} still in draft</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Ordered value</StatLabel>
          <StatValue>{formatAmount(summary?.orderedValue ?? 0)}</StatValue>
          <StatDescription>Across live and received orders</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Owed to suppliers</StatLabel>
          <StatValue>{formatAmount(summary?.outstandingPayable ?? 0)}</StatValue>
          <StatDescription>Invoiced by suppliers but not yet paid</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search purchase orders..."
        filters={tableFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New order"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} purchase orders. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        pagination={
          meta
            ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
            : undefined
        }
        onPageChange={(page) => setFilter("page", page)}
        onLimitChange={(limit) => setFilter("limit", limit)}
        getRowId={(row) => row._id}
        mobileCard={(order) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">{order.orderNumber}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {order.supplier?.name ?? order.supplierName} · {formatDate(order.orderDate)}
                </p>
              </div>
              <StatusBadge
                color={PURCHASE_ORDER_STATUS_COLORS[order.status] as StatusColor}
                label={PURCHASE_ORDER_STATUS_LABELS[order.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Received</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(order.receivedQuantity)} / {formatNumber(order.totalQuantity)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-medium tabular-nums">{formatAmount(order.grandTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Balance due</dt>
                <dd className="font-medium tabular-nums">{formatAmount(order.balanceDue)}</dd>
              </div>
            </dl>
          </div>
        )}
      />

      <PurchaseOrderFormModal open={formOpen} onOpenChange={setFormOpen} order={editing} />

      <FulfilmentDialog
        open={Boolean(receiving)}
        onOpenChange={(open) => !open && setReceiving(null)}
        title={`Receive stock on ${receiving?.orderNumber ?? ""}`}
        description={`Stock lands in ${receiving?.warehouse?.name ?? "the order warehouse"} as soon as you confirm.`}
        doneLabel="Received"
        rows={receiveRows}
        isLoading={isReceiving}
        confirmText="Receive stock"
        onSubmit={async (items) => {
          if (!receiving) return;
          const ok = await run(
            receiveOrder({ id: receiving._id, body: { items } }).unwrap(),
            `Stock received on ${receiving.orderNumber}`,
            "Could not receive the stock"
          );
          if (ok) setReceiving(null);
        }}
      />

      <RecordPaymentDialog
        open={Boolean(paying)}
        onOpenChange={(open) => !open && setPaying(null)}
        title={`Pay ${paying?.supplier?.name ?? paying?.supplierName ?? "supplier"}`}
        description={`Recorded against ${paying?.orderNumber ?? ""}.`}
        outstanding={paying?.balanceDue ?? 0}
        isLoading={isPaying}
        onSubmit={async (body) => {
          if (!paying) return;
          const ok = await run(
            recordPayment({ id: paying._id, body }).unwrap(),
            `Payment recorded on ${paying.orderNumber}`,
            "Could not record the payment"
          );
          if (ok) setPaying(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={
          pending?.kind === "cancel"
            ? `Cancel ${pending.order.orderNumber}?`
            : `Delete ${pending?.order.orderNumber ?? ""}?`
        }
        description={
          pending?.kind === "cancel"
            ? "An order that has already received stock cannot be cancelled. Raise a purchase return instead."
            : "Only orders with no receipts and no payments can be deleted."
        }
        confirmText={pending?.kind === "cancel" ? "Cancel order" : "Delete"}
        variant="destructive"
        isLoading={isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
