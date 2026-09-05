import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  RFQ_STATUS_COLORS,
  RFQ_STATUS_LABELS,
  type RequestForQuote,
} from "@/types/domain/requestForQuote";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, CheckCheck, Lock, Pencil, Send, Trash2, Trophy } from "lucide-react";

export interface RfqColumnActions {
  onEdit: (rfq: RequestForQuote) => void;
  onSend: (rfq: RequestForQuote) => void;
  onRecordQuote: (rfq: RequestForQuote) => void;
  onAward: (rfq: RequestForQuote) => void;
  onClose: (rfq: RequestForQuote) => void;
  onCancel: (rfq: RequestForQuote) => void;
  onDelete: (rfq: RequestForQuote) => void;
  canEdit: boolean;
  canDelete: boolean;
  canRaiseOrder: boolean;
}

export function RfqRowActions({
  rfq,
  ...actions
}: RfqColumnActions & { rfq: RequestForQuote }) {
  const isDraft = rfq.status === "DRAFT";
  const isOut = rfq.status === "SENT" || rfq.status === "QUOTED";
  const isClosed =
    rfq.status === "AWARDED" || rfq.status === "CLOSED" || rfq.status === "CANCELLED";

  return (
    <RowActions
      label={`Actions for ${rfq.rfqNumber}`}
      actions={[
        !isClosed && {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(rfq),
        },
        isDraft && {
          key: "send",
          label: "Send to suppliers",
          icon: Send,
          disabled: !actions.canEdit,
          onSelect: () => actions.onSend(rfq),
        },
        isOut && {
          key: "quote",
          label: "Record a quote",
          icon: CheckCheck,
          disabled: !actions.canEdit,
          onSelect: () => actions.onRecordQuote(rfq),
        },
        rfq.status === "QUOTED" && {
          key: "award",
          label: "Award and order",
          icon: Trophy,
          disabled: !actions.canRaiseOrder,
          title: actions.canRaiseOrder
            ? undefined
            : "You need permission to create purchase orders",
          onSelect: () => actions.onAward(rfq),
        },
        isOut && {
          key: "close",
          label: "Close without awarding",
          icon: Lock,
          separated: true,
          disabled: !actions.canEdit,
          onSelect: () => actions.onClose(rfq),
        },
        rfq.status !== "CANCELLED" && {
          key: "cancel",
          label: "Cancel",
          icon: Ban,
          disabled: !actions.canEdit || Boolean(rfq.purchaseOrderId),
          onSelect: () => actions.onCancel(rfq),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canDelete || Boolean(rfq.purchaseOrderId),
          onSelect: () => actions.onDelete(rfq),
        },
      ]}
    />
  );
}

export const rfqColumns = (rowActions: RfqColumnActions): ColumnDef<RequestForQuote>[] => [
  {
    accessorKey: "rfqNumber",
    header: "Request",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">{row.original.rfqNumber}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.issueDate)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "What you are pricing",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatNumber(row.original.items.length)} lines
          {row.original.requisitionNumber ? ` · from ${row.original.requisitionNumber}` : ""}
        </p>
      </div>
    ),
  },
  {
    id: "suppliers",
    header: "Suppliers",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatNumber(row.original.respondedCount)} / {formatNumber(row.original.supplierCount)}
        <span className="ml-1 text-xs text-muted-foreground">quoted</span>
      </span>
    ),
  },
  {
    id: "bestQuote",
    header: "Best quote",
    cell: ({ row }) =>
      row.original.respondedCount > 0 ? (
        <div className="min-w-0 text-sm">
          <p className="tabular-nums">{formatAmountValue(row.original.bestQuoteTotal)}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.bestQuoteSupplierName}
          </p>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">
          {formatAmountValue(row.original.estimatedValue)} est.
        </span>
      ),
  },
  {
    id: "deadline",
    header: "Replies by",
    cell: ({ row }) =>
      row.original.responseDeadline ? (
        <div className="min-w-0 text-sm">
          <p className="truncate">{formatDate(row.original.responseDeadline)}</p>
          {row.original.isOverdue && <p className="text-xs text-destructive">Past due</p>}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">No deadline</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={RFQ_STATUS_COLORS[row.original.status] as StatusColor}
        label={RFQ_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RfqRowActions rfq={row.original} {...rowActions} />,
  },
];
