import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  SUBSCRIPTION_REQUEST_STATUS_COLORS,
  SUBSCRIPTION_REQUEST_STATUS_LABELS,
  SUBSCRIPTION_REQUEST_TYPE_COLORS,
  SUBSCRIPTION_REQUEST_TYPE_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import type { SubscriptionRequest } from "@/types/domain/subscriptionRequest";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Flame, XCircle } from "lucide-react";
import { canReviewRequest, wipesDataOnApproval } from "./request-actions";

interface SubscriptionRequestColumnActions {
  onApprove: (record: SubscriptionRequest) => void;
  onReject: (record: SubscriptionRequest) => void;
}

export const subscriptionRequestColumns = ({
  onApprove,
  onReject,
}: SubscriptionRequestColumnActions): ColumnDef<SubscriptionRequest>[] => [
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
          {formatAmount(row.original.amount, row.original.currency)}
        </span>
        {row.original.type === "CANCELLATION" && (
          <p className="text-xs text-muted-foreground">
            Refund {formatAmount(row.original.refundAmount, row.original.currency)}
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
    cell: ({ row }) =>
      canReviewRequest(row.original) ? (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-emerald-600 hover:text-emerald-600"
            onClick={() => onApprove(row.original)}
            aria-label={`Approve the request from ${row.original.companyName}`}
            title="Approve request"
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
            onClick={() => onReject(row.original)}
            aria-label={`Reject the request from ${row.original.companyName}`}
            title="Reject request"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">
            {row.original.reviewedAt ? formatDate(row.original.reviewedAt) : "—"}
          </span>
        </div>
      ),
  },
];
