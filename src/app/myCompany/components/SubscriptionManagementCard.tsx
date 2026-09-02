import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SUBSCRIPTION_REQUEST_STATUS_COLORS,
  SUBSCRIPTION_REQUEST_STATUS_LABELS,
  SUBSCRIPTION_REQUEST_TYPE_LABELS,
  SUBSCRIPTION_STATUS_COLORS,
  SUBSCRIPTION_STATUS_LABELS,
} from "@/constant";
import { formatAmount } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import { useGetMySubscriptionRequestsQuery } from "@/redux/apis/subscriptionRequestApis";
import type { CompanyInvoice } from "@/types/domain/company";
import type { SubscriptionStatus } from "@/types/domain/soldSubscription";
import { ArrowUpCircle, Ban, ShieldCheck } from "lucide-react";
import * as React from "react";
import { CancelSubscriptionModal } from "./CancelSubscriptionModal";
import { UpgradePlanModal } from "./UpgradePlanModal";

interface SubscriptionManagementCardProps {
  currentPlanId: string | null;
  currentPlanName: string;
  subscription: CompanyInvoice | null;
  isLoading: boolean;
}

const RUNNING_STATUSES: SubscriptionStatus[] = ["TRIALING", "ACTIVE"];

export function SubscriptionManagementCard({
  currentPlanId,
  currentPlanName,
  subscription,
  isLoading,
}: SubscriptionManagementCardProps) {
  const { data: requests } = useGetMySubscriptionRequestsQuery();
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);

  const pending = requests?.find((request) => request.status === "PENDING") ?? null;
  const status = subscription?.status as SubscriptionStatus | undefined;
  const isRunning = status !== undefined && RUNNING_STATUSES.includes(status);
  const isOnTrial = status === "TRIALING";

  return (
    <SectionCard
      icon={ShieldCheck}
      title="Your subscription"
      description="Change your plan or close your account here."
    >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      ) : !subscription ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No subscription is attached to this company yet.
        </p>
      ) : (
        <>
          <dl className="divide-y text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="font-medium">{currentPlanName}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-muted-foreground">State</dt>
              <dd>
                <StatusBadge
                  color={status ? SUBSCRIPTION_STATUS_COLORS[status] : "muted"}
                  label={status ? SUBSCRIPTION_STATUS_LABELS[status] : subscription.status}
                />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-muted-foreground">Term</dt>
              <dd className="font-medium">
                {formatDate(subscription.startDate)} — {formatDate(subscription.endDate)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium tabular-nums">
                {formatAmount(subscription.amount, subscription.currency)}
              </dd>
            </div>
          </dl>

          {isOnTrial && (
            <p className="mt-3 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-xs text-muted-foreground">
              You are on a free trial. Your first invoice is raised when the trial ends, and
              cancelling before then leaves your data untouched.
            </p>
          )}

          {pending ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="font-medium">
                  {SUBSCRIPTION_REQUEST_TYPE_LABELS[pending.type]} requested
                </p>
                <p className="text-xs text-muted-foreground">
                  Sent {formatDate(pending.requestedAt)} · our team is reviewing it
                </p>
              </div>
              <StatusBadge
                color={SUBSCRIPTION_REQUEST_STATUS_COLORS[pending.status]}
                label={SUBSCRIPTION_REQUEST_STATUS_LABELS[pending.status]}
              />
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-4">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setUpgradeOpen(true)}
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Change plan
              </Button>
              <Button
                variant="destructive"
                className="cursor-pointer"
                disabled={!isRunning}
                onClick={() => setCancelOpen(true)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel subscription
              </Button>
            </div>
          )}
        </>
      )}

      <UpgradePlanModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        currentPlanId={currentPlanId}
        currentPlanName={currentPlanName}
      />

      <CancelSubscriptionModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        planName={currentPlanName}
        erasesData={!isOnTrial}
      />
    </SectionCard>
  );
}
