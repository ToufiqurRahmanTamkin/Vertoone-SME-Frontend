import type { UserStatus } from "./auth";
import type { ModulePermissionMap } from "./permission";

export interface ConcernRef {
  _id: string;
  name: string;
  code: string;
}

export interface ConcernHead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  lastLoginAt: string | null;
  modulePermissions: ModulePermissionMap;
  roleIds: string[];
  effectivePermissions: ModulePermissionMap;
  createdAt: string;
}

export interface Concern extends ConcernRef {
  industry: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  notes: string;
  isActive: boolean;
  head: ConcernHead | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConcernListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface ConcernSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  headCount: number;
  activeHeadCount: number;
}

export interface CreateConcernPayload {
  name: string;
  code?: string;
  industry?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
  head: {
    name: string;
    email: string;
    password: string;
    phone: string;
    status?: Extract<UserStatus, "ACTIVE" | "INACTIVE">;
    modulePermissions?: ModulePermissionMap;
    roleIds?: string[];
  };
}

export type UpdateConcernPayload = Omit<CreateConcernPayload, "head">;

export interface UpdateConcernHeadPayload {
  name?: string;
  phone?: string;
  password?: string;
  status?: Extract<UserStatus, "ACTIVE" | "INACTIVE">;
  modulePermissions?: ModulePermissionMap;
  roleIds?: string[];
}

export const grantedMenuCount = (head: ConcernHead | null): number =>
  head
    ? Object.values(head.effectivePermissions).filter((permission) => permission.canView).length
    : 0;
