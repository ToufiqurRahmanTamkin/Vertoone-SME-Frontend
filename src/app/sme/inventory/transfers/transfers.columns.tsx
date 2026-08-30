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
  STOCK_TRANSFER_STATUS_COLORS,
  STOCK_TRANSFER_STATUS_LABELS,
  type StockTransfer,
} from "@/types/domain/stockTransfer";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRight,
  Ban,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Trash2,
  Truck,
} from "lucide-react";

export interface StockTransferActions {
  onEdit: (transfer: StockTransfer) => void;
  onDispatch: (transfer: StockTransfer) => void;
  onReceive: (transfer: StockTransfer) => void;
  onCancel: (transfer: StockTransfer) => void;
  onDelete: (transfer: StockTransfer) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const transferColumns = (actions: StockTransferActions): ColumnDef<StockTransfer>[] => [
  {
    accessorKey: "transferNumber",
    header: "Transfer",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">
          {row.original.transferNumber}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.transferDate)}
        </p>
      </div>
    ),
  },
  {
    id: "route",
    header: "Route",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-1.5 text-sm">
        <span className="truncate">{row.original.fromWarehouse?.name ?? "—"}</span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{row.original.toWarehouse?.name ?? "—"}</span>
      </div>
    ),
  },
  {
    accessorKey: "totalQuantity",
    header: "Units",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatNumber(row.original.totalQuantity)}</span>
    ),
  },
  {
    accessorKey: "totalValue",
    header: "Value",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatAmount(row.original.totalValue)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={STOCK_TRANSFER_STATUS_COLORS[row.original.status] as StatusColor}
        label={STOCK_TRANSFER_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const transfer = row.original;
      const isDraft = transfer.status === "DRAFT";
      const isInTransit = transfer.status === "IN_TRANSIT";

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions for {transfer.transferNumber}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => actions.onEdit(transfer)}
                disabled={!actions.canEdit || !isDraft}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onDispatch(transfer)}
                disabled={!actions.canEdit || !isDraft}
              >
                <Truck className="mr-2 h-4 w-4" />
                Dispatch
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onReceive(transfer)}
                disabled={!actions.canEdit || !isInTransit}
              >
                <PackageCheck className="mr-2 h-4 w-4" />
                Receive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => actions.onCancel(transfer)}
                disabled={!actions.canEdit || (!isDraft && !isInTransit)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDelete(transfer)}
                disabled={!actions.canDelete || isInTransit || transfer.status === "COMPLETED"}
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
