import { PageHeader } from "@/components/shared/page-header";
import { RowActions } from "@/components/shared/row-actions";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { cn } from "@/lib/utils";
import {
  useDeleteTimesheetEntryMutation,
  useGetMyTimesheetSummaryQuery,
  useGetMyTimesheetWeekQuery,
  useSubmitTimesheetWeekMutation,
  useWithdrawTimesheetWeekMutation,
} from "@/redux/apis/timesheetApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import { WEEKDAY_SHORT_LABELS } from "@/types/domain/employeeShift";
import {
  TIMESHEET_STATUS_COLORS,
  describeEntry,
  formatHours,
  type TimesheetDay,
  type TimesheetEntry,
} from "@/types/domain/timesheet";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { LogHoursModal } from "./components/LogHoursModal";

const dayKey = (value: Date): string => value.toISOString().slice(0, 10);

const mondayOf = (value: Date): Date => {
  const stamp = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  stamp.setUTCDate(stamp.getUTCDate() - ((stamp.getUTCDay() + 6) % 7));
  return stamp;
};

const shiftWeek = (value: string, weeks: number): string => {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + weeks * 7);
  return dayKey(next);
};

const formatRange = (from: string, to: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  };
  return `${new Date(from).toLocaleDateString(undefined, options)} – ${new Date(
    to
  ).toLocaleDateString(undefined, { ...options, year: "numeric" })}`;
};

const dayLabel = (value: string): string =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

export default function MyTimesheetPage() {
  const [weekStart, setWeekStart] = React.useState(() => dayKey(mondayOf(new Date())));
  const [editing, setEditing] = React.useState<TimesheetEntry | null>(null);
  const [logDate, setLogDate] = React.useState(() => dayKey(new Date()));
  const [isLogOpen, setIsLogOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<TimesheetEntry | null>(null);

  const { data: week, isFetching } = useGetMyTimesheetWeekQuery({ weekStart });
  const { data: summary } = useGetMyTimesheetSummaryQuery();

  const [submitWeek, { isLoading: isSubmitting }] = useSubmitTimesheetWeekMutation();
  const [withdrawWeek, { isLoading: isWithdrawing }] = useWithdrawTimesheetWeekMutation();
  const [deleteEntry, { isLoading: isDeleting }] = useDeleteTimesheetEntryMutation();

  const openLog = (date: string, entry: TimesheetEntry | null = null) => {
    setLogDate(date);
    setEditing(entry);
    setIsLogOpen(true);
  };

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    try {
      await action();
      toast.success(success);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || failure);
    }
  };

  const totals = week?.totals;
  const progress =
    totals && totals.scheduledHours > 0
      ? Math.min(100, Math.round((totals.loggedHours / totals.scheduledHours) * 100))
      : 0;

  return (
    <>
      <PageHeader
        title="My timesheet"
        description="The hours you booked, and against what."
        actions={
          <>
            {week?.status === "SUBMITTED" ? (
              <Button
                variant="outline"
                className="cursor-pointer"
                disabled={isWithdrawing}
                onClick={() =>
                  run(
                    () => withdrawWeek({ weekStart }).unwrap(),
                    "Week pulled back — you can edit it again",
                    "Could not pull that week back"
                  )
                }
              >
                {isWithdrawing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Undo2 className="size-4" />
                )}
                Pull back
              </Button>
            ) : (
              <Button
                variant="outline"
                className="cursor-pointer"
                disabled={!week?.isSubmittable || isSubmitting}
                onClick={() =>
                  run(
                    () => submitWeek({ weekStart }).unwrap(),
                    "Week sent for approval",
                    "Could not send that week in"
                  )
                }
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Send week in
              </Button>
            )}
            <Button
              className="cursor-pointer"
              onClick={() => openLog(dayKey(new Date()))}
            >
              <Plus className="size-4" />
              Log hours
            </Button>
          </>
        }
      />

      <StatGrid className="sm:grid-cols-2 lg:grid-cols-4">
        <Stat>
          <StatLabel>This week</StatLabel>
          <StatValue>{totals ? formatHours(totals.loggedHours) : "—"}</StatValue>
          <StatDescription>
            {totals ? `of ${formatHours(totals.scheduledHours)} scheduled` : "Nothing booked yet"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Billable</StatLabel>
          <StatValue>{totals ? formatHours(totals.billableHours) : "—"}</StatValue>
          <StatDescription>Charged on to a client</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Last 30 days</StatLabel>
          <StatValue>{summary ? formatHours(summary.loggedHours) : "—"}</StatValue>
          <StatDescription>
            {summary ? `${summary.utilisation}% of what was scheduled` : "Across the month"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Waiting on approval</StatLabel>
          <StatValue>{summary ? formatHours(summary.submittedHours) : "—"}</StatValue>
          <StatDescription>
            {summary && summary.rejectedHours > 0
              ? `${formatHours(summary.rejectedHours)} came back`
              : "Nothing has come back"}
          </StatDescription>
        </Stat>
      </StatGrid>

      <SectionCard
        icon={CalendarClock}
        title="Week view"
        description="Add hours to any day, then send the week in when it is done."
        action={
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8 cursor-pointer"
              aria-label="Previous week"
              onClick={() => setWeekStart(shiftWeek(weekStart, -1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8 cursor-pointer"
              aria-label="Next week"
              onClick={() => setWeekStart(shiftWeek(weekStart, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold">
              {week ? formatRange(week.weekStart, week.weekEnd) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {week?.timezone ? `Times shown for ${week.timezone}` : ""}
            </p>
          </div>
          {week && (
            <StatusBadge
              color={TIMESHEET_STATUS_COLORS[week.status]}
              label={week.statusLabel}
            />
          )}
        </div>

        {totals && totals.scheduledHours > 0 && (
          <div className="space-y-1.5">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">
              {formatHours(totals.loggedHours)} of {formatHours(totals.scheduledHours)} booked ·{" "}
              {totals.daysLogged} of 7 days
            </p>
          </div>
        )}

        {week?.reviewNote && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm">
            <p className="font-medium">Sent back</p>
            <p className="text-muted-foreground">{week.reviewNote}</p>
          </div>
        )}

        {isFetching && !week ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-1">
            {(week?.days ?? []).map((day) => (
              <DayPanel
                key={day.date}
                day={day}
                onAdd={() => openLog(day.date.slice(0, 10))}
                onEdit={(entry) => openLog(day.date.slice(0, 10), entry)}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <LogHoursModal
        open={isLogOpen}
        onOpenChange={setIsLogOpen}
        entry={editing}
        defaultDate={logDate}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={() => setPendingDelete(null)}
        title="Remove this entry?"
        description="The hours come straight off the week."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() => {
          if (!pendingDelete) return;
          void run(
            () => deleteEntry(pendingDelete._id).unwrap(),
            "Entry removed",
            "Could not remove that entry"
          ).then(() => setPendingDelete(null));
        }}
      />
    </>
  );
}

interface DayPanelProps {
  day: TimesheetDay;
  onAdd: () => void;
  onEdit: (entry: TimesheetEntry) => void;
  onDelete: (entry: TimesheetEntry) => void;
}

function DayPanel({ day, onAdd, onEdit, onDelete }: DayPanelProps) {
  const isRestDay = day.scheduledHours === 0;

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        day.isToday ? "border-primary/40 bg-primary/5" : "bg-card",
        day.isFuture && "opacity-60"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {WEEKDAY_SHORT_LABELS[day.weekday]} {dayLabel(day.date)}
          </span>
          {day.isToday && <Badge variant="secondary" className="text-[10px]">Today</Badge>}
          {isRestDay && (
            <Badge variant="outline" className="text-[10px]">
              Not scheduled
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums">
            {formatHours(day.loggedHours)}
          </span>
          {!isRestDay && (
            <span className="text-xs text-muted-foreground tabular-nums">
              / {formatHours(day.scheduledHours)}
            </span>
          )}
          {!day.isFuture && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 cursor-pointer"
              aria-label={`Log hours for ${dayLabel(day.date)}`}
              onClick={onAdd}
            >
              <Plus className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {day.entries.length > 0 && (
        <div className="mt-2 divide-y border-t">
          {day.entries.map((entry) => (
            <div key={entry._id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm">{describeEntry(entry)}</p>
                <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{entry.workTypeLabel}</span>
                  {entry.isBillable && (
                    <Badge variant="secondary" className="text-[10px]">
                      Billable
                    </Badge>
                  )}
                  {entry.status !== "DRAFT" && (
                    <StatusBadge
                      color={TIMESHEET_STATUS_COLORS[entry.status]}
                      label={entry.statusLabel}
                    />
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <span className="text-sm font-medium tabular-nums">
                  {formatHours(entry.hours)}
                </span>
                {entry.isEditable && (
                  <RowActions
                    label="Entry actions"
                    actions={[
                      {
                        key: "edit",
                        label: "Edit",
                        icon: Pencil,
                        onSelect: () => onEdit(entry),
                      },
                      {
                        key: "remove",
                        label: "Remove",
                        icon: Trash2,
                        variant: "destructive",
                        onSelect: () => onDelete(entry),
                      },
                    ]}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
