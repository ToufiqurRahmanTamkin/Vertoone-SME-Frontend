import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAmount, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
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
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Send,
  Trash2,
  Wallet,
} from "lucide-react";

export interface PurchaseOrderActions {
  onEdit: (order: PurchaseOrder) => void;
  onPlace: (order: PurchaseOrder) => void;
  onReceive: (order: PurchaseOrder) => void;
  onPay: (order: PurchaseOrder) => void;
  onCancel: (order: PurchaseOrder) => void;
  onDelete: (order: PurchaseOrder) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const purchaseOrderColumns = (
  actions: PurchaseOrderActions
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
        <p>{formatAmount(row.original.grandTotal)}</p>
        {row.original.balanceDue > 0 && (
          <p className="text-xs text-muted-foreground">
            {formatAmount(row.original.balanceDue)} due
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
    cell: ({ row }) => {
      const order = row.original;
      const isDraft = order.status === "DRAFT";
      const isOpen = order.status === "ORDERED" || order.status === "PARTIALLY_RECEIVED";
      const isClosed = order.status === "CANCELLED" || order.status === "RECEIVED";

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions for {order.orderNumber}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => actions.onEdit(order)}
                disabled={!actions.canEdit || isClosed}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onPlace(order)}
                disabled={!actions.canEdit || !isDraft}
              >
                <Send className="mr-2 h-4 w-4" />
                Place with supplier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onReceive(order)}
                disabled={!actions.canEdit || !isOpen}
              >
                <PackageCheck className="mr-2 h-4 w-4" />
                Receive stock
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onPay(order)}
                disabled={
                  !actions.canEdit ||
                  isDraft ||
                  order.status === "CANCELLED" ||
                  order.balanceDue <= 0
                }
              >
                <Wallet className="mr-2 h-4 w-4" />
                Record payment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => actions.onCancel(order)}
                disabled={!actions.canEdit || order.status === "CANCELLED"}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDelete(order)}
                disabled={!actions.canDelete || order.receivedQuantity > 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
