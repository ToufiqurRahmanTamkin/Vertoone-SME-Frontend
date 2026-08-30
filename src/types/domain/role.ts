import type { ModulePermissionMap } from "./permission";

export interface RoleRef {
  _id: string;
  name: string;
}

export interface RoleAssignmentCounts {
  users: number;
  departments: number;
  designations: number;
  teams: number;
}

export interface Role extends RoleRef {
  description: string;
  modulePermissions: ModulePermissionMap;
  effectivePermissions: ModulePermissionMap;
  moduleCount: number;
  isActive: boolean;
  assignments: RoleAssignmentCounts;
  createdAt: string;
  updatedAt: string;
}

export interface RoleListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
}

export interface RoleOptionQuery {
  search?: string;
}

export interface RoleSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  assignedUserCount: number;
}

export interface RolePayload {
  name: string;
  description?: string;
  modulePermissions?: ModulePermissionMap;
  isActive?: boolean;
}

export const totalAssignments = (counts: RoleAssignmentCounts): number =>
  counts.users + counts.departments + counts.designations + counts.teams;
