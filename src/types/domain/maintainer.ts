import type { User, UserStatus } from "./auth";
import type { ModulePermissionMap } from "./permission";

export type MaintainerStatus = Extract<UserStatus, "ACTIVE" | "INACTIVE">;

export interface Maintainer extends User {
  modulePermissions: ModulePermissionMap;
  grantedModuleCount: number;
}

export interface MaintainerListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: UserStatus;
}

export interface CreateMaintainerPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  status?: MaintainerStatus;
  modulePermissions?: ModulePermissionMap;
}

export interface UpdateMaintainerPayload {
  name?: string;
  phone?: string;
  password?: string;
  status?: MaintainerStatus;
  modulePermissions?: ModulePermissionMap;
}

export interface MaintainerSummary {
  total: number;
  active: number;
  inactive: number;
}
