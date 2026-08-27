import type { Role, User, UserStatus } from "./auth";

export type CompanyRole = Extract<Role, "COMPANY_OWNER" | "COMPANY_USER">;

export interface AdminUser extends User {
  /** Resolved company name, or an em dash when the account has no company. */
  companyName: string;
}

export interface AdminUserListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  companyId?: string;
  role?: CompanyRole;
  status?: UserStatus;
}

export interface AdminUserCompanyOption {
  companyId: string;
  companyName: string;
  count: number;
}

export interface ResetUserPasswordPayload {
  password: string;
}
