import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";

export const WORK_HISTORY_TYPES = [
  "JOINED",
  "CONFIRMED",
  "PROMOTED",
  "TRANSFERRED",
  "DEPARTMENT_CHANGED",
  "DESIGNATION_CHANGED",
  "EMPLOYMENT_TYPE_CHANGED",
  "LOCATION_CHANGED",
  "SHIFT_CHANGED",
  "SALARY_REVISED",
  "SUPERVISOR_CHANGED",
  "STATUS_CHANGED",
  "RESIGNED",
  "TERMINATED",
  "REJOINED",
  "NOTE",
] as const;

export type WorkHistoryType = (typeof WORK_HISTORY_TYPES)[number];

export const WORK_HISTORY_TYPE_LABELS: Record<WorkHistoryType, string> = {
  JOINED: "Joined",
  CONFIRMED: "Confirmed",
  PROMOTED: "Promoted",
  TRANSFERRED: "Transferred",
  DEPARTMENT_CHANGED: "Department changed",
  DESIGNATION_CHANGED: "Designation changed",
  EMPLOYMENT_TYPE_CHANGED: "Employment type changed",
  LOCATION_CHANGED: "Work location changed",
  SHIFT_CHANGED: "Shift changed",
  SALARY_REVISED: "Salary revised",
  SUPERVISOR_CHANGED: "Supervisor changed",
  STATUS_CHANGED: "Status changed",
  RESIGNED: "Resigned",
  TERMINATED: "Terminated",
  REJOINED: "Rejoined",
  NOTE: "Note",
};

export const WORK_HISTORY_TYPE_COLORS: Record<WorkHistoryType, StatusColor> = {
  JOINED: "green",
  CONFIRMED: "green",
  PROMOTED: "violet",
  TRANSFERRED: "blue",
  DEPARTMENT_CHANGED: "blue",
  DESIGNATION_CHANGED: "violet",
  EMPLOYMENT_TYPE_CHANGED: "amber",
  LOCATION_CHANGED: "blue",
  SHIFT_CHANGED: "orange",
  SALARY_REVISED: "amber",
  SUPERVISOR_CHANGED: "blue",
  STATUS_CHANGED: "amber",
  RESIGNED: "red",
  TERMINATED: "red",
  REJOINED: "green",
  NOTE: "zinc",
};

export interface WorkHistoryEntry {
  _id: string;
  employeeId: string;
  employee: EmployeeRef | null;
  type: WorkHistoryType;
  typeLabel: string;
  title: string;
  effectiveDate: string;
  endDate: string | null;
  durationDays: number | null;
  fromLabel: string;
  toLabel: string;
  note: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkHistoryListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  employeeId?: string;
  type?: WorkHistoryType;
  from?: string;
  to?: string;
  isSystem?: boolean;
}

export interface WorkHistorySummary {
  total: number;
  employeesCovered: number;
  promotions: number;
  transfers: number;
  confirmations: number;
  exits: number;
  lastEventAt: string | null;
}

export interface WorkHistoryPayload {
  employeeId: string;
  type: WorkHistoryType;
  title?: string;
  effectiveDate: string;
  endDate?: string | null;
  fromLabel?: string;
  toLabel?: string;
  note?: string;
}
