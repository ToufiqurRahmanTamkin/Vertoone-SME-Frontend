import type { EmployeeRef } from "./employee";
import type { ModulePermissionMap } from "./permission";
import type { RoleRef } from "./role";
import type { TagRef } from "./tag";

export interface Team {
  _id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  department: string;
  teamLead: EmployeeRef | null;
  supervisor: EmployeeRef | null;
  members: EmployeeRef[];
  memberIds: string[];
  memberCount: number;
  tags: TagRef[];
  tagIds: string[];
  modulePermissions: ModulePermissionMap;
  roles: RoleRef[];
  roleIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isActive?: boolean;
  department?: string;
  teamLeadId?: string;
  supervisorId?: string;
  memberId?: string;
  tagIds?: string;
}

export interface TeamSummaryStats {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  inactiveCount: number;
  assignedEmployeeCount: number;
}

export interface TeamPayload {
  name: string;
  code?: string;
  description?: string;
  color?: string;
  department?: string;
  teamLeadId: string;
  supervisorId: string;
  memberIds?: string[];
  tagIds?: string[];
  modulePermissions?: ModulePermissionMap;
  roleIds?: string[];
  isActive?: boolean;
}
