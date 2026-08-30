import type { User, UserStatus } from "./auth";
import type { ModulePermissionMap } from "./permission";

export interface TeamMember extends User {
  modulePermissions: ModulePermissionMap;
  roleIds: string[];
  effectivePermissions: ModulePermissionMap;
}

export interface TeamMemberListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: UserStatus;
}

export interface CreateTeamMemberPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  status?: Extract<UserStatus, "ACTIVE" | "INACTIVE">;
  modulePermissions?: ModulePermissionMap;
  roleIds?: string[];
}

export interface UpdateTeamMemberPayload {
  name?: string;
  phone?: string;
  password?: string;
  status?: Extract<UserStatus, "ACTIVE" | "INACTIVE">;
  modulePermissions?: ModulePermissionMap;
  roleIds?: string[];
}

export interface TeamMemberSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
}
