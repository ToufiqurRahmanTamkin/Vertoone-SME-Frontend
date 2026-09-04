import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  useGetMyTaskSummaryQuery,
  useGetMyTasksQuery,
  useSetMyTaskCompletionMutation,
} from "@/redux/apis/taskApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS,
  type Task,
} from "@/types/domain/task";
import { CheckCircle2, Circle, ListChecks, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const FILTERS = [
  { id: "open", label: "To do" },
  { id: "overdue", label: "Overdue" },
  { id: "done", label: "Done" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

const formatDue = (value: string | null): string => {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function MyTasksPage() {
  const [filter, setFilter] = React.useState<FilterId>("open");

  const { data: summary } = useGetMyTaskSummaryQuery();
  const { data, isFetching } = useGetMyTasksQuery({
    limit: 100,
    isCompleted: filter === "done",
    sortBy: "dueAt",
    sortOrder: filter === "done" ? "desc" : "asc",
  });

  const [setCompletion, { isLoading: isSaving }] = useSetMyTaskCompletionMutation();

  const rows = (data?.data ?? []).filter((task) =>
    filter === "overdue" ? task.isOverdue : true
  );

  const toggle = async (task: Task) => {
    try {
      await setCompletion({ id: task._id, isCompleted: !task.isCompleted }).unwrap();
      toast.success(task.isCompleted ? "Moved back to your list" : "Marked as done");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update that task");
    }
  };

  return (
    <>
      <PageHeader
        title="My tasks"
        description="Work assigned to you, and what is due next."
      />

      <StatGrid className="sm:grid-cols-2 lg:grid-cols-4">
        <Stat>
          <StatLabel>Still to do</StatLabel>
          <StatValue>{summary?.openCount ?? "—"}</StatValue>
          <StatDescription>Assigned to you and open</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Due today</StatLabel>
          <StatValue>{summary?.dueTodayCount ?? "—"}</StatValue>
          <StatDescription>
            {summary ? `${summary.dueThisWeekCount} due this week` : "Nothing yet"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Overdue</StatLabel>
          <StatValue>{summary?.overdueCount ?? "—"}</StatValue>
          <StatDescription>
            {summary && summary.overdueCount > 0 ? "Needs your attention" : "All caught up"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Finished</StatLabel>
          <StatValue>{summary?.completedCount ?? "—"}</StatValue>
          <StatDescription>
            {summary ? `${summary.completionRate}% of everything on you` : "Nothing yet"}
          </StatDescription>
        </Stat>
      </StatGrid>

      {summary && summary.total > 0 && (
        <div className="space-y-1.5">
          <Progress value={summary.completionRate} />
          <p className="text-xs text-muted-foreground">
            {summary.completedCount} of {summary.total} tasks done
          </p>
        </div>
      )}

      <SectionCard
        icon={ListChecks}
        title="Your list"
        description="Everything with your name on it, soonest first."
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
            <ListChecks className="size-7 text-muted-foreground" />
            <p className="font-medium">
              {filter === "done" ? "Nothing finished yet" : "Nothing on your plate"}
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              {filter === "overdue"
                ? "Nothing has slipped past its due date. Keep it that way."
                : "When a colleague puts your name on a card, it turns up here."}
            </p>
          </div>
        ) : (
          <div className="divide-y rounded-lg border">
            {rows.map((task) => (
              <div key={task._id} className="flex items-start gap-3 px-3 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 size-7 shrink-0 cursor-pointer"
                  aria-label={task.isCompleted ? "Mark as not done" : "Mark as done"}
                  disabled={isSaving}
                  onClick={() => toggle(task)}
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : task.isCompleted ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground" />
                  )}
                </Button>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate font-medium",
                      task.isCompleted && "text-muted-foreground line-through"
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-mono">{task.code}</span>
                    {task.board && (
                      <>
                        <span>·</span>
                        <span className="truncate">{task.board.name}</span>
                      </>
                    )}
                    {task.list && (
                      <>
                        <span>·</span>
                        <span className="truncate">{task.list.name}</span>
                      </>
                    )}
                    {task.checklistItemCount > 0 && (
                      <>
                        <span>·</span>
                        <span>
                          {task.checklistCheckedCount}/{task.checklistItemCount} checked
                        </span>
                      </>
                    )}
                  </div>
                  {task.labels.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {task.labels.map((label) => (
                        <Badge key={label._id} variant="secondary" className="text-[10px]">
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge
                    color={TASK_PRIORITY_COLORS[task.priority]}
                    label={TASK_PRIORITY_LABELS[task.priority]}
                  />
                  <span
                    className={cn(
                      "text-xs",
                      task.isOverdue && !task.isCompleted
                        ? "font-medium text-red-600"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatDue(task.dueAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}
