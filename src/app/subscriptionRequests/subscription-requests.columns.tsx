import { RowActions } from "@/components/shared/row-actions";
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
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Flame, XCircle } from "lucide-react";
import { canReviewRequest, wipesDataOnApproval } from "./request-actions";

export interface SubscriptionRequestColumnActions {
  onApprove: (record: SubscriptionRequest) => void;
  onReject: (record: SubscriptionRequest) => void;
}

export function SubscriptionRequestRowActions({
  request,
  ...actions
}: SubscriptionRequestColumnActions & { request: SubscriptionRequest }) {
  if (!canReviewRequest(request)) {
    return (
      <div className="flex justify-end">
        <span className="text-xs text-muted-foreground">
          {request.reviewedAt ? formatDate(request.reviewedAt) : "—"}
        </span>
      </div>
    );
  }

  return (
    <RowActions
      label={`Actions for the request from ${request.companyName}`}
      actions={[
        {
          key: "approve",
          label: "Approve",
          icon: CheckCircle2,
          onSelect: () => actions.onApprove(request),
        },
        {
          key: "reject",
          label: "Reject",
          icon: XCircle,
          variant: "destructive",
          separated: true,
          onSelect: () => actions.onReject(request),
        },
      ]}
    />
  );
}

export const subscriptionRequestColumns = (
  rowActions: SubscriptionRequestColumnActions
): ColumnDef<SubscriptionRequest>[] => [
  {
    accessorKey: "companyName",
    header: "Company",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.companyName}</p>
        <p className="max-w-[16rem] truncate text-xs text-muted-foreground">
          {row.original.requestedByName} · {row.original.requestedByEmail}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Request",
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <StatusBadge
          color={SUBSCRIPTION_REQUEST_TYPE_COLORS[row.original.type]}
          label={SUBSCRIPTION_REQUEST_TYPE_LABELS[row.original.type]}
        />
        {wipesDataOnApproval(row.original) && (
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-destructive">
            <Flame className="size-2.5" />
            Erases all data
          </span>
        )}
      </div>
    ),
  },
  {
    id: "plan",
    header: "Plan",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.type === "UPGRADE" ? (
          <span>
            {row.original.currentPlanName} → <b>{row.original.targetPlanName}</b>
          </span>
        ) : (
          <span>{row.original.currentPlanName}</span>
        )}
        <p className="font-mono text-[11px] text-muted-foreground">
          {row.original.targetInvoiceNumber || row.original.subscriptionInvoiceNumber}
        </p>
      </div>
    ),
  },
  {
    id: "money",
    header: "Amount",
    cell: ({ row }) => (
      <div className="text-sm">
        <span className="font-medium tabular-nums">
          {formatAmountValue(row.original.amount)}
        </span>
        {row.original.type === "CANCELLATION" && (
          <p className="text-xs text-muted-foreground">
            Refund {formatAmountValue(row.original.refundAmount)}
          </p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "requestedAt",
    header: "Requested",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDate(row.original.requestedAt)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={SUBSCRIPTION_REQUEST_STATUS_COLORS[row.original.status]}
        label={SUBSCRIPTION_REQUEST_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <SubscriptionRequestRowActions request={row.original} {...rowActions} />
    ),
  },
];
