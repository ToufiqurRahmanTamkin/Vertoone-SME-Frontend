import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  PURCHASE_RETURN_REASON_LABELS,
  PURCHASE_RETURN_STATUS_COLORS,
  PURCHASE_RETURN_STATUS_LABELS,
  type PurchaseReturn,
} from "@/types/domain/purchaseReturn";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, CheckCircle2, FileMinus, Pencil, Trash2, Wallet } from "lucide-react";

export interface PurchaseReturnColumnActions {
  onEdit: (row: PurchaseReturn) => void;
  onConfirm: (row: PurchaseReturn) => void;
  onSettle: (row: PurchaseReturn) => void;
  onDebitNote: (row: PurchaseReturn) => void;
  onCancel: (row: PurchaseReturn) => void;
  onDelete: (row: PurchaseReturn) => void;
  canEdit: boolean;
  canDelete: boolean;
  canRaiseDebitNote: boolean;
}

export function PurchaseReturnRowActions({
  purchaseReturn,
  ...actions
}: PurchaseReturnColumnActions & { purchaseReturn: PurchaseReturn }) {
  const isDraft = purchaseReturn.status === "DRAFT";
  const isConfirmed = purchaseReturn.status === "CONFIRMED";

  return (
    <RowActions
      label={`Actions for ${purchaseReturn.returnNumber}`}
      actions={[
        isDraft && {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(purchaseReturn),
        },
        isDraft && {
          key: "confirm",
          label: "Confirm and send back",
          icon: CheckCircle2,
          disabled: !actions.canEdit,
          onSelect: () => actions.onConfirm(purchaseReturn),
        },
        isConfirmed &&
          !purchaseReturn.debitNoteId && {
            key: "debit-note",
            label: "Raise a debit note",
            icon: FileMinus,
            disabled: !actions.canRaiseDebitNote,
            title: actions.canRaiseDebitNote
              ? undefined
              : "You need permission to create debit notes",
            onSelect: () => actions.onDebitNote(purchaseReturn),
          },
        isConfirmed &&
          purchaseReturn.balanceDue > 0 && {
            key: "settle",
            label: "Record settlement",
            icon: Wallet,
            disabled: !actions.canEdit,
            onSelect: () => actions.onSettle(purchaseReturn),
          },
        purchaseReturn.status !== "CANCELLED" && {
          key: "cancel",
          label: "Cancel",
          icon: Ban,
          separated: true,
          disabled: !actions.canEdit || Boolean(purchaseReturn.debitNoteId),
          title: purchaseReturn.debitNoteId
            ? `Cancel ${purchaseReturn.debitNoteNumber} first`
            : undefined,
          onSelect: () => actions.onCancel(purchaseReturn),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canDelete || isConfirmed,
          onSelect: () => actions.onDelete(purchaseReturn),
        },
      ]}
    />
  );
}

export const purchaseReturnColumns = (
  rowActions: PurchaseReturnColumnActions
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
        <p>{formatAmountValue(row.original.grandTotal)}</p>
        {row.original.debitNoteNumber ? (
          <p className="truncate font-mono text-xs uppercase text-muted-foreground">
            {row.original.debitNoteNumber}
          </p>
        ) : (
          row.original.balanceDue > 0 &&
          row.original.status === "CONFIRMED" && (
            <p className="text-xs text-muted-foreground">
              {formatAmountValue(row.original.balanceDue)} owed back
            </p>
          )
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
    cell: ({ row }) => (
      <PurchaseReturnRowActions purchaseReturn={row.original} {...rowActions} />
    ),
  },
];
