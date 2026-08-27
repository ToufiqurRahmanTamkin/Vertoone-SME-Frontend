import { CardActionButton } from "@/components/shared/action-button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import type { SoldSubscription } from "@/types/domain/soldSubscription";
import { CheckCircle2, Pencil, RotateCcw, Trash2, XCircle } from "lucide-react";
import { canApprovePayment, canRefundPayment, canRejectPayment } from "../payment-actions";

interface SoldSubscriptionMobileCardProps {
  record: SoldSubscription;
  onEdit: (record: SoldSubscription) => void;
  onDelete: (record: SoldSubscription) => void;
  onApprove: (record: SoldSubscription) => void;
  onReject: (record: SoldSubscription) => void;
  onRefund: (record: SoldSubscription) => void;
}

export function SoldSubscriptionMobileCard({
  record,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onRefund,
}: SoldSubscriptionMobileCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{record.customerName}</p>
          <p className="truncate text-xs text-muted-foreground">{record.customerEmail}</p>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
          {record.invoiceNumber}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <StatusBadge
          color={SUBSCRIPTION_STATUS_COLORS[record.status]}
          label={SUBSCRIPTION_STATUS_LABELS[record.status]}
        />
        <StatusBadge
          color={PAYMENT_STATUS_COLORS[record.paymentStatus]}
          label={PAYMENT_STATUS_LABELS[record.paymentStatus]}
        />
      </div>

      <dl className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="font-medium">{record.planName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Amount</dt>
          <dd className="font-medium tabular-nums">
            {formatAmount(record.amount, record.currency)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Term</dt>
          <dd className="font-medium">
            {formatDate(record.startDate)} – {formatDate(record.endDate)}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap justify-end gap-2 border-t pt-3">
        {canApprovePayment(record) && (
          <CardActionButton
            icon={CheckCircle2}
            label="Approve"
            className="text-emerald-600 hover:text-emerald-600"
            onClick={() => onApprove(record)}
          />
        )}
        {canRejectPayment(record) && (
          <CardActionButton
            icon={XCircle}
            label="Reject"
            className="text-destructive hover:text-destructive"
            onClick={() => onReject(record)}
          />
        )}
        {canRefundPayment(record) && (
          <CardActionButton icon={RotateCcw} label="Refund" onClick={() => onRefund(record)} />
        )}
        <CardActionButton icon={Pencil} label="Edit" onClick={() => onEdit(record)} />
        <CardActionButton
          icon={Trash2}
          label="Delete"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(record)}
        />
      </div>
    </div>
  );
}
