import { BookingFormModal } from "@/app/calendar/bookings/components/BookingFormModal";
import { EventFormModal } from "@/app/calendar/events/components/EventFormModal";
import { MeetingFormModal } from "@/app/calendar/meetings/components/MeetingFormModal";
import { ActionButton } from "@/components/shared/action-button";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import {
  CALENDAR_LOCATION_MODE_LABELS,
  CALENDAR_STATUS_LABELS,
  REGISTRATION_STATUS_LABELS,
  toOptions,
} from "@/constant";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useGetCalendarBookingQuery } from "@/redux/apis/calendarBookingApis";
import { useGetCalendarEventQuery } from "@/redux/apis/calendarEventApis";
import { useGetCalendarMeetingQuery } from "@/redux/apis/calendarMeetingApis";
import { useGetCalendarScheduleQuery } from "@/redux/apis/calendarOverviewApis";
import type {
  CalendarLocationMode,
  CalendarResourceType,
  CalendarStatus,
  RegistrationStatus,
} from "@/types/domain/calendar";
import type { CalendarScheduleEntry } from "@/types/domain/calendarSchedule";
import { CalendarDays, Plus } from "lucide-react";
import * as React from "react";
import { CreateEntryDialog } from "./components/CreateEntryDialog";
import {
  ScheduleCalendar,
  type ScheduleRange,
  type ScheduleView,
} from "./components/ScheduleCalendar";
import { ScheduleEntryDialog } from "./components/ScheduleEntryDialog";

const EVENTS_PATH = "/company/calendar/events";
const MEETINGS_PATH = "/company/calendar/meetings";
const BOOKINGS_PATH = "/company/calendar/bookings";

const FILTERS: FilterConfig[] = [
  {
    name: "type",
    label: "Type",
    type: "select",
    options: [
      { label: "Events", value: "EVENT" },
      { label: "Meetings", value: "MEETING" },
      { label: "Bookings", value: "BOOKING" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: toOptions(CALENDAR_STATUS_LABELS),
  },
  {
    name: "registrationStatus",
    label: "Booking status",
    type: "select",
    options: toOptions(REGISTRATION_STATUS_LABELS),
  },
  {
    name: "locationMode",
    label: "Location",
    type: "select",
    options: toOptions(CALENDAR_LOCATION_MODE_LABELS),
  },
  {
    name: "isPaid",
    label: "Price",
    type: "select",
    options: [
      { label: "Paid", value: "true" },
      { label: "Free", value: "false" },
    ],
  },
];

const LEGEND = [
  { initial: "E", label: "Events" },
  { initial: "M", label: "Meetings" },
  { initial: "B", label: "Bookings" },
];

const monthGrid = (): ScheduleRange => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setDate(start.getDate() - 7);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  end.setDate(end.getDate() + 7);
  return { start, end };
};

export default function SchedulePage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();

  const eventAccess = useModulePermission(EVENTS_PATH);
  const meetingAccess = useModulePermission(MEETINGS_PATH);
  const bookingAccess = useModulePermission(BOOKINGS_PATH);

  const [range, setRange] = React.useState<ScheduleRange>(monthGrid);
  const [view, setView] = React.useState<ScheduleView>("dayGridMonth");

  const { data, isLoading, isFetching } = useGetCalendarScheduleQuery({
    dateFrom: range.start.toISOString(),
    dateTo: range.end.toISOString(),
    type: filters.type as CalendarResourceType | undefined,
    status: filters.status as CalendarStatus | undefined,
    registrationStatus: filters.registrationStatus as RegistrationStatus | undefined,
    locationMode: filters.locationMode as CalendarLocationMode | undefined,
    isPaid: filters.isPaid === undefined ? undefined : filters.isPaid === "true",
    search: filters.search,
  });

  const [pickedDate, setPickedDate] = React.useState<Date | null>(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [creatingType, setCreatingType] = React.useState<CalendarResourceType | null>(null);
  const [editing, setEditing] = React.useState<CalendarScheduleEntry | null>(null);
  const [selected, setSelected] = React.useState<CalendarScheduleEntry | null>(null);

  const editingEventId = editing?.type === "EVENT" ? editing.resourceId : null;
  const editingMeetingId = editing?.type === "MEETING" ? editing.resourceId : null;
  const editingBookingId = editing?.type === "BOOKING" ? editing.resourceId : null;

  const { data: editingEvent } = useGetCalendarEventQuery(editingEventId ?? "", {
    skip: !editingEventId,
  });
  const { data: editingMeeting } = useGetCalendarMeetingQuery(editingMeetingId ?? "", {
    skip: !editingMeetingId,
  });
  const { data: editingBooking } = useGetCalendarBookingQuery(editingBookingId ?? "", {
    skip: !editingBookingId,
  });

  const allowed: Record<CalendarResourceType, boolean> = {
    EVENT: eventAccess.canCreate,
    MEETING: meetingAccess.canCreate,
    BOOKING: bookingAccess.canCreate,
  };

  const canCreateAnything = allowed.EVENT || allowed.MEETING || allowed.BOOKING;

  const canEditEntry = (entry: CalendarScheduleEntry): boolean =>
    entry.type === "EVENT"
      ? eventAccess.canEdit
      : entry.type === "MEETING"
        ? meetingAccess.canEdit
        : bookingAccess.canEdit;

  const handleRangeChange = React.useCallback(
    (next: ScheduleRange, nextView: ScheduleView) => {
      setRange((current) =>
        current.start.getTime() === next.start.getTime() &&
        current.end.getTime() === next.end.getTime()
          ? current
          : next
      );
      setView(nextView);
    },
    []
  );

  const openPicker = (date: Date) => {
    if (!canCreateAnything) return;
    setPickedDate(date);
    setPickerOpen(true);
  };

  const chooseType = (type: CalendarResourceType) => {
    setPickerOpen(false);
    setEditing(null);
    setCreatingType(type);
  };

  const closeForm = (open: boolean) => {
    if (open) return;
    setCreatingType(null);
    setEditing(null);
  };

  const startEdit = (entry: CalendarScheduleEntry) => {
    setSelected(null);
    setCreatingType(null);
    setEditing(entry);
  };

  const entries = data?.entries ?? [];
  const counts = data?.counts;
  const defaultStartAt = pickedDate ? pickedDate.toISOString() : null;
  const defaultWeekday = pickedDate ? pickedDate.getDay() : null;

  const eventFormOpen = creatingType === "EVENT" || editingEventId !== null;
  const meetingFormOpen = creatingType === "MEETING" || editingMeetingId !== null;
  const bookingFormOpen = creatingType === "BOOKING" || editingBookingId !== null;

  return (
    <>
      <PageHeader
        title="Schedule"
        description="Every event, meeting and booked slot on one calendar. Click any date to add something to it."
        actions={<CurrencyNote currency={data?.currency ?? "BDT"} />}
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>In view</StatLabel>
          <StatValue>{counts?.total ?? 0}</StatValue>
          <StatDescription>Everything inside the range shown below</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Events</StatLabel>
          <StatValue>{counts?.events ?? 0}</StatValue>
          <StatDescription>Events starting or running in this range</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Meetings</StatLabel>
          <StatValue>{counts?.meetings ?? 0}</StatValue>
          <StatDescription>Meetings on the books for this range</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Bookings</StatLabel>
          <StatValue>{counts?.bookings ?? 0}</StatValue>
          <StatDescription>Slots people have booked with you</StatDescription>
        </Stat>
      </StatGrid>

      <SectionCard
        icon={CalendarDays}
        title="Calendar"
        description="Switch between month, week, day and list. Click a day to add an event, meeting or booking to it."
      >
        <DataTableToolbar
          searchValue={filters.search}
          onSearchChange={(value) => setFilter("search", value)}
          searchPlaceholder="Search by title, host, venue or reference..."
          filters={FILTERS}
          currentFilters={filters}
          onFilterChange={setFilter}
          onClear={clearFilters}
          isLoading={isFetching}
          actions={
            canCreateAnything && (
              <ActionButton
                icon={Plus}
                label="Add to calendar"
                onClick={() => openPicker(new Date())}
              />
            )
          }
        />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {LEGEND.map((item) => (
            <span key={item.initial} className="inline-flex items-center gap-1.5">
              <span
                className="flex size-4 items-center justify-center rounded-[3px] bg-muted-foreground/15 text-[9px] font-bold text-foreground"
                aria-hidden
              >
                {item.initial}
              </span>
              {item.label}
            </span>
          ))}
          <span>Every block carries the accent colour set on the record itself.</span>
        </div>

        {data?.truncated && (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            This range has more than the calendar can show at once. Narrow it with a filter or a
            shorter view.
          </p>
        )}

        <ScheduleCalendar
          entries={entries}
          isLoading={isLoading || isFetching}
          initialView={view}
          onRangeChange={handleRangeChange}
          onSelectEntry={setSelected}
          onPickDate={openPicker}
        />
      </SectionCard>

      <CreateEntryDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        date={pickedDate}
        allowed={allowed}
        onChoose={chooseType}
      />

      <ScheduleEntryDialog
        entry={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        canEdit={selected ? canEditEntry(selected) : false}
        onEdit={startEdit}
      />

      <EventFormModal
        open={eventFormOpen}
        onOpenChange={closeForm}
        event={editingEventId ? (editingEvent ?? null) : null}
        defaultStartAt={editingEventId ? null : defaultStartAt}
      />

      <MeetingFormModal
        open={meetingFormOpen}
        onOpenChange={closeForm}
        meeting={editingMeetingId ? (editingMeeting ?? null) : null}
        defaultStartAt={editingMeetingId ? null : defaultStartAt}
      />

      <BookingFormModal
        open={bookingFormOpen}
        onOpenChange={closeForm}
        booking={editingBookingId ? (editingBooking ?? null) : null}
        defaultWeekday={editingBookingId ? null : defaultWeekday}
      />
    </>
  );
}
