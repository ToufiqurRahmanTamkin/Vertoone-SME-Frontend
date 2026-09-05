import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { formatAmountValue } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  DEBIT_NOTE_REASON_LABELS,
  DEBIT_NOTE_STATUS_COLORS,
  DEBIT_NOTE_STATUS_LABELS,
  type DebitNote,
} from "@/types/domain/debitNote";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Handshake, Pencil, Send, Trash2 } from "lucide-react";

export interface DebitNoteColumnActions {
  onEdit: (note: DebitNote) => void;
  onIssue: (note: DebitNote) => void;
  onApply: (note: DebitNote) => void;
  onCancel: (note: DebitNote) => void;
  onDelete: (note: DebitNote) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function DebitNoteRowActions({
  note,
  ...actions
}: DebitNoteColumnActions & { note: DebitNote }) {
  const isDraft = note.status === "DRAFT";
  const isIssued = note.status === "ISSUED";

  return (
    <RowActions
      label={`Actions for ${note.debitNoteNumber}`}
      actions={[
        isDraft && {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(note),
        },
        isDraft && {
          key: "issue",
          label: "Issue to supplier",
          icon: Send,
          disabled: !actions.canEdit,
          onSelect: () => actions.onIssue(note),
        },
        isIssued && {
          key: "apply",
          label: "Set against a bill",
          icon: Handshake,
          disabled: !actions.canEdit,
          onSelect: () => actions.onApply(note),
        },
        note.status !== "CANCELLED" && {
          key: "cancel",
          label: "Cancel",
          icon: Ban,
          separated: true,
          disabled: !actions.canEdit,
          onSelect: () => actions.onCancel(note),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canDelete || note.amountApplied > 0,
          onSelect: () => actions.onDelete(note),
        },
      ]}
    />
  );
}

export const debitNoteColumns = (
  rowActions: DebitNoteColumnActions
): ColumnDef<DebitNote>[] => [
  {
    accessorKey: "debitNoteNumber",
    header: "Debit note",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">
          {row.original.debitNoteNumber}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.noteDate)}
        </p>
      </div>
    ),
  },
  {
    id: "supplier",
    header: "Claimed from",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.supplier?.name ?? row.original.supplierName}</p>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.purchaseReturnNumber || row.original.billNumber || "Raised by hand"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "reason",
    header: "Why",
    cell: ({ row }) => (
      <span className="text-sm">{DEBIT_NOTE_REASON_LABELS[row.original.reason]}</span>
    ),
  },
  {
    accessorKey: "grandTotal",
    header: "Value",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatAmountValue(row.original.grandTotal)}</span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Still to claim",
    cell: ({ row }) => (
      <div className="text-sm tabular-nums">
        <p>{formatAmountValue(row.original.balance)}</p>
        {row.original.amountApplied > 0 && (
          <p className="text-xs text-muted-foreground">
            {formatAmountValue(row.original.amountApplied)} already applied
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
        color={DEBIT_NOTE_STATUS_COLORS[row.original.status] as StatusColor}
        label={DEBIT_NOTE_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <DebitNoteRowActions note={row.original} {...rowActions} />,
  },
];
