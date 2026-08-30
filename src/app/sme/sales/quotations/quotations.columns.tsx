import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  QUOTATION_STATUS_COLORS,
  QUOTATION_STATUS_LABELS,
  type Quotation,
} from "@/types/domain/quotation";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowRightLeft,
  MoreHorizontal,
  Pencil,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";

export interface QuotationActions {
  onEdit: (quotation: Quotation) => void;
  onSend: (quotation: Quotation) => void;
  onAccept: (quotation: Quotation) => void;
  onReject: (quotation: Quotation) => void;
  onConvert: (quotation: Quotation) => void;
  onDelete: (quotation: Quotation) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const quotationColumns = (actions: QuotationActions): ColumnDef<Quotation>[] => [
  {
    accessorKey: "quotationNumber",
    header: "Quotation",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">
          {row.original.quotationNumber}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.quotationDate)}
        </p>
      </div>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.customerName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.subject || row.original.customerEmail || "—"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "validUntil",
    header: "Valid until",
    cell: ({ row }) => (
      <span
        className={
          row.original.isExpired
            ? "text-sm text-amber-600 dark:text-amber-400"
            : "text-sm"
        }
      >
        {formatDate(row.original.validUntil)}
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
      <div className="flex flex-col gap-1">
        <StatusBadge
          color={QUOTATION_STATUS_COLORS[row.original.status] as StatusColor}
          label={QUOTATION_STATUS_LABELS[row.original.status]}
        />
        {row.original.salesOrderNumber && (
          <span className="font-mono text-[10px] uppercase text-muted-foreground">
            {row.original.salesOrderNumber}
          </span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const quotation = row.original;
      const isOpen = quotation.status === "DRAFT" || quotation.status === "SENT";
      const isConverted = quotation.status === "CONVERTED";

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions for {quotation.quotationNumber}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => actions.onEdit(quotation)}
                disabled={!actions.canEdit || !isOpen}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onSend(quotation)}
                disabled={!actions.canEdit || quotation.status !== "DRAFT"}
              >
                <Send className="mr-2 h-4 w-4" />
                Mark as sent
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onAccept(quotation)}
                disabled={!actions.canEdit || !isOpen}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Mark as accepted
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onReject(quotation)}
                disabled={!actions.canEdit || !isOpen}
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Mark as rejected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => actions.onConvert(quotation)}
                disabled={
                  !actions.canEdit || isConverted || quotation.status === "REJECTED"
                }
              >
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Convert to sales order
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDelete(quotation)}
                disabled={!actions.canDelete || isConverted}
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
