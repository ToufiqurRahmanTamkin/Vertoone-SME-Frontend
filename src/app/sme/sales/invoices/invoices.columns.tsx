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
  SALES_INVOICE_STATUS_COLORS,
  SALES_INVOICE_STATUS_LABELS,
  type SalesInvoice,
} from "@/types/domain/salesInvoice";
import {
  TRADE_PAYMENT_STATUS_COLORS,
  TRADE_PAYMENT_STATUS_LABELS,
} from "@/types/domain/trade";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, MoreHorizontal, Pencil, Send, Trash2, Wallet } from "lucide-react";

export interface SalesInvoiceActions {
  onEdit: (invoice: SalesInvoice) => void;
  onIssue: (invoice: SalesInvoice) => void;
  onPay: (invoice: SalesInvoice) => void;
  onCancel: (invoice: SalesInvoice) => void;
  onDelete: (invoice: SalesInvoice) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const salesInvoiceColumns = (actions: SalesInvoiceActions): ColumnDef<SalesInvoice>[] => [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">
          {row.original.invoiceNumber}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.invoiceDate)}
          {row.original.salesOrderNumber ? ` · ${row.original.salesOrderNumber}` : ""}
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
    accessorKey: "dueDate",
    header: "Due",
    cell: ({ row }) => (
      <span
        className={
          row.original.isOverdue ? "text-sm text-red-600 dark:text-red-400" : "text-sm"
        }
      >
        {formatDate(row.original.dueDate)}
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <StatusBadge
          color={SALES_INVOICE_STATUS_COLORS[row.original.status] as StatusColor}
          label={SALES_INVOICE_STATUS_LABELS[row.original.status]}
        />
        {row.original.status !== "CANCELLED" && (
          <StatusBadge
            color={TRADE_PAYMENT_STATUS_COLORS[row.original.paymentStatus] as StatusColor}
            label={TRADE_PAYMENT_STATUS_LABELS[row.original.paymentStatus]}
          />
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const invoice = row.original;
      const isDraft = invoice.status === "DRAFT";
      const isIssued = invoice.status === "ISSUED";
      const isCancelled = invoice.status === "CANCELLED";

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions for {invoice.invoiceNumber}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem
                onClick={() => actions.onEdit(invoice)}
                disabled={!actions.canEdit || !isDraft}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onIssue(invoice)}
                disabled={!actions.canEdit || !isDraft}
              >
                <Send className="mr-2 h-4 w-4" />
                Issue invoice
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onPay(invoice)}
                disabled={!actions.canEdit || !isIssued || invoice.balanceDue <= 0}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Record payment
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => actions.onCancel(invoice)}
                disabled={!actions.canEdit || isCancelled}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDelete(invoice)}
                disabled={!actions.canDelete || isIssued || invoice.amountPaid > 0}
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
