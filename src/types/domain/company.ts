import type { ModulePermissionMap } from "./permission";

import type { PaymentMethod } from "./soldSubscription";

export const EMPLOYEE_RANGES = [
  "1-50",
  "51-100",
  "101-200",
  "201-300",
  "301-500",
  "501-1000",
  "1000+",
] as const;
export type EmployeeRange = (typeof EMPLOYEE_RANGES)[number];

export const COMPANY_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export type CompanyPlanRef =
  | string
  | null
  | {
      _id: string;
      name: string;
      price: number;
      currency: string;
      billingCycle: string;
      features?: string[];
    };

export type CompanySubscriptionRef =
  | string
  | null
  | {
      _id: string;
      invoiceNumber: string;
      amount: number;
      currency: string;
      paymentStatus: string;
      status: string;
      startDate?: string;
      endDate?: string;
      paymentMethod?: string;
      transactionId?: string;
    };

export interface Company {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  employeeRange: EmployeeRange;
  status: CompanyStatus;
  ownerUserId: string | null;
  ownerName: string;
  ownerEmail: string;
  planId: CompanyPlanRef;
  planName: string;
  currentSubscriptionId: CompanySubscriptionRef;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string;
  accessBlockedAt: string | null;
  accessBlockReason: string;
  accessExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: CompanyStatus;
  employeeRange?: EmployeeRange;
  planId?: string;
}

export interface CompanySummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  registeredThisMonth: number;
}

export interface CompanyReviewPayload {
  note?: string;
}

export interface RegisterCompanyPayload {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  employeeRange: EmployeeRange;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminPassword: string;
  planId: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  autoRenew?: boolean;
}

export type CompanyIdentityPayload = Omit<
  RegisterCompanyPayload,
  "planId" | "paymentMethod" | "transactionId" | "autoRenew"
>;

export interface CreateCompanyByAdminPayload extends CompanyIdentityPayload {
  note?: string;
}

export interface CreateCompanyByAdminResult {
  companyId: string;
  companyName: string;
  companyStatus: CompanyStatus;
  adminEmail: string;
}

export interface RegisterCompanyResult {
  companyId: string;
  companyName: string;
  companyStatus: CompanyStatus;
  invoiceNumber: string;
  planName: string;
  amount: number;
  currency: string;
  adminEmail: string;
}

export interface AvailabilityQuery {
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  adminEmail?: string;
  adminPhone?: string;
}

export type AvailabilityResult = Record<keyof AvailabilityQuery, boolean | null>;

export interface CompanyInvoice {
  _id: string;
  invoiceNumber: string;
  planName: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionId: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
}

export interface CompanyWorkspace {
  company: Company;
  invoices: CompanyInvoice[];
  totalPaid: number;
  outstanding: number;
  modulePermissions: ModulePermissionMap;
}

export const companyPlanName = (company: Company): string => {
  if (company.planName) return company.planName;
  if (company.planId && typeof company.planId === "object") return company.planId.name;
  return "—";
};

export const companySubscription = (
  company: Company
): Exclude<CompanySubscriptionRef, string | null> | null =>
  company.currentSubscriptionId && typeof company.currentSubscriptionId === "object"
    ? company.currentSubscriptionId
    : null;
