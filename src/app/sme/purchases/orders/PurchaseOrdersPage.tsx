import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { RecordPaymentDialog } from "@/components/shared/record-payment-dialog";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  useCancelPurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useGetPurchaseOrderSummaryQuery,
  useGetPurchaseOrdersQuery,
  usePlacePurchaseOrderMutation,
  useRecordPurchasePaymentMutation,
} from "@/redux/apis/purchaseOrderApis";
import { useGetSupplierOptionsQuery } from "@/redux/apis/supplierApis";
import { useGetPublicSystemConfigQuery } from "@/redux/apis/systemConfigApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PURCHASE_ORDER_SOURCES,
  PURCHASE_ORDER_SOURCE_LABELS,
  PURCHASE_ORDER_SOURCE_PATHS,
  PURCHASE_ORDER_STATUSES,
  PURCHASE_ORDER_STATUS_COLORS,
  PURCHASE_ORDER_STATUS_LABELS,
  type PurchaseOrder,
  type PurchaseOrderSource,
  type PurchaseOrderStatus,
} from "@/types/domain/purchaseOrder";
import {
  TRADE_PAYMENT_STATUSES,
  TRADE_PAYMENT_STATUS_LABELS,
  type TradePaymentStatus,
} from "@/types/domain/trade";
import { Plus } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { GoodsReceiptFormModal } from "../goodsReceipts/components/GoodsReceiptFormModal";
import { PurchaseOrderFormModal } from "./components/PurchaseOrderFormModal";
import { PurchaseOrderRowActions, purchaseOrderColumns } from "./orders.columns";

type PendingAction = { kind: "cancel" | "delete"; order: PurchaseOrder } | null;

export default function PurchaseOrdersPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const navigate = useNavigate();
  const access = useModulePermission("/sme/purchases/orders");
  const receiptAccess = useModulePermission("/sme/purchases/goods-receipts");
  const billAccess = useModulePermission("/sme/purchases/bills");
  const requisitionAccess = useModulePermission("/sme/purchases/requisitions");
  const rfqAccess = useModulePermission("/sme/purchases/rfq");

  const { data: systemConfig } = useGetPublicSystemConfigQuery();
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
        name: "sourceType",
        label: "Raised from",
        type: "select",
        options: PURCHASE_ORDER_SOURCES.map((source) => ({
          label: PURCHASE_ORDER_SOURCE_LABELS[source],
          value: source,
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
    sourceType: filters.sourceType as PurchaseOrderSource | undefined,
    paymentStatus: filters.paymentStatus as TradePaymentStatus | undefined,
    supplierId: filters.supplierId as string | undefined,
    warehouseId: filters.warehouseId as string | undefined,
  });

  const { data: summary } = useGetPurchaseOrderSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<PurchaseOrder | null>(null);
  const [receivingOrderId, setReceivingOrderId] = React.useState<string | null>(null);
  const [paying, setPaying] = React.useState<PurchaseOrder | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [placeOrder] = usePlacePurchaseOrderMutation();
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

  const rowActions = React.useMemo(
    () => ({
      onEdit: (order: PurchaseOrder) => {
        setEditing(order);
        setFormOpen(true);
      },
      onPlace: (order: PurchaseOrder) =>
        void run(
          placeOrder(order._id).unwrap(),
          `${order.orderNumber} placed with the supplier`,
          "Could not place the order"
        ),
      onReceive: (order: PurchaseOrder) => setReceivingOrderId(order._id),
      onViewReceipts: (order: PurchaseOrder) =>
        navigate(`/sme/purchases/goods-receipts?search=${order.orderNumber}`),
      onViewBills: (order: PurchaseOrder) =>
        navigate(`/sme/purchases/bills?search=${order.orderNumber}`),
      onViewSource: (order: PurchaseOrder) => {
        const path = PURCHASE_ORDER_SOURCE_PATHS[order.sourceType];
        if (path) navigate(`${path}?search=${order.sourceNumber}`);
      },
      onPay: setPaying,
      onCancel: (order: PurchaseOrder) => setPending({ kind: "cancel", order }),
      onDelete: (order: PurchaseOrder) => setPending({ kind: "delete", order }),
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canReceive: receiptAccess.canCreate,
      canViewBills: billAccess.canView,
      canViewSource: requisitionAccess.canView || rfqAccess.canView,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      access.canEdit,
      access.canDelete,
      receiptAccess.canCreate,
      billAccess.canView,
      requisitionAccess.canView,
      rfqAccess.canView,
    ]
  );

  const columns = React.useMemo(() => purchaseOrderColumns(rowActions), [rowActions]);

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
        actions={
          <>
            <CurrencyNote currency={systemConfig?.defaultCurrency ?? "BDT"} />
            <BackLink to="/sme/purchases/overview" label="Purchases overview" />
          </>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Orders</StatLabel>
          <StatValue>{formatNumber(used)}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Awaiting delivery</StatLabel>
          <StatValue>{formatNumber(summary?.openCount ?? 0)}</StatValue>
          <StatDescription>
            {formatNumber(summary?.draftCount ?? 0)} still in draft
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Ordered value</StatLabel>
          <StatValue>{formatAmountValue(summary?.orderedValue)}</StatValue>
          <StatDescription>Across live and received orders</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Owed to suppliers</StatLabel>
          <StatValue>{formatAmountValue(summary?.outstandingPayable)}</StatValue>
          <StatDescription>Ordered but not yet paid for</StatDescription>
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
        expandableContent={(order) => (
          <ul className="divide-y rounded-lg border">
            {order.items.map((item) => (
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
                    {formatNumber(item.receivedQuantity)} / {formatNumber(item.quantity)} received
                  </p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {formatAmountValue(item.total)}
                    {item.returnedQuantity > 0
                      ? ` · ${formatNumber(item.returnedQuantity)} sent back`
                      : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        mobileCard={(order) => (
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold uppercase">{order.orderNumber}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {order.supplier?.name ?? order.supplierName} · {formatDate(order.orderDate)}
                  {order.sourceNumber ? ` · ${order.sourceNumber}` : ""}
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
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(order.grandTotal)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Balance due</dt>
                <dd className="font-medium tabular-nums">
                  {formatAmountValue(order.balanceDue)}
                </dd>
              </div>
            </dl>

            <div className="mt-3 border-t pt-3">
              <PurchaseOrderRowActions order={order} {...rowActions} />
            </div>
          </div>
        )}
      />

      <PurchaseOrderFormModal open={formOpen} onOpenChange={setFormOpen} order={editing} />

      <GoodsReceiptFormModal
        open={Boolean(receivingOrderId)}
        onOpenChange={(open) => !open && setReceivingOrderId(null)}
        presetOrderId={receivingOrderId}
      />

      <RecordPaymentDialog
        open={Boolean(paying)}
        onOpenChange={(open) => !open && setPaying(null)}
        title={`Pay ${paying?.supplier?.name ?? paying?.supplierName ?? "supplier"}`}
        description={`Recorded against ${paying?.orderNumber ?? ""} as an advance and listed under Payments Made.`}
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
            ? "An order that has already received stock cannot be cancelled. Cancel its goods receipts first."
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
