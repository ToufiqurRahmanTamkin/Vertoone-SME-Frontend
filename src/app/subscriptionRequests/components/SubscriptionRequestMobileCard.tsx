import { StatusBadge } from "@/components/shared/status-badge";
import {
  SUBSCRIPTION_REQUEST_STATUS_COLORS,
  SUBSCRIPTION_REQUEST_STATUS_LABELS,
  SUBSCRIPTION_REQUEST_TYPE_COLORS,
  SUBSCRIPTION_REQUEST_TYPE_LABELS,
} from "@/constant";
import { formatAmountValue } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import type { SubscriptionRequest } from "@/types/domain/subscriptionRequest";
import { Flame } from "lucide-react";
import { canReviewRequest, wipesDataOnApproval } from "../request-actions";
import {
  SubscriptionRequestRowActions,
  type SubscriptionRequestColumnActions,
} from "../subscription-requests.columns";

export function SubscriptionRequestMobileCard({
  record,
  ...actions
}: SubscriptionRequestColumnActions & { record: SubscriptionRequest }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{record.companyName}</p>
          <p className="truncate text-xs text-muted-foreground">{record.requestedByEmail}</p>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
          {record.targetInvoiceNumber || record.subscriptionInvoiceNumber}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <StatusBadge
          color={SUBSCRIPTION_REQUEST_TYPE_COLORS[record.type]}
          label={SUBSCRIPTION_REQUEST_TYPE_LABELS[record.type]}
        />
        <StatusBadge
          color={SUBSCRIPTION_REQUEST_STATUS_COLORS[record.status]}
          label={SUBSCRIPTION_REQUEST_STATUS_LABELS[record.status]}
        />
      </div>

      {wipesDataOnApproval(record) && (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold uppercase text-destructive">
          <Flame className="size-3" />
          Approving erases all of their data
        </p>
      )}

      <dl className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="min-w-0 truncate font-medium">
            {record.type === "UPGRADE"
              ? `${record.currentPlanName} → ${record.targetPlanName}`
              : record.currentPlanName}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Amount</dt>
          <dd className="font-medium tabular-nums">
            {formatAmountValue(record.amount)}
          </dd>
        </div>
        {record.type === "CANCELLATION" && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Refund</dt>
            <dd className="font-medium tabular-nums">
              {formatAmountValue(record.refundAmount)}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Requested</dt>
          <dd className="font-medium">{formatDate(record.requestedAt)}</dd>
        </div>
      </dl>

      {record.reason && (
        <p className="mt-3 whitespace-pre-wrap border-t pt-3 text-xs text-muted-foreground">
          {record.reason}
        </p>
      )}

      {canReviewRequest(record) && (
        <div className="mt-3 border-t pt-3">
          <SubscriptionRequestRowActions request={record} {...actions} />
        </div>
      )}
    </div>
  );
}
