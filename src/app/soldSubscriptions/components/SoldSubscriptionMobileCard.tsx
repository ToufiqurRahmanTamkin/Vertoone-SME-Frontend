import { StatusBadge } from "@/components/shared/status-badge";
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@/constant";
import { formatAmountValue } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import type { SoldSubscription } from "@/types/domain/soldSubscription";
import {
  SoldSubscriptionRowActions,
  type SoldSubscriptionRowActionHandlers,
} from "./SoldSubscriptionRowActions";

export function SoldSubscriptionMobileCard({
  record,
  ...rowActions
}: SoldSubscriptionRowActionHandlers & { record: SoldSubscription }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{record.customerName}</p>
          <p className="truncate text-xs text-muted-foreground">{record.customerEmail}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="font-mono text-[11px] text-muted-foreground">
            {record.invoiceNumber}
          </span>
          <SoldSubscriptionRowActions record={record} {...rowActions} />
        </div>
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
            {formatAmountValue(record.amount)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Term</dt>
          <dd className="font-medium">
            {formatDate(record.startDate)} – {formatDate(record.endDate)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
