import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";
import type { DayScheduleKind } from "./employeeShift";
import type { ShiftRef } from "./shift";

export const ATTENDANCE_STATUSES = [
  "PRESENT",
  "LATE",
  "HALF_DAY",
  "ABSENT",
  "WEEK_OFF",
  "HOLIDAY",
  "ON_LEAVE",
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export type CalendarDayStatus = AttendanceStatus | "SCHEDULED";

export const ATTENDANCE_STATUS_LABELS: Record<CalendarDayStatus, string> = {
  PRESENT: "Present",
  LATE: "Late",
  HALF_DAY: "Half day",
  ABSENT: "Absent",
  WEEK_OFF: "Week off",
  HOLIDAY: "Holiday",
  ON_LEAVE: "On leave",
  SCHEDULED: "Scheduled",
};

export const ATTENDANCE_STATUS_COLORS: Record<CalendarDayStatus, StatusColor> = {
  PRESENT: "green",
  LATE: "amber",
  HALF_DAY: "orange",
  ABSENT: "red",
  WEEK_OFF: "zinc",
  HOLIDAY: "violet",
  ON_LEAVE: "blue",
  SCHEDULED: "muted",
};

export const CLOCK_SOURCES = ["WEB", "MOBILE", "BIOMETRIC", "QR"] as const;

export type ClockSource = (typeof CLOCK_SOURCES)[number];

export type AttendanceSource = ClockSource | "MANUAL";

export interface AttendanceSession {
  clockInAt: string;
  clockOutAt: string | null;
  source: AttendanceSource;
  clockInNote: string;
  clockOutNote: string;
  clockInLocation: string;
  clockOutLocation: string;
  minutes: number;
  isOpen: boolean;
  isManual: boolean;
}

export interface Attendance {
  _id: string;
  employeeId: string;
  employee: EmployeeRef | null;
  date: string;
  timezone: string;
  shift: ShiftRef | null;
  shiftId: string | null;
  shiftName: string;
  shiftColor: string;
  shiftStartTime: string;
  shiftEndTime: string;
  crossesMidnight: boolean;
  scheduleKind: DayScheduleKind;
  scheduleSource: string;
  holidayName: string;
  sessions: AttendanceSession[];
  firstClockInAt: string | null;
  lastClockOutAt: string | null;
  status: AttendanceStatus;
  statusLabel: string;
  workedMinutes: number;
  workedHours: number;
  scheduledMinutes: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  isOpen: boolean;
  isManual: boolean;
  isCorrected: boolean;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  employeeId?: string;
  departmentId?: string;
  shiftId?: string;
  status?: AttendanceStatus;
  from?: string;
  to?: string;
}

export interface AttendanceSummaryQuery {
  from?: string;
  to?: string;
  employeeId?: string;
  departmentId?: string;
}

export interface AttendanceSummary {
  from: string;
  to: string;
  totalRecords: number;
  presentCount: number;
  lateCount: number;
  halfDayCount: number;
  absentCount: number;
  weekOffCount: number;
  holidayCount: number;
  onLeaveCount: number;
  openSessions: number;
  clockedInToday: number;
  headcount: number;
  totalWorkedHours: number;
  averageWorkedHours: number;
  totalLateMinutes: number;
  totalOvertimeHours: number;
  attendanceRate: number;
}

export interface CalendarQuery {
  year?: number;
  month?: number;
  employeeId?: string;
}

export interface CalendarDay {
  date: string;
  weekday: number;
  status: CalendarDayStatus;
  statusLabel: string;
  shiftName: string;
  shiftColor: string;
  startTime: string;
  endTime: string;
  holidayName: string;
  firstClockInAt: string | null;
  lastClockOutAt: string | null;
  workedMinutes: number;
  workedHours: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  isToday: boolean;
  isFuture: boolean;
  hasRecord: boolean;
  attendanceId: string | null;
}

export interface AttendanceCalendar {
  year: number;
  month: number;
  timezone: string;
  from: string;
  to: string;
  days: CalendarDay[];
  totals: {
    present: number;
    late: number;
    halfDay: number;
    absent: number;
    weekOff: number;
    holiday: number;
    onLeave: number;
    scheduled: number;
    workedHours: number;
    overtimeHours: number;
    lateMinutes: number;
  };
}

export interface TodayStatus {
  date: string;
  timezone: string;
  serverTime: string;
  employeeId: string;
  employeeName: string;
  scheduleKind: DayScheduleKind;
  shiftName: string;
  shiftColor: string;
  shiftStartTime: string;
  shiftEndTime: string;
  holidayName: string;
  status: AttendanceStatus;
  statusLabel: string;
  isClockedIn: boolean;
  canClockIn: boolean;
  canClockOut: boolean;
  blockedReason: string;
  openedAt: string | null;
  firstClockInAt: string | null;
  lastClockOutAt: string | null;
  workedMinutes: number;
  workedHours: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  overtimeMinutes: number;
  sessions: AttendanceSession[];
  attendanceId: string | null;
}

export interface ClockPayload {
  note?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  source?: ClockSource;
}

export interface ManualSessionPayload {
  clockInAt: string;
  clockOutAt?: string | null;
  note?: string;
}

export interface UpsertAttendancePayload {
  employeeId: string;
  date: string;
  sessions?: ManualSessionPayload[];
  status?: AttendanceStatus;
  note?: string;
}

export interface UpdateAttendancePayload {
  sessions?: ManualSessionPayload[];
  status?: AttendanceStatus;
  note?: string;
}

export interface TeamAttendanceRow {
  employeeId: string;
  employee: EmployeeRef | null;
  status: AttendanceStatus;
  statusLabel: string;
  shiftName: string;
  shiftStartTime: string;
  firstClockInAt: string | null;
  lastClockOutAt: string | null;
  workedHours: number;
  lateMinutes: number;
  isClockedIn: boolean;
}

export const formatMinutes = (minutes: number): string => {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
};

export const formatClock = (value: string | null): string =>
  value
    ? new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : "—";
