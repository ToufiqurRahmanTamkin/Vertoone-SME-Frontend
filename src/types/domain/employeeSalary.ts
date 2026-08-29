import type { EmployeeRef } from "./employee";

export const SALARY_CHANGE_TYPES = ["INITIAL", "INCREMENT", "DECREMENT", "REVISION"] as const;
export type SalaryChangeType = (typeof SALARY_CHANGE_TYPES)[number];

export interface EmployeeSalaryRecord {
  _id: string;
  employeeId: string;
  employee: EmployeeRef | null;
  amount: number;
  currency: string;
  previousAmount: number | null;
  changeAmount: number | null;
  changePercent: number | null;
  changeType: SalaryChangeType;
  effectiveFrom: string;
  note: string;
  createdAt: string;
}

export interface EmployeeSalaryPayload {
  employeeId: string;
  amount: number;
  currency?: string;
  effectiveFrom?: string;
  note?: string;
}

export interface EmployeeSalaryHistoryQuery {
  employeeId: string;
  page?: number;
  limit?: number;
}
