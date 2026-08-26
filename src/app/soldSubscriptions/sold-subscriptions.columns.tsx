import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import type { SoldSubscription } from "@/types/domain/soldSubscription";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Pencil, RefreshCcw, RotateCcw, Trash2, XCircle } from "lucide-react";
import { canApprovePayment, canRefundPayment, canRejectPayment } from "./payment-actions";

interface SoldSubscriptionColumnActions {
  onEdit: (record: SoldSubscription) => void;
  onDelete: (record: SoldSubscription) => void;
  onApprove: (record: SoldSubscription) => void;
  onReject: (record: SoldSubscription) => void;
  onRefund: (record: SoldSubscription) => void;
}

export const soldSubscriptionColumns = ({
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onRefund,
}: SoldSubscriptionColumnActions): ColumnDef<SoldSubscription>[] => [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice",
    cell: ({ row }) => (
      <div className="min-w-0">
        <span className="font-mono text-xs font-medium">{row.original.invoiceNumber}</span>
        {row.original.billingOrigin === "AUTO_RENEWAL" && (
          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase text-violet-600 dark:text-violet-400">
            <RefreshCcw className="size-2.5" />
            Auto renewal
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="min-w-0">
          <p className="truncate font-medium">{record.customerName}</p>
          <p className="max-w-[14rem] truncate text-xs text-muted-foreground">
            {record.companyName ? `${record.companyName} · ` : ""}
            {record.customerEmail}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "planName",
    header: "Plan",
    cell: ({ row }) => <span className="text-sm">{row.original.planName}</span>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums">
        {formatAmount(row.original.amount, row.original.currency)}
      </span>
    ),
  },
  {
    id: "term",
    header: "Term",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        <div>{formatDate(row.original.startDate)}</div>
        <div>to {formatDate(row.original.endDate)}</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={SUBSCRIPTION_STATUS_COLORS[row.original.status]}
        label={SUBSCRIPTION_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => (
      <StatusBadge
        color={PAYMENT_STATUS_COLORS[row.original.paymentStatus]}
        label={PAYMENT_STATUS_LABELS[row.original.paymentStatus]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        {canApprovePayment(row.original) && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-emerald-600 hover:text-emerald-600"
            onClick={() => onApprove(row.original)}
            aria-label={`Approve payment for ${row.original.invoiceNumber}`}
            title="Approve payment"
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
        {canRejectPayment(row.original) && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
            onClick={() => onReject(row.original)}
            aria-label={`Reject payment for ${row.original.invoiceNumber}`}
            title="Reject payment"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        )}
        {canRefundPayment(row.original) && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            onClick={() => onRefund(row.original)}
            aria-label={`Refund payment for ${row.original.invoiceNumber}`}
            title="Refund payment"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => onEdit(row.original)}
          aria-label={`Edit ${row.original.invoiceNumber}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
          onClick={() => onDelete(row.original)}
          aria-label={`Delete ${row.original.invoiceNumber}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
