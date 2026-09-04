import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";
import type { GoalRef } from "./goal";
import type { TaskRef } from "./task";

export const TIMESHEET_STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as const;

export type TimesheetStatus = (typeof TIMESHEET_STATUSES)[number];

export const TIMESHEET_STATUS_LABELS: Record<TimesheetStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Waiting for approval",
  APPROVED: "Approved",
  REJECTED: "Sent back",
};

export const TIMESHEET_STATUS_COLORS: Record<TimesheetStatus, StatusColor> = {
  DRAFT: "zinc",
  SUBMITTED: "amber",
  APPROVED: "green",
  REJECTED: "red",
};

export const TIMESHEET_WORK_TYPES = [
  "TASK",
  "GOAL",
  "MEETING",
  "SUPPORT",
  "TRAINING",
  "ADMIN",
  "OTHER",
] as const;

export type TimesheetWorkType = (typeof TIMESHEET_WORK_TYPES)[number];

export const TIMESHEET_WORK_TYPE_LABELS: Record<TimesheetWorkType, string> = {
  TASK: "Task",
  GOAL: "Goal",
  MEETING: "Meeting",
  SUPPORT: "Support",
  TRAINING: "Training",
  ADMIN: "Admin",
  OTHER: "Other",
};

export interface TimesheetEntry {
  _id: string;
  employeeId: string;
  employee: EmployeeRef | null;
  date: string;
  weekStart: string;
  workType: TimesheetWorkType;
  workTypeLabel: string;
  task: TaskRef | null;
  taskId: string | null;
  goal: GoalRef | null;
  goalId: string | null;
  activity: string;
  hours: number;
  isBillable: boolean;
  note: string;
  status: TimesheetStatus;
  statusLabel: string;
  isEditable: boolean;
  submittedAt: string | null;
  reviewedByName: string;
  reviewedAt: string | null;
  reviewNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimesheetListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  employeeId?: string;
  status?: TimesheetStatus;
  workType?: TimesheetWorkType;
  taskId?: string;
  goalId?: string;
  isBillable?: boolean;
  from?: string;
  to?: string;
}

export interface TimesheetWeekQuery {
  weekStart?: string;
  employeeId?: string;
}

export interface TimesheetDay {
  date: string;
  weekday: number;
  isToday: boolean;
  isFuture: boolean;
  scheduledHours: number;
  loggedHours: number;
  billableHours: number;
  entries: TimesheetEntry[];
}

export interface TimesheetWeek {
  weekStart: string;
  weekEnd: string;
  timezone: string;
  status: TimesheetStatus;
  statusLabel: string;
  isSubmittable: boolean;
  submittedAt: string | null;
  reviewNote: string;
  days: TimesheetDay[];
  totals: {
    loggedHours: number;
    billableHours: number;
    scheduledHours: number;
    entryCount: number;
    daysLogged: number;
  };
}

export interface TimesheetSummary {
  from: string;
  to: string;
  loggedHours: number;
  billableHours: number;
  scheduledHours: number;
  entryCount: number;
  daysLogged: number;
  draftHours: number;
  submittedHours: number;
  approvedHours: number;
  rejectedHours: number;
  utilisation: number;
}

export interface TimesheetEntryPayload {
  date: string;
  workType?: TimesheetWorkType;
  taskId?: string | null;
  goalId?: string | null;
  activity?: string;
  hours: number;
  isBillable?: boolean;
  note?: string;
}

export interface SubmitTimesheetPayload {
  weekStart: string;
}

export const formatHours = (value: number): string => {
  const whole = Math.floor(value);
  const minutes = Math.round((value - whole) * 60);
  if (minutes === 0) return `${whole}h`;
  return whole === 0 ? `${minutes}m` : `${whole}h ${minutes}m`;
};

export const describeEntry = (entry: TimesheetEntry): string =>
  entry.task?.title || entry.goal?.title || entry.activity || entry.workTypeLabel;
