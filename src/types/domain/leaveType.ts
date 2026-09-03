export const LEAVE_ACCRUALS = ["NONE", "MONTHLY", "QUARTERLY", "YEARLY"] as const;
export type LeaveAccrual = (typeof LEAVE_ACCRUALS)[number];

export const LEAVE_GENDERS = ["ALL", "MALE", "FEMALE"] as const;
export type LeaveGender = (typeof LEAVE_GENDERS)[number];

export const LEAVE_ACCRUAL_LABELS: Record<LeaveAccrual, string> = {
  NONE: "Granted on request",
  MONTHLY: "Accrues monthly",
  QUARTERLY: "Accrues quarterly",
  YEARLY: "Granted yearly",
};

export const LEAVE_GENDER_LABELS: Record<LeaveGender, string> = {
  ALL: "Everyone",
  MALE: "Male employees",
  FEMALE: "Female employees",
};

export interface LeaveTypeRef {
  _id: string;
  name: string;
  code: string;
  color: string;
}

export interface LeaveType extends LeaveTypeRef {
  description: string;
  daysPerYear: number;
  isPaid: boolean;
  accrual: LeaveAccrual;
  carryForward: boolean;
  maxCarryForwardDays: number;
  encashable: boolean;
  allowHalfDay: boolean;
  requiresApproval: boolean;
  requiresDocument: boolean;
  documentAfterDays: number;
  minDaysPerRequest: number;
  maxDaysPerRequest: number;
  maxConsecutiveDays: number;
  noticeDays: number;
  applicableGender: LeaveGender;
  availableAfterMonths: number;
  countWeekends: boolean;
  countHolidays: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveTypeListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
  isPaid?: boolean;
}

export interface LeaveTypeOptionQuery {
  search?: string;
}

export interface LeaveTypeSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  paidCount: number;
  totalPaidDays: number;
  carryForwardCount: number;
}

export interface LeaveTypePayload {
  name: string;
  code?: string;
  color?: string;
  description?: string;
  daysPerYear?: number;
  isPaid?: boolean;
  accrual?: LeaveAccrual;
  carryForward?: boolean;
  maxCarryForwardDays?: number;
  encashable?: boolean;
  allowHalfDay?: boolean;
  requiresApproval?: boolean;
  requiresDocument?: boolean;
  documentAfterDays?: number;
  minDaysPerRequest?: number;
  maxDaysPerRequest?: number;
  maxConsecutiveDays?: number;
  noticeDays?: number;
  applicableGender?: LeaveGender;
  availableAfterMonths?: number;
  countWeekends?: boolean;
  countHolidays?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}
