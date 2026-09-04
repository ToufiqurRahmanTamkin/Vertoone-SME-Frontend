import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useGetAttendanceSummaryQuery, useGetAttendanceTodayQuery } from "@/redux/apis/attendanceApis";
import { useGetAttendanceCorrectionSummaryQuery } from "@/redux/apis/attendanceCorrectionApis";
import { useGetShiftAssignmentSummaryQuery } from "@/redux/apis/employeeShiftApis";
import { useGetRosterSummaryQuery } from "@/redux/apis/shiftRosterApis";
import {
  ATTENDANCE_STATUS_COLORS,
  formatClock,
  formatMinutes,
} from "@/types/domain/attendance";
import { CalendarCheck, ClipboardList, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const isoDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export default function AttendanceOverviewPage() {
  const from = isoDaysAgo(29);
  const to = new Date().toISOString();

  const { data: summary } = useGetAttendanceSummaryQuery({ from, to });
  const { data: todayRows = [], isLoading: isTodayLoading } = useGetAttendanceTodayQuery();
  const { data: assignments } = useGetShiftAssignmentSummaryQuery();
  const { data: roster } = useGetRosterSummaryQuery();
  const { data: corrections } = useGetAttendanceCorrectionSummaryQuery();

  const inNow = todayRows.filter((row) => row.isClockedIn);
  const lateToday = todayRows.filter((row) => row.lateMinutes > 0);

  return (
    <>
      <PageHeader
        title="Attendance overview"
        description="Presence, lateness and shift coverage for the last 30 days."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>In right now</StatLabel>
          <StatValue>{inNow.length}</StatValue>
          <StatDescription>Out of {summary?.headcount ?? 0} active people</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Attendance rate</StatLabel>
          <StatValue>{summary?.attendanceRate ?? 0}%</StatValue>
          <StatDescription>{summary?.absentCount ?? 0} absences recorded</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Late arrivals</StatLabel>
          <StatValue>{summary?.lateCount ?? 0}</StatValue>
          <StatDescription>{formatMinutes(summary?.totalLateMinutes ?? 0)} in total</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Overtime</StatLabel>
          <StatValue>{summary?.totalOvertimeHours ?? 0}h</StatValue>
          <StatDescription>{summary?.totalWorkedHours ?? 0}h worked overall</StatDescription>
        </Stat>
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          icon={CalendarCheck}
          title="Who is in today"
          description="The first ten people, ordered by name."
          className="lg:col-span-2"
          action={
            <Button asChild variant="outline" size="sm" className="cursor-pointer">
              <Link to="/hrms/attendance/daily-attendance">See all</Link>
            </Button>
          }
        >
          {isTodayLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : todayRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No active employees yet.
            </p>
          ) : (
            <div className="divide-y">
              {todayRows.slice(0, 10).map((row) => (
                <div
                  key={row.employeeId}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{row.employee?.name ?? "—"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.shiftName || "No shift"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {formatClock(row.firstClockInAt)}
                    </span>
                    {row.isClockedIn && (
                      <Badge variant="outline" className="text-[10px]">
                        In now
                      </Badge>
                    )}
                    <StatusBadge
                      color={ATTENDANCE_STATUS_COLORS[row.status] ?? "muted"}
                      label={row.statusLabel}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <div className="flex flex-col gap-4">
          <SectionCard
            icon={Clock}
            title="Shift coverage"
            description="How many people have a shift arrangement of their own."
            action={
              <Button asChild variant="outline" size="sm" className="cursor-pointer">
                <Link to="/hrms/attendance/shift-assignments">Manage</Link>
              </Button>
            }
          >
            <dl className="divide-y text-sm">
              {[
                { label: "Assigned a shift", value: assignments?.assigned ?? 0 },
                { label: "On the default shift", value: assignments?.unassigned ?? 0 },
                { label: "Roster driven", value: assignments?.rosterCount ?? 0 },
                { label: "Roster days published", value: roster?.published ?? 0 },
                { label: "Roster days still draft", value: roster?.draft ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>

          <SectionCard
            icon={ClipboardList}
            title="Corrections"
            description="Requests to fix a missed or wrong punch."
            action={
              <Button asChild variant="outline" size="sm" className="cursor-pointer">
                <Link to="/hrms/approvals/attendance">Review</Link>
              </Button>
            }
          >
            <dl className="divide-y text-sm">
              {[
                { label: "Waiting on a decision", value: corrections?.pending ?? 0 },
                { label: "Approved", value: corrections?.approved ?? 0 },
                { label: "Rejected", value: corrections?.rejected ?? 0 },
                { label: "Late today", value: lateToday.length },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
