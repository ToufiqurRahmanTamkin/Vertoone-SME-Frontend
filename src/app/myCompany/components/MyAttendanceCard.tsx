import { AttendanceCalendar } from "@/components/shared/attendance-calendar";
import { ClockCard } from "@/components/shared/clock-card";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import {
  useGetMyAttendanceCalendarQuery,
  useGetMyTodayQuery,
} from "@/redux/apis/attendanceApis";
import { CalendarCheck } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";

const now = new Date();

export function MyAttendanceCard() {
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth() + 1);

  const { data: today, isLoading: isTodayLoading, isError } = useGetMyTodayQuery();
  const { data: calendar, isFetching } = useGetMyAttendanceCalendarQuery(
    { year, month },
    { skip: isError }
  );

  if (isError) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SectionCard
        icon={CalendarCheck}
        title="Your day"
        description="Clock in when you start, clock out when you finish."
      >
        <ClockCard today={today} isLoading={isTodayLoading} compact />
        <Button asChild variant="outline" size="sm" className="cursor-pointer">
          <Link to="/hrms/my-work/attendance">Open my attendance</Link>
        </Button>
      </SectionCard>

      <SectionCard
        icon={CalendarCheck}
        title="Attendance calendar"
        description="How the month has gone so far."
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
          }}
        />
      </SectionCard>
    </div>
  );
}
