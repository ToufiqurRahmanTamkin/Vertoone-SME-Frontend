import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { formatAmountValue } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  BILL_STATUS_COLORS,
  BILL_STATUS_LABELS,
  type Bill,
} from "@/types/domain/bill";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, FileMinus, Pencil, Send, Trash2, Wallet } from "lucide-react";

export interface BillColumnActions {
  onEdit: (bill: Bill) => void;
  onPost: (bill: Bill) => void;
  onPay: (bill: Bill) => void;
  onDebitNote: (bill: Bill) => void;
  onCancel: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
  canEdit: boolean;
  canDelete: boolean;
  canPay: boolean;
  canRaiseDebitNote: boolean;
}

export function BillRowActions({ bill, ...actions }: BillColumnActions & { bill: Bill }) {
  const isDraft = bill.status === "DRAFT";
  const isOpen = bill.status === "AWAITING_PAYMENT" || bill.status === "PARTIALLY_PAID";

  return (
    <RowActions
      label={`Actions for ${bill.billNumber}`}
      actions={[
        isDraft && {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(bill),
        },
        isDraft && {
          key: "post",
          label: "Post to payables",
          icon: Send,
          disabled: !actions.canEdit,
          onSelect: () => actions.onPost(bill),
        },
        isOpen && {
          key: "pay",
          label: "Record a payment",
          icon: Wallet,
          disabled: !actions.canPay,
          title: actions.canPay ? undefined : "You need permission to record payments",
          onSelect: () => actions.onPay(bill),
        },
        isOpen && {
          key: "debit-note",
          label: "Raise a debit note",
          icon: FileMinus,
          disabled: !actions.canRaiseDebitNote,
          title: actions.canRaiseDebitNote
            ? undefined
            : "You need permission to create debit notes",
          onSelect: () => actions.onDebitNote(bill),
        },
        bill.status !== "CANCELLED" && {
          key: "cancel",
          label: "Cancel",
          icon: Ban,
          separated: true,
          disabled: !actions.canEdit || bill.amountPaid > 0 || bill.creditApplied > 0,
          title:
            bill.amountPaid > 0 || bill.creditApplied > 0
              ? "Void the payments and debit notes against it first"
              : undefined,
          onSelect: () => actions.onCancel(bill),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canDelete || bill.amountPaid > 0 || bill.creditApplied > 0,
          onSelect: () => actions.onDelete(bill),
        },
      ]}
    />
  );
}

export const billColumns = (rowActions: BillColumnActions): ColumnDef<Bill>[] => [
  {
    accessorKey: "billNumber",
    header: "Bill",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">
          {row.original.billNumber}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.supplierInvoiceNumber || "No supplier invoice number"}
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
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.goodsReceiptNumbers.join(", ") ||
            row.original.purchaseOrderNumber ||
            "Entered by hand"}
        </p>
      </div>
    ),
  },
  {
    id: "dates",
    header: "Dates",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{formatDate(row.original.billDate)}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.dueDate ? `Due ${formatDate(row.original.dueDate)}` : "No due date"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "grandTotal",
    header: "Total",
    cell: ({ row }) => (
      <div className="text-sm tabular-nums">
        <p>{formatAmountValue(row.original.grandTotal)}</p>
        {row.original.creditApplied > 0 && (
          <p className="text-xs text-muted-foreground">
            {formatAmountValue(row.original.creditApplied)} credited
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "amountDue",
    header: "Still owed",
    cell: ({ row }) => (
      <div className="text-sm tabular-nums">
        <p>{formatAmountValue(row.original.amountDue)}</p>
        {row.original.isOverdue && (
          <p className="text-xs text-destructive">{row.original.daysOverdue} days late</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={BILL_STATUS_COLORS[row.original.status] as StatusColor}
        label={BILL_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <BillRowActions bill={row.original} {...rowActions} />,
  },
];
