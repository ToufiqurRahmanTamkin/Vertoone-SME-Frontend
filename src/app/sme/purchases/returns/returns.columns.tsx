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
  PURCHASE_RETURN_REASON_LABELS,
  PURCHASE_RETURN_STATUS_COLORS,
  PURCHASE_RETURN_STATUS_LABELS,
  type PurchaseReturn,
} from "@/types/domain/purchaseReturn";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, CheckCircle2, MoreHorizontal, Pencil, Trash2, Wallet } from "lucide-react";

export interface PurchaseReturnActions {
  onEdit: (row: PurchaseReturn) => void;
  onConfirm: (row: PurchaseReturn) => void;
  onSettle: (row: PurchaseReturn) => void;
  onCancel: (row: PurchaseReturn) => void;
  onDelete: (row: PurchaseReturn) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const purchaseReturnColumns = (
  actions: PurchaseReturnActions
): ColumnDef<PurchaseReturn>[] => [
  {
    accessorKey: "returnNumber",
    header: "Return",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">
          {row.original.returnNumber}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.returnDate)}
          {row.original.purchaseOrderNumber ? ` · ${row.original.purchaseOrderNumber}` : ""}
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
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {PURCHASE_RETURN_REASON_LABELS[row.original.reason]}
      </Badge>
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
    accessorKey: "grandTotal",
    header: "Value",
    cell: ({ row }) => (
      <div className="text-sm tabular-nums">
        <p>{formatAmount(row.original.grandTotal)}</p>
        {row.original.balanceDue > 0 && row.original.status === "CONFIRMED" && (
          <p className="text-xs text-muted-foreground">
            {formatAmount(row.original.balanceDue)} owed back
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={PURCHASE_RETURN_STATUS_COLORS[row.original.status] as StatusColor}
        label={PURCHASE_RETURN_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const purchaseReturn = row.original;
      const isDraft = purchaseReturn.status === "DRAFT";
      const isConfirmed = purchaseReturn.status === "CONFIRMED";

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions for {purchaseReturn.returnNumber}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => actions.onEdit(purchaseReturn)}
                disabled={!actions.canEdit || !isDraft}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onConfirm(purchaseReturn)}
                disabled={!actions.canEdit || !isDraft}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm and send back
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onSettle(purchaseReturn)}
                disabled={!actions.canEdit || !isConfirmed || purchaseReturn.balanceDue <= 0}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Record settlement
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => actions.onCancel(purchaseReturn)}
                disabled={!actions.canEdit || purchaseReturn.status === "CANCELLED"}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDelete(purchaseReturn)}
                disabled={!actions.canDelete || isConfirmed}
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
