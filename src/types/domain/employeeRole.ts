import type { ModulePermissionMap } from "./permission";

export interface EmployeeRoleRef {
  _id: string;
  name: string;
}

export interface EmployeeRole extends EmployeeRoleRef {
  description: string;
  modulePermissions: ModulePermissionMap;
  effectivePermissions: ModulePermissionMap;
  moduleCount: number;
  isActive: boolean;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRoleListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface EmployeeRoleOptionQuery {
  search?: string;
}

export interface EmployeeRoleSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  assignedEmployeeCount: number;
  unassignedEmployeeCount: number;
}

export interface EmployeeRolePayload {
  name: string;
  description?: string;
  modulePermissions?: ModulePermissionMap;
  isActive?: boolean;
  employeeIds?: string[];
}
