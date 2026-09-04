import { ClockCard } from "@/components/shared/clock-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { cn } from "@/lib/utils";
import { useGetMyTodayQuery } from "@/redux/apis/attendanceApis";
import { useGetMyShiftPlanQuery } from "@/redux/apis/employeeShiftApis";
import { useGetMyGoalSummaryQuery, useGetMyGoalsQuery } from "@/redux/apis/goalApis";
import { useGetMyTaskSummaryQuery, useGetMyTasksQuery } from "@/redux/apis/taskApis";
import {
  useGetMyTimesheetSummaryQuery,
  useGetMyTimesheetWeekQuery,
} from "@/redux/apis/timesheetApis";
import { useGetMyWorkHistoryQuery } from "@/redux/apis/workHistoryApis";
import { formatMinutes } from "@/types/domain/attendance";
import type { DaySchedule } from "@/types/domain/employeeShift";
import { GOAL_STATUS_COLORS, GOAL_STATUS_LABELS } from "@/types/domain/goal";
import { TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from "@/types/domain/task";
import { TIMESHEET_STATUS_COLORS, formatHours } from "@/types/domain/timesheet";
import { WORK_HISTORY_TYPE_COLORS } from "@/types/domain/workHistory";
import {
  Activity,
  CalendarRange,
  Clock,
  ListChecks,
  Target,
  Timer,
} from "lucide-react";
import { Link } from "react-router-dom";

const formatDay = (value: string): string =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

const scheduleLabel = (day: DaySchedule): string => {
  if (day.kind === "HOLIDAY") return day.holidayName || "Holiday";
  if (day.kind === "WEEK_OFF") return "Day off";
  return day.shiftName || "Shift";
};

const dueLabel = (value: string | null): string => {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

export default function MyWorkOverviewPage() {
  const { data: today, isLoading: isTodayLoading } = useGetMyTodayQuery();
  const { data: plan, isLoading: isPlanLoading } = useGetMyShiftPlanQuery();
  const { data: week } = useGetMyTimesheetWeekQuery();
  const { data: timesheetSummary } = useGetMyTimesheetSummaryQuery();
  const { data: taskSummary } = useGetMyTaskSummaryQuery();
  const { data: goalSummary } = useGetMyGoalSummaryQuery();

  const { data: tasks, isLoading: isTasksLoading } = useGetMyTasksQuery({
    limit: 5,
    isCompleted: false,
    sortBy: "dueAt",
    sortOrder: "asc",
  });
  const { data: goals, isLoading: isGoalsLoading } = useGetMyGoalsQuery({
    limit: 4,
    sortBy: "dueDate",
    sortOrder: "asc",
  });
  const { data: history } = useGetMyWorkHistoryQuery({
    limit: 4,
    sortBy: "effectiveDate",
    sortOrder: "desc",
  });

  const upcoming = (plan?.upcoming ?? []).slice(0, 6);
  const weekTotals = week?.totals;
  const weekProgress =
    weekTotals && weekTotals.scheduledHours > 0
      ? Math.min(100, Math.round((weekTotals.loggedHours / weekTotals.scheduledHours) * 100))
      : 0;

  return (
    <>
      <PageHeader
        title="My work"
        description="Your shift today, your punches, and what is due from you."
      />

      <StatGrid className="sm:grid-cols-2 lg:grid-cols-4">
        <Stat>
          <StatLabel>Logged today</StatLabel>
          <StatValue>{today ? formatMinutes(today.workedMinutes) : "—"}</StatValue>
          <StatDescription>
            {today?.isClockedIn ? "You are clocked in" : "You are clocked out"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Booked this week</StatLabel>
          <StatValue>{weekTotals ? formatHours(weekTotals.loggedHours) : "—"}</StatValue>
          <StatDescription>
            {weekTotals
              ? `of ${formatHours(weekTotals.scheduledHours)} scheduled`
              : "Nothing booked"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Tasks on you</StatLabel>
          <StatValue>{taskSummary?.openCount ?? "—"}</StatValue>
          <StatDescription>
            {taskSummary && taskSummary.overdueCount > 0
              ? `${taskSummary.overdueCount} overdue`
              : "Nothing overdue"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Goals in play</StatLabel>
          <StatValue>{goalSummary?.openCount ?? "—"}</StatValue>
          <StatDescription>
            {goalSummary ? `${goalSummary.averageProgress}% average progress` : "Your targets"}
          </StatDescription>
        </Stat>
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          icon={Clock}
          title="Today"
          description="Punch in and out, and see where the day stands."
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/hrms/my-work/attendance">See all</Link>
            </Button>
          }
        >
          <ClockCard today={today} isLoading={isTodayLoading} compact />
        </SectionCard>

        <SectionCard
          icon={CalendarRange}
          title="Coming up"
          description="The days you are scheduled for next."
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/hrms/my-work/shifts">Full rota</Link>
            </Button>
          }
        >
          {isPlanLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing scheduled for the days ahead.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {upcoming.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{formatDay(day.date)}</span>
                  <div className="text-right">
                    <p className="text-xs">{scheduleLabel(day)}</p>
                    {day.kind === "SHIFT" && day.startTime && (
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {day.startTime} – {day.endTime}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={Timer}
          title="This week's hours"
          description="Where your timesheet stands right now."
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/hrms/my-work/timesheet">Open</Link>
            </Button>
          }
        >
          {!week ? (
            <Skeleton className="h-24 w-full rounded-lg" />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {formatHours(week.totals.loggedHours)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    over {week.totals.daysLogged} day
                    {week.totals.daysLogged === 1 ? "" : "s"}
                  </p>
                </div>
                <StatusBadge
                  color={TIMESHEET_STATUS_COLORS[week.status]}
                  label={week.statusLabel}
                />
              </div>

              <div className="space-y-1.5">
                <Progress value={weekProgress} />
                <p className="text-xs text-muted-foreground">
                  {formatHours(week.totals.scheduledHours)} scheduled ·{" "}
                  {formatHours(week.totals.billableHours)} billable
                </p>
              </div>

              {timesheetSummary && timesheetSummary.rejectedHours > 0 && (
                <p className="text-xs font-medium text-red-600">
                  {formatHours(timesheetSummary.rejectedHours)} came back for a second look.
                </p>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={ListChecks}
          title="Due from you"
          description="The next few cards with your name on them."
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/hrms/my-work/tasks">All tasks</Link>
            </Button>
          }
        >
          {isTasksLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (tasks?.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing is waiting on you. Enjoy it while it lasts.
            </p>
          ) : (
            <div className="divide-y rounded-lg border">
              {(tasks?.data ?? []).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {task.board?.name ?? "No board"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        task.isOverdue ? "font-medium text-red-600" : "text-muted-foreground"
                      )}
                    >
                      {dueLabel(task.dueAt)}
                    </span>
                    <StatusBadge
                      color={TASK_PRIORITY_COLORS[task.priority]}
                      label={TASK_PRIORITY_LABELS[task.priority]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          icon={Target}
          title="What you are measured on"
          description="Your live targets and how far along they are."
          action={
            <Button asChild variant="ghost" size="sm" className="cursor-pointer">
              <Link to="/hrms/my-work/goals">All goals</Link>
            </Button>
          }
        >
          {isGoalsLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : (goals?.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No targets have been set for you yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {(goals?.data ?? []).map((goal) => (
                <div key={goal._id} className="space-y-1.5 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{goal.title}</p>
                    <StatusBadge
                      color={GOAL_STATUS_COLORS[goal.status]}
                      label={GOAL_STATUS_LABELS[goal.status]}
                    />
                  </div>
                  <Progress value={goal.progress} />
                  <p className="text-xs text-muted-foreground">
                    {goal.progress}% done · {dueLabel(goal.dueDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        icon={Activity}
        title="Recent milestones"
        description="The last few steps recorded against your record."
        action={
          <Button asChild variant="ghost" size="sm" className="cursor-pointer">
            <Link to="/hrms/my-work/work-history">Full history</Link>
          </Button>
        }
      >
        {(history?.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing has been recorded against your record yet.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {(history?.data ?? []).map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {entry.title || entry.typeLabel}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {entry.toLabel || entry.typeLabel}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge
                    color={WORK_HISTORY_TYPE_COLORS[entry.type]}
                    label={entry.typeLabel}
                  />
                  <span className="text-xs text-muted-foreground">
                    {formatDay(entry.effectiveDate)}
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
