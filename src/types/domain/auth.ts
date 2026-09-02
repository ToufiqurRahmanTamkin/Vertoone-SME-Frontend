import type { ModulePermissionMap } from "./permission";

export const ROLES = [
  "SUPER_ADMIN",
  "COMPANY_OWNER",
  "COMPANY_USER",
  "CONCERN_HEAD",
  "EMPLOYEE",
] as const;
export type UserRole = (typeof ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "INACTIVE", "PENDING_APPROVAL", "REJECTED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  companyId: string | null;
  concernId: string | null;
  avatarUrl: string | null;
  avatarPublicId: string | null;
  lastLoginAt: string | null;
  modulePermissions: ModulePermissionMap;
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ForgotPasswordResponse {
  email: string;
  expiresInMinutes: number;
  isMailConfigured: boolean;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  email: string;
  resetToken: string;
  expiresAt: string;
}

export interface ResetPasswordInput {
  email: string;
  resetToken: string;
  newPassword: string;
}

export const HOME_ROUTE_BY_ROLE: Record<UserRole, string> = {
  SUPER_ADMIN: "/platform/dashboard",
  COMPANY_OWNER: "/company/dashboard",
  COMPANY_USER: "/company/dashboard",
  CONCERN_HEAD: "/company/my-concern",
  EMPLOYEE: "/company/my-profile",
};
