import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  PURCHASE_ORDER_SOURCE_LABELS,
  PURCHASE_ORDER_STATUS_COLORS,
  PURCHASE_ORDER_STATUS_LABELS,
  type PurchaseOrder,
} from "@/types/domain/purchaseOrder";
import {
  TRADE_PAYMENT_STATUS_COLORS,
  TRADE_PAYMENT_STATUS_LABELS,
} from "@/types/domain/trade";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Ban,
  ClipboardList,
  PackageCheck,
  Pencil,
  ScrollText,
  Send,
  Trash2,
  Truck,
  Wallet,
} from "lucide-react";

export interface PurchaseOrderColumnActions {
  onEdit: (order: PurchaseOrder) => void;
  onPlace: (order: PurchaseOrder) => void;
  onReceive: (order: PurchaseOrder) => void;
  onViewReceipts: (order: PurchaseOrder) => void;
  onViewBills: (order: PurchaseOrder) => void;
  onViewSource: (order: PurchaseOrder) => void;
  onPay: (order: PurchaseOrder) => void;
  onCancel: (order: PurchaseOrder) => void;
  onDelete: (order: PurchaseOrder) => void;
  canEdit: boolean;
  canDelete: boolean;
  canReceive: boolean;
  canViewBills: boolean;
  canViewSource: boolean;
}

export function PurchaseOrderRowActions({
  order,
  ...actions
}: PurchaseOrderColumnActions & { order: PurchaseOrder }) {
  const isDraft = order.status === "DRAFT";
  const isOpen = order.status === "ORDERED" || order.status === "PARTIALLY_RECEIVED";
  const isClosed = order.status === "CANCELLED" || order.status === "RECEIVED";

  return (
    <RowActions
      label={`Actions for ${order.orderNumber}`}
      actions={[
        !isClosed && {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(order),
        },
        isDraft && {
          key: "place",
          label: "Place with supplier",
          icon: Send,
          disabled: !actions.canEdit,
          onSelect: () => actions.onPlace(order),
        },
        isOpen && {
          key: "receive",
          label: "Book in a delivery",
          icon: PackageCheck,
          disabled: !actions.canReceive,
          title: actions.canReceive ? undefined : "You need permission to book in goods receipts",
          onSelect: () => actions.onReceive(order),
        },
        order.receivedQuantity > 0 && {
          key: "receipts",
          label: "Goods receipts",
          icon: Truck,
          onSelect: () => actions.onViewReceipts(order),
        },
        actions.canViewBills &&
          !isDraft && {
            key: "bills",
            label: "Bills against this order",
            icon: ScrollText,
            onSelect: () => actions.onViewBills(order),
          },
        actions.canViewSource &&
          order.sourceType !== "MANUAL" &&
          Boolean(order.sourceNumber) && {
            key: "source",
            label: PURCHASE_ORDER_SOURCE_LABELS[order.sourceType],
            icon: ClipboardList,
            onSelect: () => actions.onViewSource(order),
          },
        !isDraft &&
          order.status !== "CANCELLED" &&
          order.balanceDue > 0 && {
            key: "pay",
            label: "Record payment",
            icon: Wallet,
            disabled: !actions.canEdit,
            onSelect: () => actions.onPay(order),
          },
        order.status !== "CANCELLED" && {
          key: "cancel",
          label: "Cancel",
          icon: Ban,
          separated: true,
          disabled: !actions.canEdit || order.receivedQuantity > 0,
          title: order.receivedQuantity > 0 ? "Cancel the goods receipts first" : undefined,
          onSelect: () => actions.onCancel(order),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canDelete || order.receivedQuantity > 0 || order.amountPaid > 0,
          onSelect: () => actions.onDelete(order),
        },
      ]}
    />
  );
}

export const purchaseOrderColumns = (
  rowActions: PurchaseOrderColumnActions
): ColumnDef<PurchaseOrder>[] => [
  {
    accessorKey: "orderNumber",
    header: "Order",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">
          {row.original.orderNumber}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.orderDate)}
          {row.original.sourceNumber ? ` · ${row.original.sourceNumber}` : ""}
        </p>
      </div>
    ),
  },
  {
    id: "supplier",
    header: "Supplier",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.supplier?.name ?? row.original.supplierName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.warehouse?.name ?? "—"}
        </p>
      </div>
    ),
  },
  {
    id: "received",
    header: "Received",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatNumber(row.original.receivedQuantity)} / {formatNumber(row.original.totalQuantity)}
      </span>
    ),
  },
  {
    accessorKey: "grandTotal",
    header: "Total",
    cell: ({ row }) => (
      <div className="text-sm tabular-nums">
        <p>{formatAmountValue(row.original.grandTotal)}</p>
        {row.original.balanceDue > 0 && (
          <p className="text-xs text-muted-foreground">
            {formatAmountValue(row.original.balanceDue)} due
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => (
      <StatusBadge
        color={TRADE_PAYMENT_STATUS_COLORS[row.original.paymentStatus] as StatusColor}
        label={TRADE_PAYMENT_STATUS_LABELS[row.original.paymentStatus]}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={PURCHASE_ORDER_STATUS_COLORS[row.original.status] as StatusColor}
        label={PURCHASE_ORDER_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <PurchaseOrderRowActions order={row.original} {...rowActions} />,
  },
];
