export const ACTIVITY_CATEGORIES = [
  "COMPANY",
  "SUBSCRIPTION",
  "BILLING",
  "FINANCE",
  "CATALOG",
  "CONTENT",
  "SECURITY",
  "SYSTEM",
] as const;
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export const ACTIVITY_SEVERITIES = ["INFO", "SUCCESS", "WARNING", "CRITICAL"] as const;
export type ActivitySeverity = (typeof ACTIVITY_SEVERITIES)[number];

export const ACTIVITY_ACTIONS = [
  "COMPANY_REGISTERED",
  "COMPANY_APPROVED",
  "COMPANY_REJECTED",
  "COMPANY_SUSPENDED",
  "COMPANY_REACTIVATED",
  "COMPANY_DELETED",
  "SUBSCRIPTION_CREATED",
  "SUBSCRIPTION_UPDATED",
  "SUBSCRIPTION_DELETED",
  "SUBSCRIPTION_RENEWED",
  "SUBSCRIPTION_EXPIRED",
  "PAYMENT_APPROVED",
  "PAYMENT_REJECTED",
  "PAYMENT_REFUNDED",
  "PLAN_CREATED",
  "PLAN_UPDATED",
  "PLAN_DELETED",
  "INCOME_CREATED",
  "INCOME_UPDATED",
  "INCOME_DELETED",
  "EXPENSE_CREATED",
  "EXPENSE_UPDATED",
  "EXPENSE_DELETED",
  "INVOICE_CREATED",
  "INVOICE_UPDATED",
  "INVOICE_DELETED",
  "CATEGORY_CREATED",
  "CATEGORY_UPDATED",
  "CATEGORY_DELETED",
  "GUIDE_CREATED",
  "GUIDE_UPDATED",
  "GUIDE_DELETED",
  "USER_LOGGED_IN",
  "USER_LOGIN_FAILED",
  "USER_PROFILE_UPDATED",
  "USER_PASSWORD_CHANGED",
  "USER_PASSWORD_RESET",
  "EMAIL_RESENT",
  "SYSTEM_CONFIG_UPDATED",
  "DATA_WIPE_EXECUTED",
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

export const ACTIVITY_ENTITY_TYPES = [
  "COMPANY",
  "SOLD_SUBSCRIPTION",
  "SUBSCRIPTION_PLAN",
  "INCOME",
  "EXPENSE",
  "INVOICE",
  "FINANCE_CATEGORY",
  "USER_GUIDE",
  "USER",
  "EMAIL",
  "SYSTEM_CONFIG",
  "SYSTEM",
] as const;
export type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number];

export interface Activity {
  _id: string;
  action: ActivityAction;
  category: ActivityCategory;
  severity: ActivitySeverity;
  message: string;
  entityType: ActivityEntityType;
  entityId: string | null;
  entityLabel: string;
  companyId: string | null;
  companyName: string;
  actorId: string | null;
  actorName: string;
  actorEmail: string;
  actorRole: string | null;
  isSystemActor: boolean;
  ipAddress: string;
  userAgent: string;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  companyId?: string;
  action?: ActivityAction;
  category?: ActivityCategory;
  severity?: ActivitySeverity;
  entityType?: ActivityEntityType;
  actorId?: string;
  from?: string;
  to?: string;
}

export interface ActivityCompanyOption {
  companyId: string;
  companyName: string;
  count: number;
}

export interface ActivitySummary {
  total: number;
  today: number;
  criticalCount: number;
  companiesTouched: number;
  byCategory: { category: ActivityCategory; count: number }[];
}
