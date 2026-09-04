import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";
import type { LeaveTypeRef } from "./leaveType";

export const LEAVE_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;

export type LeaveRequestStatus = (typeof LEAVE_REQUEST_STATUSES)[number];

export const LEAVE_REQUEST_STATUS_LABELS: Record<LeaveRequestStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Withdrawn",
};

export const LEAVE_REQUEST_STATUS_COLORS: Record<LeaveRequestStatus, StatusColor> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
  CANCELLED: "zinc",
};

export const LEAVE_DAY_PARTS = ["FULL_DAY", "FIRST_HALF", "SECOND_HALF"] as const;

export type LeaveDayPart = (typeof LEAVE_DAY_PARTS)[number];

export const LEAVE_DAY_PART_LABELS: Record<LeaveDayPart, string> = {
  FULL_DAY: "Full day",
  FIRST_HALF: "First half",
  SECOND_HALF: "Second half",
};

export interface LeaveAttachment {
  url: string;
  fileName: string;
}

export interface LeaveRequest {
  _id: string;
  employeeId: string;
  employee: EmployeeRef | null;
  leaveTypeId: string;
  leaveType: LeaveTypeRef | null;
  startDate: string;
  endDate: string;
  dayPart: LeaveDayPart;
  dayPartLabel: string;
  days: number;
  reason: string;
  contactNumber: string;
  handoverToId: string | null;
  handoverTo: EmployeeRef | null;
  attachments: LeaveAttachment[];
  status: LeaveRequestStatus;
  statusLabel: string;
  reviewedByName: string;
  reviewedAt: string | null;
  reviewNote: string;
  isPending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  employeeId?: string;
  leaveTypeId?: string;
  status?: LeaveRequestStatus;
  from?: string;
  to?: string;
}

export interface LeaveBalanceRow {
  leaveTypeId: string;
  name: string;
  code: string;
  color: string;
  isPaid: boolean;
  allowHalfDay: boolean;
  requiresDocument: boolean;
  documentAfterDays: number;
  noticeDays: number;
  maxDaysPerRequest: number;
  entitledDays: number;
  takenDays: number;
  pendingDays: number;
  remainingDays: number;
}

export interface LeaveRequestSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  daysTakenThisYear: number;
  daysPending: number;
  entitledDays: number;
  remainingDays: number;
  leaveYearLabel: string;
  balances: LeaveBalanceRow[];
}

export interface CreateLeaveRequestPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  dayPart?: LeaveDayPart;
  reason: string;
  contactNumber?: string;
  handoverToId?: string | null;
  attachments?: LeaveAttachment[];
}

export interface ReviewLeaveRequestPayload {
  reviewNote?: string;
}

export const formatDays = (value: number): string =>
  `${value % 1 === 0 ? value : value.toFixed(1)} day${value === 1 ? "" : "s"}`;
