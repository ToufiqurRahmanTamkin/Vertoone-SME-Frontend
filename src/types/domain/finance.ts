import type { InvoiceStatus, LinkedInvoice } from "./invoice";
import type { PaymentMethod } from "./soldSubscription";

export const FINANCE_CATEGORY_TYPES = ["INCOME", "EXPENSE"] as const;
export type FinanceCategoryType = (typeof FINANCE_CATEGORY_TYPES)[number];

export const FINANCE_STATUSES = ["DRAFT", "UNPAID", "PAID", "CANCELLED", "CLOSED"] as const;
export type FinanceStatus = (typeof FINANCE_STATUSES)[number];

export const SUBSCRIPTION_REVENUE_CATEGORY = "Subscription Revenue";

export const INCOME_SOURCE_TYPES = ["MANUAL", "SOLD_SUBSCRIPTION", "SUBSCRIPTION_REFUND"] as const;
export type IncomeSourceType = (typeof INCOME_SOURCE_TYPES)[number];

export interface FinanceCategory {
  _id: string;
  name: string;
  type: FinanceCategoryType;
  description: string;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FinanceCategoryRef =
  | string
  | { _id: string; name: string; type: FinanceCategoryType };

export const categoryRefId = (ref: FinanceCategoryRef): string =>
  typeof ref === "string" ? ref : ref._id;

export const categoryRefName = (ref: FinanceCategoryRef, fallback = "—"): string =>
  typeof ref === "string" ? fallback : ref.name;

export interface Income {
  _id: string;
  title: string;
  categoryId: FinanceCategoryRef;
  amount: number;
  currency: string;
  date: string;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  receivedFrom: string;
  receivedFromUserId: string | null;
  reference: string;
  notes: string;
  sourceType: IncomeSourceType;
  sourceId: string | null;
  recordedBy: string | null;
  invoice?: LinkedInvoice | null;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  title: string;
  categoryId: FinanceCategoryRef;
  amount: number;
  currency: string;
  date: string;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  paidTo: string;
  paidToUserId: string | null;
  reference: string;
  notes: string;
  recordedBy: string | null;
  invoice?: LinkedInvoice | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSummary {
  totalCount: number;
  totalAmount: number;
  thisMonthAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}

export interface FinanceCategoryListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  type?: FinanceCategoryType;
  isActive?: boolean;
}

export interface FinanceCategoryPayload {
  name: string;
  type: FinanceCategoryType;
  description?: string;
  isActive?: boolean;
}

export interface IncomeListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  categoryId?: string;
  status?: FinanceStatus;
  paymentMethod?: PaymentMethod;
  sourceType?: IncomeSourceType;
  dateFrom?: string;
  dateTo?: string;
}

export interface IncomePayload {
  title: string;
  categoryId: string;
  amount: number;
  currency?: string;
  date?: string;
  status?: FinanceStatus;
  paymentMethod?: PaymentMethod;
  receivedFrom?: string;
  receivedFromUserId?: string | null;
  reference?: string;
  notes?: string;
  invoiceId?: string | null;
  raiseInvoice?: boolean;
}

export interface ExpenseListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  categoryId?: string;
  status?: FinanceStatus;
  paymentMethod?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
}

export interface ExpensePayload {
  title: string;
  categoryId: string;
  amount: number;
  currency?: string;
  date?: string;
  status?: FinanceStatus;
  paymentMethod?: PaymentMethod;
  paidTo?: string;
  paidToUserId?: string | null;
  reference?: string;
  notes?: string;
  invoiceId?: string | null;
  raiseInvoice?: boolean;
}
