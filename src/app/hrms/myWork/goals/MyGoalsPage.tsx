import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useGetMyGoalSummaryQuery, useGetMyGoalsQuery } from "@/redux/apis/goalApis";
import {
  GOAL_CATEGORY_LABELS,
  GOAL_STATUS_COLORS,
  GOAL_STATUS_LABELS,
  type Goal,
  type GoalMetric,
} from "@/types/domain/goal";
import { CheckCircle2, Circle, Flag, Target } from "lucide-react";
import * as React from "react";

const FILTERS = [
  { id: "open", label: "Live" },
  { id: "overdue", label: "Overdue" },
  { id: "closed", label: "Closed" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

const OPEN_STATUSES = new Set(["NOT_STARTED", "ON_TRACK", "AT_RISK", "OFF_TRACK"]);

const formatValue = (metric: GoalMetric, value: number): string => {
  if (metric.metricType === "PERCENT") return `${value}%`;
  const formatted = new Intl.NumberFormat().format(value);
  return metric.unit ? `${formatted} ${metric.unit}` : formatted;
};

const formatDue = (value: string | null): string => {
  if (!value) return "No end date";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function MyGoalsPage() {
  const [filter, setFilter] = React.useState<FilterId>("open");

  const { data: summary } = useGetMyGoalSummaryQuery();
  const { data, isFetching } = useGetMyGoalsQuery({
    limit: 100,
    sortBy: "dueDate",
    sortOrder: "asc",
  });

  const rows = (data?.data ?? []).filter((goal) => {
    if (filter === "overdue") return goal.isOverdue;
    if (filter === "closed") return !OPEN_STATUSES.has(goal.status);
    return OPEN_STATUSES.has(goal.status);
  });

  return (
    <>
      <PageHeader
        title="My goals & KPIs"
        description="The targets you are measured against this cycle."
      />

      <StatGrid className="sm:grid-cols-2 lg:grid-cols-4">
        <Stat>
          <StatLabel>Live goals</StatLabel>
          <StatValue>{summary?.openCount ?? "—"}</StatValue>
          <StatDescription>
            {summary ? `${summary.total} on you in total` : "Yours to move"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Average progress</StatLabel>
          <StatValue>{summary ? `${summary.averageProgress}%` : "—"}</StatValue>
          <StatDescription>Across everything you own</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Needs a push</StatLabel>
          <StatValue>{summary?.atRiskCount ?? "—"}</StatValue>
          <StatDescription>
            {summary ? `${summary.overdueCount} past their date` : "At risk or off track"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Achieved</StatLabel>
          <StatValue>{summary?.achievedCount ?? "—"}</StatValue>
          <StatDescription>
            {summary ? `${summary.dueSoonCount} closing soon` : "Landed"}
          </StatDescription>
        </Stat>
      </StatGrid>

      <SectionCard
        icon={Target}
        title="Your targets"
        description="Progress rolls up from the key results underneath each goal."
        action={
          <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterId)}>
            <TabsList>
              {FILTERS.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="cursor-pointer">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      >
        {isFetching ? (
          <LoadingSpinner />
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-16 text-center">
            <Target className="size-7 text-muted-foreground" />
            <p className="font-medium">
              {filter === "closed" ? "Nothing closed yet" : "No goals set for you"}
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              {filter === "overdue"
                ? "Nothing has run past its end date."
                : "When your manager sets you a target or names you on one, it shows up here."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {rows.map((goal) => (
              <GoalCard key={goal._id} goal={goal} />
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: goal.color }}
            />
            <p className="truncate font-semibold">{goal.title}</p>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            <span className="font-mono">{goal.code}</span>
            {` · ${GOAL_CATEGORY_LABELS[goal.category]}`}
            {goal.department && ` · ${goal.department.name}`}
          </p>
        </div>
        <StatusBadge
          color={GOAL_STATUS_COLORS[goal.status]}
          label={GOAL_STATUS_LABELS[goal.status]}
        />
      </div>

      {goal.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{goal.description}</p>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {formatValue(goal.metric, goal.metric.currentValue)} of{" "}
            {formatValue(goal.metric, goal.metric.targetValue)}
          </span>
          <span className="font-semibold tabular-nums">{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} />
      </div>

      {goal.keyResults.length > 0 && (
        <div className="space-y-1.5 border-t pt-3">
          {goal.keyResults.slice(0, 4).map((keyResult) => (
            <div key={keyResult._id} className="flex items-center gap-2 text-xs">
              {keyResult.isCompleted ? (
                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "min-w-0 flex-1 truncate",
                  keyResult.isCompleted && "text-muted-foreground line-through"
                )}
              >
                {keyResult.title}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {keyResult.progress}%
              </span>
            </div>
          ))}
          {goal.keyResults.length > 4 && (
            <p className="text-xs text-muted-foreground">
              +{goal.keyResults.length - 4} more key results
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            goal.isOverdue ? "font-medium text-red-600" : "text-muted-foreground"
          )}
        >
          <Flag className="size-3.5" />
          {formatDue(goal.dueDate)}
          {goal.daysRemaining !== null &&
            goal.isOpen &&
            ` · ${goal.daysRemaining} days left`}
        </span>
        {goal.owner && (
          <Badge variant="outline" className="text-[10px]">
            {goal.ownerId && goal.owner.name ? `Owned by ${goal.owner.name}` : "Owned by you"}
          </Badge>
        )}
      </div>
    </div>
  );
}
