import type { EmployeeRef } from "./employee";
import type { ShiftRef } from "./shift";

export const ROSTER_STATUSES = ["DRAFT", "PUBLISHED"] as const;

export type RosterStatus = (typeof ROSTER_STATUSES)[number];

export const ROSTER_STATUS_LABELS: Record<RosterStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
};

export interface ShiftRosterEntry {
  _id: string;
  employeeId: string;
  employee: EmployeeRef | null;
  date: string;
  shift: ShiftRef | null;
  shiftId: string | null;
  isWeekOff: boolean;
  status: RosterStatus;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftRosterListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  employeeId?: string;
  shiftId?: string;
  status?: RosterStatus;
  from?: string;
  to?: string;
}

export interface RosterGridQuery {
  from: string;
  to: string;
  employeeId?: string;
  departmentId?: string;
  search?: string;
}

export interface RosterGridCell {
  date: string;
  entryId: string | null;
  shift: ShiftRef | null;
  isWeekOff: boolean;
  status: RosterStatus | null;
  source: string;
  note: string;
}

export interface RosterGridRow {
  employee: EmployeeRef;
  employeeId: string;
  cells: RosterGridCell[];
}

export interface RosterGrid {
  from: string;
  to: string;
  days: string[];
  rows: RosterGridRow[];
}

export interface ShiftRosterSummary {
  planned: number;
  published: number;
  draft: number;
  weekOffs: number;
  employeesCovered: number;
  from: string;
  to: string;
}

export interface UpsertRosterEntryPayload {
  employeeId: string;
  date: string;
  shiftId?: string | null;
  isWeekOff?: boolean;
  status?: RosterStatus;
  note?: string;
}

export interface UpdateRosterEntryPayload {
  shiftId?: string | null;
  isWeekOff?: boolean;
  status?: RosterStatus;
  note?: string;
}

export interface GenerateRosterPayload {
  employeeIds: string[];
  shiftIds: string[];
  from: string;
  to: string;
  daysPerShift?: number;
  weekOffDays?: number[];
  status?: RosterStatus;
  overwrite?: boolean;
}

export interface GenerateRosterResult {
  created: number;
  updated: number;
  skipped: number;
  days: number;
}

export interface PublishRosterPayload {
  from: string;
  to: string;
  employeeIds?: string[];
}
