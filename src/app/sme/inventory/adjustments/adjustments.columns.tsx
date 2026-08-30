import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
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
  STOCK_ADJUSTMENT_REASON_LABELS,
  STOCK_ADJUSTMENT_STATUS_COLORS,
  STOCK_ADJUSTMENT_STATUS_LABELS,
  type StockAdjustment,
} from "@/types/domain/stockAdjustment";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, CheckCircle2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export interface StockAdjustmentActions {
  onEdit: (adjustment: StockAdjustment) => void;
  onApprove: (adjustment: StockAdjustment) => void;
  onCancel: (adjustment: StockAdjustment) => void;
  onDelete: (adjustment: StockAdjustment) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const adjustmentColumns = (
  actions: StockAdjustmentActions
): ColumnDef<StockAdjustment>[] => [
  {
    accessorKey: "adjustmentNumber",
    header: "Adjustment",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">
          {row.original.adjustmentNumber}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.adjustmentDate)}
        </p>
      </div>
    ),
  },
  {
    id: "warehouse",
    header: "Warehouse",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.warehouse?.name ?? "—"}</span>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {STOCK_ADJUSTMENT_REASON_LABELS[row.original.reason]}
      </Badge>
    ),
  },
  {
    id: "movement",
    header: "Movement",
    cell: ({ row }) => (
      <div className="text-sm tabular-nums">
        <span className="text-emerald-600 dark:text-emerald-400">
          +{formatNumber(row.original.increaseQuantity)}
        </span>
        <span className="mx-1 text-muted-foreground">/</span>
        <span className="text-red-600 dark:text-red-400">
          −{formatNumber(row.original.decreaseQuantity)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "valueImpact",
    header: "Value impact",
    cell: ({ row }) => (
      <span
        className={
          row.original.valueImpact < 0
            ? "text-sm tabular-nums text-red-600 dark:text-red-400"
            : "text-sm tabular-nums"
        }
      >
        {formatAmount(row.original.valueImpact)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={STOCK_ADJUSTMENT_STATUS_COLORS[row.original.status] as StatusColor}
        label={STOCK_ADJUSTMENT_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const adjustment = row.original;
      const isDraft = adjustment.status === "DRAFT";

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions for {adjustment.adjustmentNumber}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => actions.onEdit(adjustment)}
                disabled={!actions.canEdit || !isDraft}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onApprove(adjustment)}
                disabled={!actions.canEdit || !isDraft}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => actions.onCancel(adjustment)}
                disabled={!actions.canEdit || adjustment.status === "CANCELLED"}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDelete(adjustment)}
                disabled={!actions.canDelete || adjustment.status === "APPROVED"}
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
