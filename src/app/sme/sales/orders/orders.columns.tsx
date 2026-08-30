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
  SALES_ORDER_STATUS_COLORS,
  SALES_ORDER_STATUS_LABELS,
  type SalesOrder,
} from "@/types/domain/salesOrder";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Ban,
  CheckCircle2,
  CircleCheckBig,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  Truck,
} from "lucide-react";

export interface SalesOrderActions {
  onEdit: (order: SalesOrder) => void;
  onConfirm: (order: SalesOrder) => void;
  onDeliver: (order: SalesOrder) => void;
  onInvoice: (order: SalesOrder) => void;
  onComplete: (order: SalesOrder) => void;
  onCancel: (order: SalesOrder) => void;
  onDelete: (order: SalesOrder) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const salesOrderColumns = (actions: SalesOrderActions): ColumnDef<SalesOrder>[] => [
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
          {row.original.quotationNumber ? ` · ${row.original.quotationNumber}` : ""}
        </p>
      </div>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.customer?.name ?? row.original.customerName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.warehouse?.name ?? "—"}
        </p>
      </div>
    ),
  },
  {
    id: "progress",
    header: "Delivered",
    cell: ({ row }) => (
      <div className="text-sm tabular-nums">
        <p>
          {formatNumber(row.original.deliveredQuantity)} /{" "}
          {formatNumber(row.original.totalQuantity)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatNumber(row.original.invoicedQuantity)} invoiced
        </p>
      </div>
    ),
  },
  {
    accessorKey: "expectedDate",
    header: "Expected",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.expectedDate ? formatDate(row.original.expectedDate) : "—"}
      </span>
    ),
  },
  {
    accessorKey: "grandTotal",
    header: "Total",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatAmount(row.original.grandTotal)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={SALES_ORDER_STATUS_COLORS[row.original.status] as StatusColor}
        label={SALES_ORDER_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const order = row.original;
      const isDraft = order.status === "DRAFT";
      const isCancelled = order.status === "CANCELLED";
      const isCompleted = order.status === "COMPLETED";
      const isLive =
        order.status === "CONFIRMED" ||
        order.status === "PARTIALLY_DELIVERED" ||
        order.status === "DELIVERED";
      const hasPendingDelivery = order.deliveredQuantity < order.totalQuantity;
      const hasUninvoiced = order.invoicedQuantity < order.totalQuantity;

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
                disabled={!actions.canEdit || !isDraft}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onConfirm(order)}
                disabled={!actions.canEdit || !isDraft}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm and reserve
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onDeliver(order)}
                disabled={!actions.canEdit || !isLive || !hasPendingDelivery}
              >
                <Truck className="mr-2 h-4 w-4" />
                Deliver stock
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onInvoice(order)}
                disabled={!actions.canEdit || isDraft || isCancelled || !hasUninvoiced}
              >
                <FileText className="mr-2 h-4 w-4" />
                Create invoice
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onComplete(order)}
                disabled={!actions.canEdit || !isLive || isCompleted}
              >
                <CircleCheckBig className="mr-2 h-4 w-4" />
                Close order
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => actions.onCancel(order)}
                disabled={!actions.canEdit || isCancelled || isCompleted}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDelete(order)}
                disabled={!actions.canDelete || order.deliveredQuantity > 0}
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
