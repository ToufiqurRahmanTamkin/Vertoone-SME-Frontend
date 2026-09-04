import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useGetPolicyOverviewQuery } from "@/redux/apis/policyApis";
import {
  POLICY_CATEGORY_LABELS,
  POLICY_STATUS_COLORS,
  POLICY_STATUS_LABELS,
  type Policy,
} from "@/types/domain/policy";
import { ArrowRight, CalendarClock, CheckCircle2, ScrollText, TrendingDown } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { PolicyViewModal } from "../handbook/components/PolicyViewModal";

const formatDay = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function PoliciesOverviewPage() {
  const { data, isLoading } = useGetPolicyOverviewQuery();
  const [viewing, setViewing] = React.useState<Policy | null>(null);

  if (isLoading || !data) {
    return (
      <>
        <PageHeader
          title="Policies"
          description="The rules everyone works to, and how well they are landing."
        />
        <LoadingSpinner />
      </>
    );
  }

  const { summary } = data;

  return (
    <>
      <PageHeader
        title="Policies"
        description="The rules everyone works to, and how well they are landing."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Published</StatLabel>
          <StatValue>{summary.publishedCount}</StatValue>
          <StatDescription>
            {summary.draftCount} in draft · {summary.archivedCount} archived
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Acknowledgement</StatLabel>
          <StatValue>{summary.acknowledgementRate}%</StatValue>
          <StatDescription className="space-y-1.5">
            <Progress value={summary.acknowledgementRate} className="h-1.5" />
            <span>{summary.needsAcknowledgementCount} policies ask for it</span>
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Due for review</StatLabel>
          <StatValue>{summary.reviewDueCount}</StatValue>
          <StatDescription>Past the date you set to look at them again</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Waiting on you</StatLabel>
          <StatValue>{summary.pendingForMe}</StatValue>
          <StatDescription>Policies you have not acknowledged</StatDescription>
        </Stat>
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={CheckCircle2}
          title="Waiting on your acknowledgement"
          description="Read these and confirm you have."
          contentClassName="space-y-2"
        >
          {data.awaitingMyAcknowledgement.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              You are up to date on everything that applies to you.
            </p>
          ) : (
            data.awaitingMyAcknowledgement.map((policy) => (
              <button
                key={policy._id}
                type="button"
                onClick={() => setViewing(policy)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 text-left transition hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{policy.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {POLICY_CATEGORY_LABELS[policy.category]} · v{policy.version}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))
          )}
        </SectionCard>

        <SectionCard
          icon={CalendarClock}
          title="Coming up for review"
          description="Policies that need another look soon."
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/hrms/policies/handbook">
                Handbook
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
          contentClassName="space-y-2"
        >
          {data.reviewDueSoon.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing needs reviewing this month.
            </p>
          ) : (
            data.reviewDueSoon.map((policy) => (
              <div
                key={policy._id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{policy.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Review by {formatDay(policy.reviewDueAt)}
                  </p>
                </div>
                <StatusBadge
                  color={policy.isReviewDue ? "red" : "amber"}
                  label={policy.isReviewDue ? "Overdue" : "Soon"}
                />
              </div>
            ))
          )}
        </SectionCard>

        <SectionCard
          icon={TrendingDown}
          title="Least acknowledged"
          description="Where people have not confirmed reading."
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/hrms/policies/acknowledgements">
                Acknowledgements
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
          contentClassName="space-y-2"
        >
          {data.lowestCoverage.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing is being tracked for acknowledgement yet.
            </p>
          ) : (
            data.lowestCoverage.map((row) => (
              <div key={row.policyId} className="space-y-1.5 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-medium">{row.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{row.rate}%</span>
                </div>
                <Progress value={row.rate} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  {row.acknowledged} {row.acknowledged === 1 ? "person has" : "people have"}{" "}
                  confirmed
                </p>
              </div>
            ))
          )}
        </SectionCard>

        <SectionCard
          icon={ScrollText}
          title="By category"
          description="What kinds of policy you keep."
          contentClassName="space-y-2"
        >
          {data.byCategory.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No policies written yet.
            </p>
          ) : (
            data.byCategory.map((row) => (
              <div
                key={row.category}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <Badge variant="secondary" className="text-[10px]">
                  {POLICY_CATEGORY_LABELS[row.category]}
                </Badge>
                <span className="text-sm font-semibold">{row.count}</span>
              </div>
            ))
          )}
        </SectionCard>
      </div>

      {data.byStatus.length > 0 && (
        <SectionCard
          icon={ScrollText}
          title="Where policies stand"
          description="Drafts, published and archived."
          contentClassName="grid gap-2 sm:grid-cols-3"
        >
          {data.byStatus.map((row) => (
            <div
              key={row.status}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <StatusBadge
                color={POLICY_STATUS_COLORS[row.status]}
                label={POLICY_STATUS_LABELS[row.status]}
              />
              <span className="text-sm font-semibold">{row.count}</span>
            </div>
          ))}
        </SectionCard>
      )}

      <PolicyViewModal
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
        policy={viewing}
        showAcknowledge
      />
    </>
  );
}
