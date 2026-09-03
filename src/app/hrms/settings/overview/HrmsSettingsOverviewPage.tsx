import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useGetHrmsSettingsSummaryQuery } from "@/redux/apis/hrmsSettingsApis";
import {
  ATTENDANCE_CAPTURE_METHOD_LABELS,
  PAYROLL_DAY_BASIS_LABELS,
  PAY_CYCLE_LABELS,
  type HrmsSettingsSummary,
} from "@/types/domain/hrmsSettings";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Clock,
  Coins,
  KeyRound,
  Percent,
  Plane,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface SectionFact {
  label: string;
  value: string;
}

interface SectionSpec {
  path: string;
  icon: LucideIcon;
  title: string;
  description: string;
  status: { label: string; color: "green" | "amber" | "zinc" };
  facts: SectionFact[];
}

const dayText = (value: number): string => `${value} day${value === 1 ? "" : "s"}`;

const formatDate = (value: string | null): string =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "None scheduled";

const buildSections = (summary: HrmsSettingsSummary): SectionSpec[] => [
  {
    path: "/hrms/settings/leave",
    icon: Plane,
    title: "Leave",
    description: "The leave types your people can request and the rules each one runs on.",
    status: {
      label: summary.leave.activeTypes > 0 ? `${summary.leave.activeTypes} active` : "Not set up",
      color: summary.leave.activeTypes > 0 ? "green" : "amber",
    },
    facts: [
      { label: "Leave types", value: String(summary.leave.types) },
      { label: "Paid types", value: String(summary.leave.paidTypes) },
      { label: "Paid days a year", value: dayText(summary.leave.totalPaidDays) },
      {
        label: "Carry forward",
        value: summary.leave.carryForwardEnabled ? "Allowed" : "Off",
      },
    ],
  },
  {
    path: "/hrms/settings/shifts",
    icon: Clock,
    title: "Shifts",
    description: "Working-hour patterns, the day your week starts on and your weekly off days.",
    status: {
      label: summary.shifts.active > 0 ? `${summary.shifts.active} active` : "Not set up",
      color: summary.shifts.active > 0 ? "green" : "amber",
    },
    facts: [
      { label: "Shifts", value: String(summary.shifts.total) },
      { label: "Default shift", value: summary.shifts.defaultShiftName || "None" },
      { label: "Week starts on", value: summary.shifts.weekStartLabel },
      { label: "Weekly off", value: summary.shifts.weekendLabel },
    ],
  },
  {
    path: "/hrms/settings/attendance-rules",
    icon: CalendarClock,
    title: "Attendance rules",
    description: "When somebody counts as present, late, half day or absent.",
    status: { label: "Configured", color: "green" },
    facts: [
      { label: "Grace period", value: `${summary.attendance.graceMinutes} min` },
      { label: "Full day after", value: `${summary.attendance.minHoursFullDay} hours` },
      {
        label: "Corrections",
        value: summary.attendance.regularizationEnabled ? "Allowed" : "Off",
      },
      {
        label: "Clock in from",
        value:
          summary.attendance.captureMethods
            .map((method) => ATTENDANCE_CAPTURE_METHOD_LABELS[method])
            .join(", ") || "Nowhere",
      },
    ],
  },
  {
    path: "/hrms/settings/late-fine-rules",
    icon: Percent,
    title: "Late fine rules",
    description: "What repeated lateness costs an employee at the end of the cycle.",
    status: {
      label: summary.lateFine.enabled ? "On" : "Off",
      color: summary.lateFine.enabled ? "green" : "zinc",
    },
    facts: [
      { label: "Late after", value: `${summary.lateFine.lateAfterMinutes} min` },
      { label: "Steps", value: String(summary.lateFine.rules) },
      { label: "First step", value: summary.lateFine.firstRuleLabel || "None set" },
    ],
  },
  {
    path: "/hrms/settings/overtime",
    icon: CalendarClock,
    title: "Overtime",
    description: "The daily, weekly and monthly thresholds and what each extra hour is worth.",
    status: {
      label: summary.overtime.enabled ? "On" : "Off",
      color: summary.overtime.enabled ? "green" : "zinc",
    },
    facts: [
      {
        label: "Daily",
        value: `Over ${summary.overtime.dailyThresholdHours}h at ${summary.overtime.dailyMultiplier}x`,
      },
      {
        label: "Weekly",
        value: `Over ${summary.overtime.weeklyThresholdHours}h at ${summary.overtime.weeklyMultiplier}x`,
      },
    ],
  },
  {
    path: "/hrms/settings/holiday-calendar",
    icon: CalendarDays,
    title: "Holiday calendar",
    description: "Public, national and company holidays your people do not work.",
    status: {
      label: summary.holidays.total > 0 ? `${summary.holidays.total} recorded` : "Empty",
      color: summary.holidays.total > 0 ? "green" : "amber",
    },
    facts: [
      { label: "Days off this year", value: dayText(summary.holidays.thisYear) },
      { label: "Still to come", value: String(summary.holidays.upcoming) },
      { label: "Next holiday", value: summary.holidays.nextHolidayName || "None scheduled" },
      { label: "Falls on", value: formatDate(summary.holidays.nextHolidayDate) },
    ],
  },
  {
    path: "/hrms/settings/payroll",
    icon: Coins,
    title: "Payroll",
    description: "The pay cycle, how a day of pay is worked out and the statutory deductions.",
    status: { label: PAY_CYCLE_LABELS[summary.payroll.payCycle], color: "green" },
    facts: [
      { label: "Pay day", value: `Day ${summary.payroll.payDay}` },
      { label: "Day basis", value: PAYROLL_DAY_BASIS_LABELS[summary.payroll.dayBasis] },
      { label: "Tax", value: summary.payroll.taxEnabled ? "Deducted" : "Off" },
      {
        label: "Provident fund",
        value: summary.payroll.providentFundEnabled ? "Deducted" : "Off",
      },
    ],
  },
  {
    path: "/hrms/settings/employee-roles-and-permissions",
    icon: KeyRound,
    title: "Employee roles & permissions",
    description: "Permission sets built for your workforce, and the employees holding each one.",
    status: {
      label:
        summary.employeeRoles.active > 0
          ? `${summary.employeeRoles.active} active`
          : "Not set up",
      color: summary.employeeRoles.active > 0 ? "green" : "amber",
    },
    facts: [
      { label: "Employee roles", value: String(summary.employeeRoles.total) },
      { label: "Active", value: String(summary.employeeRoles.active) },
      { label: "Employees with a role", value: String(summary.employeeRoles.assignedEmployees) },
      { label: "Without a role", value: String(summary.employeeRoles.unassignedEmployees) },
    ],
  },
];

function SettingsSectionCard({ section }: { section: SectionSpec }) {
  const access = useModulePermission(section.path);

  if (!access.canView) return null;

  return (
    <SectionCard
      icon={section.icon}
      title={section.title}
      description={section.description}
      action={<StatusBadge color={section.status.color} label={section.status.label} />}
    >
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {section.facts.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{fact.label}</dt>
            <dd className="truncate font-medium">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <Button variant="outline" size="sm" className="mt-auto w-fit cursor-pointer" asChild>
        <Link to={section.path}>
          {access.canEdit ? "Configure" : "View"}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </SectionCard>
  );
}

export default function HrmsSettingsOverviewPage() {
  const { data: summary, isLoading } = useGetHrmsSettingsSummaryQuery();

  return (
    <>
      <PageHeader
        title="HRMS settings"
        description="Everything leave, attendance, shifts, overtime and payroll are calculated from."
      />

      {isLoading || !summary ? (
        <LoadingSpinner />
      ) : (
        <>
          <StatGrid className="lg:grid-cols-4">
            <Stat>
              <StatLabel>Leave types</StatLabel>
              <StatValue>{summary.leave.activeTypes}</StatValue>
              <StatDescription>
                {dayText(summary.leave.totalPaidDays)} of paid leave a year
              </StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Shifts</StatLabel>
              <StatValue>{summary.shifts.active}</StatValue>
              <StatDescription>
                Week starts {summary.shifts.weekStartLabel}, off {summary.shifts.weekendLabel}
              </StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Holidays this year</StatLabel>
              <StatValue>{summary.holidays.thisYear}</StatValue>
              <StatDescription>
                {summary.holidays.upcoming} still to come
              </StatDescription>
            </Stat>
            <Stat>
              <StatLabel>Overtime</StatLabel>
              <StatValue>
                {summary.overtime.enabled ? `${summary.overtime.dailyMultiplier}x` : "Off"}
              </StatValue>
              <StatDescription>
                {summary.overtime.enabled
                  ? `Beyond ${summary.overtime.dailyThresholdHours} hours a day`
                  : "Extra hours are not paid"}
              </StatDescription>
            </Stat>
          </StatGrid>

          <div className="grid gap-4 lg:grid-cols-2">
            {buildSections(summary).map((section) => (
              <SettingsSectionCard key={section.path} section={section} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
