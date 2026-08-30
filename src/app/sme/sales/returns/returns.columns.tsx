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
  SALES_RETURN_REASON_LABELS,
  SALES_RETURN_SETTLEMENT_LABELS,
  SALES_RETURN_STATUS_COLORS,
  SALES_RETURN_STATUS_LABELS,
  type SalesReturn,
} from "@/types/domain/salesReturn";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, CheckCircle2, MoreHorizontal, Pencil, Trash2, Wallet } from "lucide-react";

export interface SalesReturnActions {
  onEdit: (row: SalesReturn) => void;
  onConfirm: (row: SalesReturn) => void;
  onRefund: (row: SalesReturn) => void;
  onCancel: (row: SalesReturn) => void;
  onDelete: (row: SalesReturn) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const salesReturnColumns = (actions: SalesReturnActions): ColumnDef<SalesReturn>[] => [
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
          {row.original.salesInvoiceNumber ? ` · ${row.original.salesInvoiceNumber}` : ""}
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
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {SALES_RETURN_REASON_LABELS[row.original.reason]}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          {SALES_RETURN_SETTLEMENT_LABELS[row.original.settlement]}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "totalQuantity",
    header: "Units",
    cell: ({ row }) => (
      <div className="text-sm tabular-nums">
        <p>{formatNumber(row.original.totalQuantity)}</p>
        <p className="text-xs text-muted-foreground">
          {formatNumber(row.original.restockedQuantity)} restocked
        </p>
      </div>
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
            {formatAmount(row.original.balanceDue)} to refund
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
        color={SALES_RETURN_STATUS_COLORS[row.original.status] as StatusColor}
        label={SALES_RETURN_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const salesReturn = row.original;
      const isDraft = salesReturn.status === "DRAFT";
      const isConfirmed = salesReturn.status === "CONFIRMED";

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions for {salesReturn.returnNumber}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => actions.onEdit(salesReturn)}
                disabled={!actions.canEdit || !isDraft}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onConfirm(salesReturn)}
                disabled={!actions.canEdit || !isDraft}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm and take back
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onRefund(salesReturn)}
                disabled={!actions.canEdit || !isConfirmed || salesReturn.balanceDue <= 0}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Record refund
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => actions.onCancel(salesReturn)}
                disabled={!actions.canEdit || salesReturn.status === "CANCELLED"}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDelete(salesReturn)}
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
