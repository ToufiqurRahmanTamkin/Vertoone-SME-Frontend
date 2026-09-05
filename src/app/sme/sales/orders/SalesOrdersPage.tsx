import { ActionButton } from "@/components/shared/action-button";
import { FulfilmentDialog, type FulfilmentRow } from "@/components/shared/fulfilment-dialog";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatAmount, formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetContactOptionsQuery } from "@/redux/apis/contactApis";
import { useInvoiceSalesOrderMutation } from "@/redux/apis/salesInvoiceApis";
import {
  useCancelSalesOrderMutation,
  useCompleteSalesOrderMutation,
  useConfirmSalesOrderMutation,
  useDeleteSalesOrderMutation,
  useDeliverSalesOrderMutation,
  useGetSalesOrderSummaryQuery,
  useGetSalesOrdersQuery,
} from "@/redux/apis/salesOrderApis";
import { useGetWarehouseOptionsQuery } from "@/redux/apis/warehouseApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  SALES_ORDER_STATUSES,
  SALES_ORDER_STATUS_COLORS,
  SALES_ORDER_STATUS_LABELS,
  type SalesOrder,
  type SalesOrderStatus,
} from "@/types/domain/salesOrder";
import { Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { InvoiceFromOrderDialog } from "./components/InvoiceFromOrderDialog";
import { SalesOrderFormModal } from "./components/SalesOrderFormModal";
import { salesOrderColumns } from "./orders.columns";

type PendingAction = {
  kind: "confirm" | "complete" | "cancel" | "delete";
  order: SalesOrder;
} | null;

export default function SalesOrdersPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/sme/sales/orders");

  const { data: contactOptions = [] } = useGetContactOptionsQuery();
  const { data: warehouseOptions = [] } = useGetWarehouseOptionsQuery();

  const tableFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: SALES_ORDER_STATUSES.map((status) => ({
          label: SALES_ORDER_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "customerId",
        label: "Customer",
        type: "select",
        options: contactOptions.map((contact) => ({
          label: contact.name || contact.email || contact.phone,
          value: contact._id,
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
    [contactOptions, warehouseOptions]
  );

  const { data, isLoading, isFetching } = useGetSalesOrdersQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status as SalesOrderStatus | undefined,
    customerId: filters.customerId as string | undefined,
    warehouseId: filters.warehouseId as string | undefined,
  });

  const { data: summary } = useGetSalesOrderSummaryQuery();
  const currency = summary?.currency ?? "BDT";

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SalesOrder | null>(null);
  const [delivering, setDelivering] = React.useState<SalesOrder | null>(null);
  const [invoicing, setInvoicing] = React.useState<SalesOrder | null>(null);
  const [pending, setPending] = React.useState<PendingAction>(null);

  const [confirmOrder, { isLoading: isConfirming }] = useConfirmSalesOrderMutation();
  const [deliverOrder, { isLoading: isDelivering }] = useDeliverSalesOrderMutation();
  const [completeOrder, { isLoading: isCompleting }] = useCompleteSalesOrderMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelSalesOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteSalesOrderMutation();
  const [invoiceOrder, { isLoading: isInvoicing }] = useInvoiceSalesOrderMutation();

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
      salesOrderColumns({
        onEdit: (order) => {
          setEditing(order);
          setFormOpen(true);
        },
        onConfirm: (order) => setPending({ kind: "confirm", order }),
        onDeliver: setDelivering,
        onInvoice: setInvoicing,
        onComplete: (order) => setPending({ kind: "complete", order }),
        onCancel: (order) => setPending({ kind: "cancel", order }),
        onDelete: (order) => setPending({ kind: "delete", order }),
        canEdit: access.canEdit,
        canDelete: access.canDelete,
      }),
    [access.canEdit, access.canDelete]
  );

  const deliverRows = React.useMemo<FulfilmentRow[]>(
    () =>
      (delivering?.items ?? []).map((item) => ({
        itemId: item._id,
        name: item.name,
        sku: item.sku,
        ordered: item.quantity,
        done: item.deliveredQuantity,
        pending: item.pendingQuantity,
      })),
    [delivering]
  );

  const confirmPending = async () => {
    if (!pending) return;

    const { order } = pending;

    if (pending.kind === "confirm") {
      await run(
        confirmOrder(order._id).unwrap(),
        `${order.orderNumber} confirmed and stock reserved`,
        "Could not confirm the order"
      );
    } else if (pending.kind === "complete") {
      await run(
        completeOrder(order._id).unwrap(),
        `${order.orderNumber} closed`,
        "Could not close the order"
      );
    } else if (pending.kind === "cancel") {
      await run(
        cancelOrder(order._id).unwrap(),
        `${order.orderNumber} cancelled`,
        "Could not cancel the order"
      );
    } else {
      await run(deleteOrder(order._id).unwrap(), "Sales order deleted", "Could not delete the order");
    }

    setPending(null);
  };

  const orders = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  const copy = (() => {
    if (!pending) return { title: "", description: "", confirmText: "Confirm" };
    if (pending.kind === "confirm") {
      return {
        title: `Confirm ${pending.order.orderNumber}?`,
        description:
          "The quantities are reserved in the warehouse so nothing else can be sold out from under this order. Stock only leaves the shelf when you deliver.",
        confirmText: "Confirm order",
      };
    }
    if (pending.kind === "complete") {
      return {
        title: `Close ${pending.order.orderNumber}?`,
        description:
          "Closing releases any leftover reservation and stops further delivery against this order.",
        confirmText: "Close order",
      };
    }
    if (pending.kind === "cancel") {
      return {
        title: `Cancel ${pending.order.orderNumber}?`,
        description:
          "Reserved stock is released back to available. Anything already delivered has to come back through a sales return.",
        confirmText: "Cancel order",
      };
    }
    return {
      title: `Delete ${pending.order.orderNumber}?`,
      description: "Only orders with nothing delivered against them can be deleted.",
      confirmText: "Delete",
    };
  })();

  return (
    <>
      <PageHeader
        title="Sales orders"
        description="What customers have committed to buy, what has shipped and what is still reserved."
        actions={<CurrencyNote currency={currency} />}
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
          <StatLabel>Open value</StatLabel>
          <StatValue>{formatAmountValue(summary?.openValue ?? 0)}</StatValue>
          <StatDescription>Committed but not yet closed</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Reserved stock</StatLabel>
          <StatValue>{formatAmountValue(summary?.reservedValue ?? 0)}</StatValue>
          <StatDescription>Held for confirmed orders</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search sales orders..."
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
                  ? `Your plan allows ${limit} sales orders. Delete one or upgrade to add more.`
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
                  {order.customer?.name ?? order.customerName} · {formatDate(order.orderDate)}
                </p>
              </div>
              <StatusBadge
                color={SALES_ORDER_STATUS_COLORS[order.status] as StatusColor}
                label={SALES_ORDER_STATUS_LABELS[order.status]}
              />
            </div>

            <dl className="mt-3 grid gap-1 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivered</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(order.deliveredQuantity)} / {formatNumber(order.totalQuantity)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Invoiced</dt>
                <dd className="font-medium tabular-nums">
                  {formatNumber(order.invoicedQuantity)} / {formatNumber(order.totalQuantity)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-medium tabular-nums">{formatAmount(order.grandTotal)}</dd>
              </div>
            </dl>
          </div>
        )}
      />

      <SalesOrderFormModal open={formOpen} onOpenChange={setFormOpen} order={editing} />

      <FulfilmentDialog
        open={Boolean(delivering)}
        onOpenChange={(open) => !open && setDelivering(null)}
        title={`Deliver ${delivering?.orderNumber ?? ""}`}
        description={`Stock leaves ${delivering?.warehouse?.name ?? "the order warehouse"} as soon as you confirm.`}
        doneLabel="Delivered"
        rows={deliverRows}
        isLoading={isDelivering}
        confirmText="Deliver stock"
        onSubmit={async (items) => {
          if (!delivering) return;
          const ok = await run(
            deliverOrder({ id: delivering._id, body: { items } }).unwrap(),
            `Stock delivered on ${delivering.orderNumber}`,
            "Could not deliver the stock"
          );
          if (ok) setDelivering(null);
        }}
      />

      <InvoiceFromOrderDialog
        open={Boolean(invoicing)}
        onOpenChange={(open) => !open && setInvoicing(null)}
        order={invoicing}
        isLoading={isInvoicing}
        onSubmit={async (body) => {
          if (!invoicing) return;
          const ok = await run(
            invoiceOrder({ orderId: invoicing._id, body }).unwrap(),
            `Invoice drafted from ${invoicing.orderNumber}`,
            "Could not create the invoice"
          );
          if (ok) setInvoicing(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        title={copy.title}
        description={copy.description}
        confirmText={copy.confirmText}
        variant={pending?.kind === "delete" ? "destructive" : undefined}
        isLoading={isConfirming || isCompleting || isCancelling || isDeleting}
        onConfirm={confirmPending}
      />
    </>
  );
}
