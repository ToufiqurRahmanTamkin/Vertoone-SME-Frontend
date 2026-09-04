import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ATTENDANCE_STATUS_LABELS,
  formatClock,
  formatMinutes,
  type AttendanceCalendar as AttendanceCalendarData,
  type CalendarDay,
  type CalendarDayStatus,
} from "@/types/domain/attendance";
import { WEEKDAY_SHORT_LABELS } from "@/types/domain/employeeShift";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CELL_STYLES: Record<CalendarDayStatus, string> = {
  PRESENT: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  LATE: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  HALF_DAY: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
  ABSENT: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30",
  WEEK_OFF: "bg-muted/60 text-muted-foreground border-transparent",
  HOLIDAY: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30",
  ON_LEAVE: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  SCHEDULED: "bg-background text-muted-foreground border-dashed",
};

const LEGEND: CalendarDayStatus[] = [
  "PRESENT",
  "LATE",
  "HALF_DAY",
  "ABSENT",
  "WEEK_OFF",
  "HOLIDAY",
  "ON_LEAVE",
];

const MONTH_LABEL = (year: number, month: number): string =>
  new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

const dayNumber = (day: CalendarDay): number => new Date(day.date).getUTCDate();

const dayTitle = (day: CalendarDay): string =>
  new Date(day.date).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });

function DayCell({ day, onSelect }: { day: CalendarDay; onSelect?: (day: CalendarDay) => void }) {
  const cell = (
    <button
      type="button"
      onClick={onSelect ? () => onSelect(day) : undefined}
      className={cn(
        "flex aspect-square min-h-14 w-full flex-col items-start justify-between rounded-lg border p-1.5 text-left transition-colors sm:p-2",
        CELL_STYLES[day.status],
        day.isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
        onSelect ? "cursor-pointer hover:brightness-105" : "cursor-default"
      )}
    >
      <span className="text-xs font-semibold tabular-nums">{dayNumber(day)}</span>
      {day.hasRecord && day.workedMinutes > 0 ? (
        <span className="text-[10px] font-medium tabular-nums opacity-90">
          {formatMinutes(day.workedMinutes)}
        </span>
      ) : (
        <span className="truncate text-[10px] opacity-80">
          {day.status === "HOLIDAY" ? day.holidayName || "Holiday" : ""}
        </span>
      )}
    </button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{cell}</TooltipTrigger>
      <TooltipContent className="max-w-56">
        <p className="font-medium">{dayTitle(day)}</p>
        <p>{ATTENDANCE_STATUS_LABELS[day.status]}</p>
        {day.shiftName && (
          <p className="text-xs opacity-80">
            {day.shiftName}
            {day.startTime && ` · ${day.startTime}–${day.endTime}`}
          </p>
        )}
        {day.hasRecord && (
          <p className="text-xs opacity-80">
            In {formatClock(day.firstClockInAt)} · Out {formatClock(day.lastClockOutAt)}
          </p>
        )}
        {day.lateMinutes > 0 && (
          <p className="text-xs opacity-80">Late by {formatMinutes(day.lateMinutes)}</p>
        )}
        {day.overtimeMinutes > 0 && (
          <p className="text-xs opacity-80">Overtime {formatMinutes(day.overtimeMinutes)}</p>
        )}
        {day.holidayName && <p className="text-xs opacity-80">{day.holidayName}</p>}
      </TooltipContent>
    </Tooltip>
  );
}

interface AttendanceCalendarProps {
  calendar?: AttendanceCalendarData;
  isLoading?: boolean;
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  onSelectDay?: (day: CalendarDay) => void;
  showTotals?: boolean;
}

export function AttendanceCalendar({
  calendar,
  isLoading,
  year,
  month,
  onMonthChange,
  onSelectDay,
  showTotals = true,
}: AttendanceCalendarProps) {
  const days = calendar?.days ?? [];
  const leadingBlanks = days.length > 0 ? days[0].weekday : 0;

  const step = (delta: number) => {
    const next = new Date(Date.UTC(year, month - 1 + delta, 1));
    onMonthChange(next.getUTCFullYear(), next.getUTCMonth() + 1);
  };

  const totals = calendar?.totals;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            aria-label="Previous month"
            onClick={() => step(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-40 text-center text-sm font-semibold">
            {MONTH_LABEL(year, month)}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            aria-label="Next month"
            onClick={() => step(1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        {calendar?.timezone && (
          <span className="text-xs text-muted-foreground">Times shown for {calendar.timezone}</span>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {WEEKDAY_SHORT_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square min-h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }).map((_, index) => (
            <div key={`blank-${index}`} />
          ))}
          {days.map((day) => (
            <DayCell key={day.date} day={day} onSelect={onSelectDay} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-muted-foreground">
        {LEGEND.map((status) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm border", CELL_STYLES[status])} />
            {ATTENDANCE_STATUS_LABELS[status]}
          </span>
        ))}
      </div>

      {showTotals && totals && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-4">
          {[
            { label: "Present", value: totals.present + totals.late + totals.halfDay },
            { label: "Absent", value: totals.absent },
            { label: "Hours worked", value: totals.workedHours },
            { label: "Late by", value: formatMinutes(totals.lateMinutes) },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <dt className="truncate text-xs text-muted-foreground">{label}</dt>
              <dd className="font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
