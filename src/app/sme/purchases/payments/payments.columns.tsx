import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { formatAmountValue } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  PAYMENT_MADE_STATUS_COLORS,
  PAYMENT_MADE_STATUS_LABELS,
  type PaymentMade,
} from "@/types/domain/paymentMade";
import { TRADE_PAYMENT_METHOD_LABELS } from "@/types/domain/trade";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, ScrollText, Trash2 } from "lucide-react";

export interface PaymentColumnActions {
  onVoid: (payment: PaymentMade) => void;
  onViewBills: (payment: PaymentMade) => void;
  onDelete: (payment: PaymentMade) => void;
  canEdit: boolean;
  canDelete: boolean;
  canViewBills: boolean;
}

export function PaymentRowActions({
  payment,
  ...actions
}: PaymentColumnActions & { payment: PaymentMade }) {
  return (
    <RowActions
      label={`Actions for ${payment.paymentNumber}`}
      actions={[
        payment.status === "POSTED" && {
          key: "void",
          label: "Void",
          icon: Ban,
          disabled: !actions.canEdit,
          onSelect: () => actions.onVoid(payment),
        },
        actions.canViewBills &&
          payment.allocations.length > 0 && {
            key: "bills",
            label: "Bills it settled",
            icon: ScrollText,
            onSelect: () => actions.onViewBills(payment),
          },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canDelete || payment.status !== "VOID",
          title: payment.status !== "VOID" ? "Void the payment first" : undefined,
          onSelect: () => actions.onDelete(payment),
        },
      ]}
    />
  );
}

export const paymentColumns = (
  rowActions: PaymentColumnActions
): ColumnDef<PaymentMade>[] => [
  {
    accessorKey: "paymentNumber",
    header: "Payment",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">
          {row.original.paymentNumber}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.paymentDate)}
        </p>
      </div>
    ),
  },
  {
    id: "supplier",
    header: "Paid to",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.supplier?.name ?? row.original.supplierName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {TRADE_PAYMENT_METHOD_LABELS[row.original.method]}
          {row.original.chequeNumber ? ` · ${row.original.chequeNumber}` : ""}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatAmountValue(row.original.amount)}</span>
    ),
  },
  {
    id: "applied",
    header: "Settled",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        {row.original.purchaseOrderNumber ? (
          <p className="truncate font-mono text-xs uppercase">
            Advance on {row.original.purchaseOrderNumber}
          </p>
        ) : row.original.allocations.length > 0 ? (
          <p className="truncate font-mono text-xs uppercase">
            {row.original.allocations.map((entry) => entry.billNumber).join(", ")}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Not applied to anything yet</p>
        )}
        {row.original.unappliedAmount > 0 && (
          <p className="text-xs tabular-nums text-muted-foreground">
            {formatAmountValue(row.original.unappliedAmount)} unapplied
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.reference || "—"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={PAYMENT_MADE_STATUS_COLORS[row.original.status] as StatusColor}
        label={PAYMENT_MADE_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <PaymentRowActions payment={row.original} {...rowActions} />,
  },
];
