import type { StatusColor } from "@/components/shared/status-badge";
import type { EmployeeRef } from "./employee";

export const AUDIENCE_TYPES = [
  "ALL",
  "DEPARTMENTS",
  "DESIGNATIONS",
  "EMPLOYEES",
  "USERS",
] as const;
export type AudienceType = (typeof AUDIENCE_TYPES)[number];

export const AUDIENCE_LABELS: Record<AudienceType, string> = {
  ALL: "Everyone",
  DEPARTMENTS: "Departments",
  DESIGNATIONS: "Designations",
  EMPLOYEES: "Specific employees",
  USERS: "Specific users",
};

export const POLICY_CATEGORIES = [
  "HR",
  "CONDUCT",
  "LEAVE",
  "ATTENDANCE",
  "PAYROLL",
  "IT",
  "SECURITY",
  "SAFETY",
  "FINANCE",
  "TRAVEL",
  "OTHER",
] as const;
export type PolicyCategory = (typeof POLICY_CATEGORIES)[number];

export const POLICY_CATEGORY_LABELS: Record<PolicyCategory, string> = {
  HR: "HR",
  CONDUCT: "Code of conduct",
  LEAVE: "Leave",
  ATTENDANCE: "Attendance",
  PAYROLL: "Payroll",
  IT: "IT",
  SECURITY: "Security",
  SAFETY: "Health & safety",
  FINANCE: "Finance",
  TRAVEL: "Travel",
  OTHER: "Other",
};

export const POLICY_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type PolicyStatus = (typeof POLICY_STATUSES)[number];

export const POLICY_STATUS_LABELS: Record<PolicyStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const POLICY_STATUS_COLORS: Record<PolicyStatus, StatusColor> = {
  DRAFT: "amber",
  PUBLISHED: "green",
  ARCHIVED: "zinc",
};

export interface PolicyFile {
  url: string;
  publicId: string;
  fileName: string;
  extension: string;
  fileSize: number;
}

export interface AudienceRef {
  _id: string;
  name: string;
}

export interface PolicyVersion {
  _id: string;
  version: number;
  note: string;
  file: PolicyFile | null;
  publishedAt: string;
}

export interface PolicyRef {
  _id: string;
  title: string;
  code: string;
  category: PolicyCategory;
}

export interface Policy extends PolicyRef {
  summary: string;
  content: string;
  file: PolicyFile | null;
  status: PolicyStatus;
  version: number;
  versions: PolicyVersion[];
  audience: AudienceType;
  audienceLabel: string;
  departmentIds: string[];
  designationIds: string[];
  employeeIds: string[];
  userIds: string[];
  departments: AudienceRef[];
  designations: AudienceRef[];
  effectiveFrom: string | null;
  reviewDueAt: string | null;
  isReviewDue: boolean;
  isReviewDueSoon: boolean;
  requiresAcknowledgement: boolean;
  acknowledgementDueDays: number;
  publishedAt: string | null;
  owner: EmployeeRef | null;
  ownerEmployeeId: string | null;
  acknowledgedCount: number;
  audienceCount: number;
  acknowledgementRate: number;
  hasAcknowledged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: PolicyStatus;
  category?: PolicyCategory;
  requiresAcknowledgement?: boolean;
  reviewDueOnly?: boolean;
}

export interface PolicySummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  needsAcknowledgementCount: number;
  reviewDueCount: number;
  acknowledgementRate: number;
  pendingForMe: number;
}

export interface PolicyPayload {
  title: string;
  code?: string;
  category?: PolicyCategory;
  summary?: string;
  content?: string;
  file?: PolicyFile | null;
  status?: PolicyStatus;
  audience?: AudienceType;
  departmentIds?: string[];
  designationIds?: string[];
  employeeIds?: string[];
  userIds?: string[];
  effectiveFrom?: string | null;
  reviewDueAt?: string | null;
  requiresAcknowledgement?: boolean;
  acknowledgementDueDays?: number;
  ownerEmployeeId?: string | null;
}

export interface PolicyAcknowledgement {
  _id: string;
  policy: PolicyRef | null;
  policyId: string | null;
  employee: EmployeeRef | null;
  employeeId: string | null;
  userName: string;
  userId: string | null;
  version: number;
  acknowledgedAt: string;
  note: string;
  isCurrentVersion: boolean;
}

export interface PolicyAcknowledgementListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  policyId?: string;
  employeeId?: string;
  outdatedOnly?: boolean;
}

export interface PolicyAcknowledgementSummary {
  total: number;
  policiesTracked: number;
  peopleAcknowledged: number;
  outdatedCount: number;
  pendingCount: number;
  coverageRate: number;
}

export interface PolicyOverview {
  summary: PolicySummary;
  byCategory: { category: PolicyCategory; count: number }[];
  byStatus: { status: PolicyStatus; count: number }[];
  reviewDueSoon: Policy[];
  awaitingMyAcknowledgement: Policy[];
  lowestCoverage: { policyId: string; title: string; rate: number; acknowledged: number }[];
}
