import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { formatDate } from "@/lib/date";
import { useGetMyShiftPlanQuery } from "@/redux/apis/employeeShiftApis";
import {
  SHIFT_ASSIGNMENT_TYPE_HINTS,
  SHIFT_ASSIGNMENT_TYPE_LABELS,
  type DaySchedule,
} from "@/types/domain/employeeShift";
import { CalendarDays, Clock } from "lucide-react";

const dayLabel = (value: string): string =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

const kindBadge = (day: DaySchedule) => {
  if (day.kind === "HOLIDAY") {
    return <StatusBadge color="violet" label={day.holidayName || "Holiday"} />;
  }
  if (day.kind === "WEEK_OFF") return <StatusBadge color="zinc" label="Day off" />;
  return <StatusBadge color="green" label="Working" />;
};

export default function MyShiftPage() {
  const { data, isLoading } = useGetMyShiftPlanQuery();

  const assignment = data?.assignment ?? null;
  const upcoming = data?.upcoming ?? [];
  const workingDays = upcoming.filter((day) => day.kind === "SHIFT").length;

  return (
    <>
      <PageHeader
        title="My shift & roster"
        description="The shift you are on and what the next two weeks look like."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Today</StatLabel>
          <StatValue className="truncate text-xl">
            {data?.today?.kind === "SHIFT"
              ? data.today.shiftName
              : data?.today?.kind === "HOLIDAY"
                ? "Holiday"
                : "Day off"}
          </StatValue>
          <StatDescription>
            {data?.today?.kind === "SHIFT"
              ? `${data.today.startTime} – ${data.today.endTime}`
              : data?.today?.holidayName || "Nothing scheduled"}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Arrangement</StatLabel>
          <StatValue className="truncate text-xl">
            {assignment
              ? SHIFT_ASSIGNMENT_TYPE_LABELS[assignment.assignmentType]
              : "Company default"}
          </StatValue>
          <StatDescription>
            {assignment
              ? SHIFT_ASSIGNMENT_TYPE_HINTS[assignment.assignmentType]
              : "No personal assignment, so the default shift applies."}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Working days ahead</StatLabel>
          <StatValue>{workingDays}</StatValue>
          <StatDescription>Out of the next {upcoming.length} days</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>In force since</StatLabel>
          <StatValue className="text-xl">
            {assignment ? formatDate(assignment.effectiveFrom) : "—"}
          </StatValue>
          <StatDescription>
            {assignment?.effectiveTo ? `Until ${formatDate(assignment.effectiveTo)}` : "Open ended"}
          </StatDescription>
        </Stat>
      </StatGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          icon={Clock}
          title="Your arrangement"
          description="How your working week is put together."
        >
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          ) : assignment?.assignmentType === "WEEKLY" ? (
            <div className="divide-y text-sm">
              {assignment.weeklyShifts.map((slot) => (
                <div key={slot.day} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="font-medium">{slot.dayLabel}</span>
                  {slot.isWeekOff || !slot.shift ? (
                    <StatusBadge color="zinc" label="Day off" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: slot.shift.color }}
                      />
                      <span className="font-medium">{slot.shift.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {slot.shift.startTime}–{slot.shift.endTime}
                      </span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : assignment?.assignmentType === "ROSTER" ? (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Your days come from the published roster. These are the shifts you rotate through.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {assignment.rotationShifts.map((shift) => (
                  <Badge key={shift._id} variant="secondary">
                    {shift.name} · {shift.startTime}–{shift.endTime}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Rotating every {assignment.rotationDaysPerShift} day
                {assignment.rotationDaysPerShift === 1 ? "" : "s"}.
              </p>
            </div>
          ) : assignment?.shift ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: assignment.shift.color }}
                />
                <span className="font-semibold">{assignment.shift.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {assignment.shift.startTime}–{assignment.shift.endTime}
                </span>
              </div>
              {assignment.note && <p className="text-muted-foreground">{assignment.note}</p>}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              You have no personal shift assignment, so your company&apos;s default shift applies.
            </p>
          )}
        </SectionCard>

        <SectionCard
          icon={CalendarDays}
          title="The next two weeks"
          description="What is scheduled for you, day by day."
        >
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="divide-y text-sm">
              {[data?.today, ...upcoming]
                .filter((day): day is DaySchedule => Boolean(day))
                .map((day) => (
                  <div key={day.date} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="font-medium">{dayLabel(day.date)}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {day.kind === "SHIFT"
                          ? `${day.shiftName} · ${day.startTime}–${day.endTime}`
                          : day.holidayName || "Nothing scheduled"}
                      </p>
                    </div>
                    {kindBadge(day)}
                  </div>
                ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
