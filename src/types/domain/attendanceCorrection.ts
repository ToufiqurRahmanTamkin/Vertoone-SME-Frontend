import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";

export const CORRECTION_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;

export type CorrectionStatus = (typeof CORRECTION_STATUSES)[number];

export const CORRECTION_STATUS_LABELS: Record<CorrectionStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Withdrawn",
};

export const CORRECTION_STATUS_COLORS: Record<CorrectionStatus, StatusColor> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
  CANCELLED: "zinc",
};

export const CORRECTION_TYPES = [
  "MISSED_CLOCK_IN",
  "MISSED_CLOCK_OUT",
  "WRONG_TIME",
  "WORKED_ON_OFF_DAY",
  "OTHER",
] as const;

export type CorrectionType = (typeof CORRECTION_TYPES)[number];

export const CORRECTION_TYPE_LABELS: Record<CorrectionType, string> = {
  MISSED_CLOCK_IN: "Missed clock-in",
  MISSED_CLOCK_OUT: "Missed clock-out",
  WRONG_TIME: "Wrong punch time",
  WORKED_ON_OFF_DAY: "Worked on a day off",
  OTHER: "Something else",
};

export interface AttendanceCorrection {
  _id: string;
  employeeId: string;
  employee: EmployeeRef | null;
  attendanceId: string | null;
  date: string;
  type: CorrectionType;
  typeLabel: string;
  requestedClockInAt: string | null;
  requestedClockOutAt: string | null;
  reason: string;
  status: CorrectionStatus;
  statusLabel: string;
  reviewedByName: string;
  reviewedAt: string | null;
  reviewNote: string;
  isPending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CorrectionListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  employeeId?: string;
  status?: CorrectionStatus;
  type?: CorrectionType;
  from?: string;
  to?: string;
}

export interface CorrectionSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  usedThisMonth: number;
  monthlyAllowance: number;
  windowDays: number;
  regularizationEnabled: boolean;
}

export interface CreateCorrectionPayload {
  date: string;
  type: CorrectionType;
  requestedClockInAt?: string | null;
  requestedClockOutAt?: string | null;
  reason: string;
}

export interface ReviewCorrectionPayload {
  reviewNote?: string;
}
