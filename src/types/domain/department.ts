import type { EmployeeRef } from "./employee";

export interface DepartmentRef {
  _id: string;
  name: string;
  code: string;
}

export interface Department extends DepartmentRef {
  description: string;
  head: EmployeeRef | null;
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface DepartmentOptionQuery {
  search?: string;
}

export interface DepartmentSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  unassignedEmployeeCount: number;
}

export interface DepartmentPayload {
  name: string;
  code?: string;
  description?: string;
  headId?: string | null;
  isActive?: boolean;
}
