export interface ShiftRef {
  _id: string;
  name: string;
  code: string;
  color: string;
  startTime: string;
  endTime: string;
}

export interface Shift extends ShiftRef {
  description: string;
  breakMinutes: number;
  workingDays: number[];
  graceMinutes: number;
  earlyLeaveGraceMinutes: number;
  minHoursFullDay: number;
  minHoursHalfDay: number;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  durationMinutes: number;
  paidMinutes: number;
  crossesMidnight: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface ShiftOptionQuery {
  search?: string;
}

export interface ShiftSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  nightShiftCount: number;
  defaultShiftName: string;
  averagePaidHours: number;
}

export interface ShiftPayload {
  name: string;
  code?: string;
  color?: string;
  description?: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  workingDays?: number[];
  graceMinutes?: number;
  earlyLeaveGraceMinutes?: number;
  minHoursFullDay?: number;
  minHoursHalfDay?: number;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}
