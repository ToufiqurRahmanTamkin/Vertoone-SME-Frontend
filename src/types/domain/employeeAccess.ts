import type { RoleRef } from "./role";

export const EMPLOYEE_ACCESS_SOURCE_TYPES = ["DEPARTMENT", "DESIGNATION", "TEAM"] as const;
export type EmployeeAccessSourceType = (typeof EMPLOYEE_ACCESS_SOURCE_TYPES)[number];

export const EMPLOYEE_ACCESS_SOURCE_LABELS: Record<EmployeeAccessSourceType, string> = {
  DEPARTMENT: "Department",
  DESIGNATION: "Designation",
  TEAM: "Team",
};

export const EMPLOYEE_ACCESS_SOURCE_COLORS: Record<
  EmployeeAccessSourceType,
  "blue" | "violet" | "amber"
> = {
  DEPARTMENT: "blue",
  DESIGNATION: "violet",
  TEAM: "amber",
};

export interface EmployeeAccessSource {
  _id: string;
  type: EmployeeAccessSourceType;
  name: string;
  description: string;
  roles: RoleRef[];
  directModuleCount: number;
  moduleCount: number;
  employeeCount: number;
  isActive: boolean;
}

export interface EmployeeAccessListQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: EmployeeAccessSourceType;
  hasRoles?: boolean;
}

export interface EmployeeAccessSummary {
  employees: number;
  employeesWithAccount: number;
  accountsWithAccess: number;
  accountsWithoutAccess: number;
  directGrants: number;
  rolesInUse: number;
  totalRoles: number;
  sources: number;
  sourcesWithRoles: number;
}

export interface UpdateEmployeeAccessPayload {
  type: EmployeeAccessSourceType;
  id: string;
  roleIds: string[];
}
