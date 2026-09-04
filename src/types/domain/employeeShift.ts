import type { EmployeeRef } from "./employee";
import type { ShiftRef } from "./shift";

export const SHIFT_ASSIGNMENT_TYPES = ["FIXED", "WEEKLY", "ROSTER"] as const;

export type ShiftAssignmentType = (typeof SHIFT_ASSIGNMENT_TYPES)[number];

export const SHIFT_ASSIGNMENT_TYPE_LABELS: Record<ShiftAssignmentType, string> = {
  FIXED: "Fixed shift",
  WEEKLY: "Per weekday",
  ROSTER: "Roster driven",
};

export const SHIFT_ASSIGNMENT_TYPE_HINTS: Record<ShiftAssignmentType, string> = {
  FIXED: "One shift, worked on the days that shift covers.",
  WEEKLY: "A different shift — or a day off — for each day of the week.",
  ROSTER: "Whatever the published roster says for the day.",
};

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const WEEKDAY_SHORT_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export interface WeeklySlot {
  day: number;
  dayLabel: string;
  shift: ShiftRef | null;
  isWeekOff: boolean;
}

export interface EmployeeShift {
  _id: string;
  employeeId: string;
  employee: EmployeeRef | null;
  assignmentType: ShiftAssignmentType;
  shift: ShiftRef | null;
  shiftId: string | null;
  weeklyShifts: WeeklySlot[];
  rotationShifts: ShiftRef[];
  rotationShiftIds: string[];
  rotationDaysPerShift: number;
  rotationStartDate: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  isCurrent: boolean;
  workingDayCount: number;
  weekOffDayCount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeShiftListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  employeeId?: string;
  shiftId?: string;
  assignmentType?: ShiftAssignmentType;
  isActive?: boolean;
  currentOnly?: boolean;
}

export interface EmployeeShiftSummary {
  assigned: number;
  unassigned: number;
  fixedCount: number;
  weeklyCount: number;
  rosterCount: number;
  employeeCount: number;
  defaultShiftName: string;
}

export interface WeeklySlotPayload {
  day: number;
  shiftId?: string | null;
  isWeekOff?: boolean;
}

export interface EmployeeShiftPayload {
  employeeId: string;
  assignmentType: ShiftAssignmentType;
  shiftId?: string | null;
  weeklyShifts?: WeeklySlotPayload[];
  rotationShiftIds?: string[];
  rotationDaysPerShift?: number;
  rotationStartDate?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive?: boolean;
  note?: string;
}

export interface BulkAssignShiftPayload {
  employeeIds: string[];
  assignmentType: ShiftAssignmentType;
  shiftId?: string | null;
  weeklyShifts?: WeeklySlotPayload[];
  rotationShiftIds?: string[];
  rotationDaysPerShift?: number;
  rotationStartDate?: string | null;
  effectiveFrom: string;
  note?: string;
}

export interface BulkAssignResult {
  assigned: number;
  skipped: number;
  messages: string[];
}

export type DayScheduleKind = "SHIFT" | "WEEK_OFF" | "HOLIDAY";

export interface DaySchedule {
  date: string;
  weekday: number;
  kind: DayScheduleKind;
  source: string;
  shiftId: string | null;
  shiftName: string;
  shiftColor: string;
  startTime: string;
  endTime: string;
  crossesMidnight: boolean;
  holidayName: string;
}

export interface MyShiftPlan {
  assignment: EmployeeShift | null;
  timezone: string;
  today: DaySchedule | null;
  upcoming: DaySchedule[];
}
