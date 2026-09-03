import { StatusBadge } from "@/components/shared/status-badge";
import {
  INVOICE_ORIGIN_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_COLORS,
  INVOICE_TYPE_LABELS,
} from "@/constant";
import { formatAmountValue } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { isInvoiceLinked, isInvoiceOverdue, type Invoice } from "@/types/domain/invoice";
import type { ColumnDef } from "@tanstack/react-table";
import { Link2, Link2Off } from "lucide-react";
import {
  InvoiceRowActions,
  type InvoiceRowActionHandlers,
} from "./components/InvoiceRowActions";

export const invoiceColumns = (
  rowActions: InvoiceRowActionHandlers
): ColumnDef<Invoice>[] => [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-xs font-semibold">{row.original.invoiceNumber}</p>
        <p className="max-w-xs truncate text-xs text-muted-foreground">{row.original.title}</p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Kind",
    cell: ({ row }) => (
      <StatusBadge
        color={INVOICE_TYPE_COLORS[row.original.type]}
        label={INVOICE_TYPE_LABELS[row.original.type]}
      />
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {formatAmountValue(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: "issueDate",
    header: "Issued",
    cell: ({ row }) => <span className="text-sm">{formatDate(row.original.issueDate)}</span>,
  },
  {
    accessorKey: "dueDate",
    header: "Due",
    cell: ({ row }) => {
      const overdue = isInvoiceOverdue(row.original);
      return (
        <span
          className={
            overdue ? "text-sm font-medium text-red-600 dark:text-red-400" : "text-sm"
          }
        >
          {formatDate(row.original.dueDate)}
          {overdue && " · overdue"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={INVOICE_STATUS_COLORS[row.original.status]}
        label={INVOICE_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "link",
    header: "Ledger",
    cell: ({ row }) => {
      const linked = isInvoiceLinked(row.original);
      const Icon = linked ? Link2 : Link2Off;
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {linked ? INVOICE_ORIGIN_LABELS[row.original.origin] : "Unlinked"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <InvoiceRowActions invoice={row.original} {...rowActions} />,
  },
];
