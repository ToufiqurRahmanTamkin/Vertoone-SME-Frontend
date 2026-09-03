import { BreakdownBars, type BreakdownRow } from "@/app/dashboard/components/BreakdownBars";
import { KpiCard } from "@/app/dashboard/components/KpiCard";
import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StatGrid } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { formatNumber } from "@/lib/amount";
import { formatDate, safeDistanceToNow } from "@/lib/date";
import { useGetTasksGoalsOverviewQuery } from "@/redux/apis/tasksGoalsOverviewApis";
import { GOAL_STATUS_COLORS, GOAL_STATUS_LABELS } from "@/types/domain/goal";
import { TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from "@/types/domain/task";
import {
  AlarmClock,
  CalendarClock,
  CircleCheckBig,
  ClipboardList,
  LayoutList,
  ListChecks,
  Pin,
  StickyNote,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { TasksTrendChart } from "./components/TasksTrendChart";

const LIST_SKELETON = Array.from({ length: 5 });

export default function TasksGoalsOverviewPage() {
  const { data, isLoading } = useGetTasksGoalsOverviewQuery();

  const tasksAccess = useModulePermission("/company/tasks-and-goals/tasks");
  const goalsAccess = useModulePermission("/company/tasks-and-goals/goals");
  const notesAccess = useModulePermission("/company/tasks-and-goals/notes");

  const tasks = data?.kpis.tasks;
  const goals = data?.kpis.goals;
  const notes = data?.kpis.notes;
  const boards = data?.kpis.boards;

  const kpiCards = [
    {
      label: "Open tasks",
      value: formatNumber(tasks?.open),
      description: `${formatNumber(tasks?.total)} in total across ${formatNumber(
        boards?.active
      )} active board(s)`,
      icon: ListChecks,
      color: "info" as const,
    },
    {
      label: "Completion rate",
      value: `${tasks?.completionRate ?? 0}%`,
      description: `${formatNumber(tasks?.completedThisMonth)} closed this month`,
      icon: CircleCheckBig,
      color: "success" as const,
      changePercent: tasks?.completedChangePercent,
    },
    {
      label: "Overdue",
      value: formatNumber(tasks?.overdue),
      description: `${formatNumber(tasks?.dueToday)} due today · ${formatNumber(
        tasks?.unassigned
      )} unassigned`,
      icon: AlarmClock,
      color: (tasks?.overdue ?? 0) > 0 ? ("error" as const) : ("default" as const),
    },
    {
      label: "Goal progress",
      value: `${goals?.averageProgress ?? 0}%`,
      description: `${formatNumber(goals?.open)} open · ${formatNumber(
        goals?.achieved
      )} achieved`,
      icon: Target,
      color: "info" as const,
    },
  ];

  const healthCards = [
    {
      label: "Goals at risk",
      value: formatNumber((goals?.atRisk ?? 0) + (goals?.offTrack ?? 0)),
      description: `${formatNumber(goals?.atRisk)} at risk · ${formatNumber(
        goals?.offTrack
      )} off track`,
      icon: TrendingUp,
      color:
        (goals?.atRisk ?? 0) + (goals?.offTrack ?? 0) > 0
          ? ("warning" as const)
          : ("success" as const),
    },
    {
      label: "Goals overdue",
      value: formatNumber(goals?.overdue),
      description: `${formatNumber(goals?.dueSoon)} due in the next 2 weeks`,
      icon: CalendarClock,
      color: (goals?.overdue ?? 0) > 0 ? ("error" as const) : ("default" as const),
    },
    {
      label: "Notes",
      value: formatNumber(notes?.total),
      description: `${formatNumber(notes?.pinned)} pinned · ${formatNumber(
        notes?.archived
      )} archived`,
      icon: StickyNote,
      color: "default" as const,
    },
    {
      label: "Reminders due",
      value: formatNumber(notes?.reminderDue),
      description: "Notes whose reminder has already passed",
      icon: AlarmClock,
      color: (notes?.reminderDue ?? 0) > 0 ? ("warning" as const) : ("default" as const),
    },
  ];

  const priorityRows: BreakdownRow[] = (data?.priorities ?? [])
    .filter((point) => point.count > 0)
    .map((point) => ({
      key: point.priority,
      label: TASK_PRIORITY_LABELS[point.priority],
      count: point.count,
      color: TASK_PRIORITY_COLORS[point.priority],
    }));

  const goalStatusRows: BreakdownRow[] = (data?.goalStatuses ?? [])
    .filter((point) => point.count > 0)
    .map((point) => ({
      key: point.status,
      label: GOAL_STATUS_LABELS[point.status],
      count: point.count,
      color: GOAL_STATUS_COLORS[point.status],
    }));

  return (
    <>
      <PageHeader
        title="Tasks &amp; Goals overview"
        description="Workload per person, how much is getting finished, and where every goal stands."
      />

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <StatGrid className="sm:grid-cols-2 xl:grid-cols-4">
        {healthCards.map((card) => (
          <KpiCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </StatGrid>

      <SectionCard
        icon={TrendingUp}
        title="Created against completed"
        description="Twelve months of task flow. Bars are what was raised, the line is what was finished."
      >
        <TasksTrendChart points={data?.trend ?? []} isLoading={isLoading} />
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={Users}
          title="Workload per person"
          description="Who is carrying what, and how much of it they are closing."
          action={
            tasksAccess.canView && (
              <Link
                to="/company/tasks-and-goals/tasks"
                className="text-sm font-medium text-primary hover:underline"
              >
                All tasks
              </Link>
            )
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : (data?.workload ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No tasks are assigned to anybody yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {(data?.workload ?? []).map((row) => (
                <li key={row.key} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {row.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{row.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{row.subtitle}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">{row.completionRate}%</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(row.completed)}/{formatNumber(row.total)} done
                      </p>
                    </div>
                  </div>
                  <Progress value={row.completionRate} className="mt-2.5 h-1.5" />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {formatNumber(row.open)} open
                    </Badge>
                    {row.overdue > 0 && (
                      <StatusBadge color="red" label={`${row.overdue} overdue`} />
                    )}
                    {row.dueSoon > 0 && (
                      <StatusBadge color="amber" label={`${row.dueSoon} due soon`} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={Target}
          title="Goal progress"
          description="Open goals, closest deadline first, with the key results behind each one."
          action={
            goalsAccess.canView && (
              <Link
                to="/company/tasks-and-goals/goals"
                className="text-sm font-medium text-primary hover:underline"
              >
                All goals
              </Link>
            )
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (data?.goalProgress ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No open goals. Set one so the work has something to roll up to.
            </p>
          ) : (
            <ul className="space-y-3">
              {(data?.goalProgress ?? []).map((goal) => (
                <li key={goal._id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <ColorChip color={goal.color} label={goal.title} />
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        <span className="font-mono uppercase">{goal.code}</span>
                        {" · "}
                        {goal.ownerName}
                      </p>
                    </div>
                    <StatusBadge
                      color={GOAL_STATUS_COLORS[goal.status]}
                      label={GOAL_STATUS_LABELS[goal.status]}
                    />
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <Progress value={goal.progress} className="h-1.5 flex-1" />
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {goal.keyResultCount > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {goal.completedKeyResultCount}/{goal.keyResultCount} key results
                      </Badge>
                    )}
                    {goal.dueDate && (
                      <StatusBadge
                        color={goal.isOverdue ? "red" : "zinc"}
                        label={`${goal.isOverdue ? "Overdue" : "Due"} ${formatDate(goal.dueDate)}`}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={LayoutList}
          title="Boards"
          description="Where the work lives, and how much of each board is finished."
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.boards ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No boards yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {(data?.boards ?? []).map((board) => (
                <li key={board._id}>
                  <div className="flex items-baseline justify-between gap-3">
                    {tasksAccess.canView ? (
                      <Link
                        to={`/company/tasks-and-goals/tasks/${board._id}`}
                        className="min-w-0 hover:underline"
                      >
                        <ColorChip color={board.color} label={board.name} />
                      </Link>
                    ) : (
                      <ColorChip color={board.color} label={board.name} />
                    )}
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatNumber(board.completed)}/{formatNumber(board.total)}
                      {board.overdue > 0 && (
                        <span className="ml-1.5 text-destructive">{board.overdue} late</span>
                      )}
                    </span>
                  </div>
                  <Progress value={board.completionRate} className="mt-1.5 h-1.5" />
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <div className="grid gap-4">
          <SectionCard
            icon={ClipboardList}
            title="Open tasks by priority"
            description="What is still outstanding, weighted by how urgent it is."
          >
            <BreakdownBars
              rows={priorityRows}
              isLoading={isLoading}
              emptyMessage="Nothing outstanding."
              rowCount={4}
            />
          </SectionCard>

          <SectionCard
            icon={Target}
            title="Goals by status"
            description="Every goal on the board, grouped by where it stands."
          >
            <BreakdownBars
              rows={goalStatusRows}
              isLoading={isLoading}
              emptyMessage="No goals yet."
              rowCount={4}
            />
          </SectionCard>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          icon={CalendarClock}
          title="Due next"
          description="The tasks with the nearest deadlines that are still open."
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.upcomingTasks ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing with a due date is outstanding.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.upcomingTasks ?? []).map((task) => (
                <li key={task._id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      <span className="font-mono uppercase">{task.code}</span>
                      {" · "}
                      {task.boardName}
                      {task.assigneeNames.length > 0 && ` · ${task.assigneeNames.join(", ")}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge
                      color={TASK_PRIORITY_COLORS[task.priority]}
                      label={TASK_PRIORITY_LABELS[task.priority]}
                    />
                    {task.dueAt && (
                      <span
                        className={
                          task.isOverdue
                            ? "text-xs font-medium text-destructive"
                            : "text-xs text-muted-foreground"
                        }
                      >
                        {safeDistanceToNow(task.dueAt)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={StickyNote}
          title="Recent notes"
          description="Pinned notes first, then whatever was touched most recently."
          action={
            notesAccess.canView && (
              <Link
                to="/company/tasks-and-goals/notes"
                className="text-sm font-medium text-primary hover:underline"
              >
                All notes
              </Link>
            )
          }
        >
          {isLoading ? (
            <div className="space-y-3">
              {LIST_SKELETON.map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : (data?.recentNotes ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No notes yet.
            </p>
          ) : (
            <ul className="divide-y">
              {(data?.recentNotes ?? []).map((note) => (
                <li key={note._id} className="py-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-1.5">
                      {note.isPinned && (
                        <Pin className="size-3 shrink-0 text-amber-500" aria-label="Pinned" />
                      )}
                      <ColorChip color={note.color} label={note.title} />
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {safeDistanceToNow(note.updatedAt)}
                    </span>
                  </div>
                  {note.excerpt && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {note.excerpt}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
