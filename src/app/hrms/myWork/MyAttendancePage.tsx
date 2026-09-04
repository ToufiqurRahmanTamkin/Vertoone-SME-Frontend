import { AttendanceCalendar } from "@/components/shared/attendance-calendar";
import { ClockCard } from "@/components/shared/clock-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import {
  useGetMyAttendanceCalendarQuery,
  useGetMyTodayQuery,
} from "@/redux/apis/attendanceApis";
import {
  ATTENDANCE_STATUS_COLORS,
  formatClock,
  formatMinutes,
  type CalendarDay,
} from "@/types/domain/attendance";
import { CalendarCheck, Clock } from "lucide-react";
import * as React from "react";

const today = new Date();

export default function MyAttendancePage() {
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth() + 1);
  const [selected, setSelected] = React.useState<CalendarDay | null>(null);

  const { data: todayStatus, isLoading: isTodayLoading } = useGetMyTodayQuery();
  const { data: calendar, isFetching } = useGetMyAttendanceCalendarQuery({ year, month });

  const totals = calendar?.totals;

  return (
    <>
      <PageHeader
        title="My attendance"
        description="Clock in, clock out, and look back at how the month has gone."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Days present</StatLabel>
          <StatValue>
            {(totals?.present ?? 0) + (totals?.late ?? 0) + (totals?.halfDay ?? 0)}
          </StatValue>
          <StatDescription>{totals?.late ?? 0} of them late</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Days absent</StatLabel>
          <StatValue>{totals?.absent ?? 0}</StatValue>
          <StatDescription>Nothing recorded on those days</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Hours worked</StatLabel>
          <StatValue>{totals?.workedHours ?? 0}</StatValue>
          <StatDescription>{totals?.overtimeHours ?? 0} counted as overtime</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Late by</StatLabel>
          <StatValue className="text-xl">{formatMinutes(totals?.lateMinutes ?? 0)}</StatValue>
          <StatDescription>Across the whole month</StatDescription>
        </Stat>
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          icon={Clock}
          title="Today"
          description="Your shift for today and the punches on it."
        >
          <ClockCard today={todayStatus} isLoading={isTodayLoading} />
        </SectionCard>

        <SectionCard
          icon={CalendarCheck}
          title="Attendance calendar"
          description="Every day of the month, colour coded."
          className="lg:col-span-2"
        >
          <AttendanceCalendar
            calendar={calendar}
            isLoading={isFetching && !calendar}
            year={year}
            month={month}
            onMonthChange={(nextYear, nextMonth) => {
              setYear(nextYear);
              setMonth(nextMonth);
              setSelected(null);
            }}
            onSelectDay={setSelected}
          />

          {selected && (
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {new Date(selected.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
                <StatusBadge
                  color={ATTENDANCE_STATUS_COLORS[selected.status] ?? "muted"}
                  label={selected.statusLabel}
                />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {[
                  { label: "Shift", value: selected.shiftName || "—" },
                  { label: "Clocked in", value: formatClock(selected.firstClockInAt) },
                  { label: "Clocked out", value: formatClock(selected.lastClockOutAt) },
                  { label: "Worked", value: formatMinutes(selected.workedMinutes) },
                ].map(({ label, value }) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="truncate font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
