import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CalendarScheduleEntry } from "@/types/domain/calendarSchedule";
import type { DatesSetArg, EventContentArg, EventInput } from "@fullcalendar/core";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import * as React from "react";
import "../schedule-calendar.css";

export type ScheduleView = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

export interface ScheduleRange {
  start: Date;
  end: Date;
}

interface ScheduleCalendarProps {
  entries: CalendarScheduleEntry[];
  isLoading: boolean;
  initialView: ScheduleView;
  onRangeChange: (range: ScheduleRange, view: ScheduleView) => void;
  onSelectEntry: (entry: CalendarScheduleEntry) => void;
  onPickDate: (date: Date) => void;
}

const TYPE_INITIAL: Record<CalendarScheduleEntry["type"], string> = {
  EVENT: "E",
  MEETING: "M",
  BOOKING: "B",
};

const isDim = (entry: CalendarScheduleEntry): boolean =>
  entry.status === "CANCELLED" || entry.registrationStatus === "CANCELLED";

const toEventInput = (entry: CalendarScheduleEntry): EventInput => ({
  id: entry._id,
  title: entry.title,
  start: entry.startAt,
  end: entry.endAt,
  backgroundColor: entry.accentColor,
  borderColor: entry.accentColor,
  classNames: isDim(entry) ? ["opacity-60", "line-through"] : undefined,
  extendedProps: { entry },
});

const renderEvent = (arg: EventContentArg) => {
  const entry = arg.event.extendedProps.entry as CalendarScheduleEntry;
  const isBlock = arg.view.type !== "listWeek";

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 overflow-hidden",
        isBlock && "px-1 py-0.5"
      )}
    >
      <span
        className="flex size-3.5 shrink-0 items-center justify-center rounded-[3px] text-[9px] font-bold"
        style={
          isBlock
            ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }
            : { backgroundColor: entry.accentColor, color: "#fff" }
        }
        aria-hidden
      >
        {TYPE_INITIAL[entry.type]}
      </span>
      {arg.timeText && (
        <span className="shrink-0 text-[10px] font-medium tabular-nums opacity-90">
          {arg.timeText}
        </span>
      )}
      <span className="truncate font-medium">{arg.event.title}</span>
    </div>
  );
};

export function ScheduleCalendar({
  entries,
  isLoading,
  initialView,
  onRangeChange,
  onSelectEntry,
  onPickDate,
}: ScheduleCalendarProps) {
  const events = React.useMemo(() => entries.map(toEventInput), [entries]);

  const handleDatesSet = React.useCallback(
    (arg: DatesSetArg) => {
      onRangeChange({ start: arg.start, end: arg.end }, arg.view.type as ScheduleView);
    },
    [onRangeChange]
  );

  const handleDateClick = React.useCallback(
    (arg: DateClickArg) => onPickDate(arg.date),
    [onPickDate]
  );

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-x-0 top-0 z-10 flex justify-end pr-1 pt-1">
          <Skeleton className="h-1.5 w-24 rounded-full" />
        </div>
      )}
      <div className="schedule-calendar">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={initialView}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
            list: "List",
          }}
          height="auto"
          events={events}
          eventContent={renderEvent}
          eventClick={(arg) => onSelectEntry(arg.event.extendedProps.entry as CalendarScheduleEntry)}
          dateClick={handleDateClick}
          datesSet={handleDatesSet}
          dayMaxEventRows={4}
          nowIndicator
          firstDay={1}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          scrollTime="08:00:00"
          expandRows
          stickyHeaderDates
          noEventsText="Nothing scheduled in this range."
          eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
        />
      </div>
    </div>
  );
}
