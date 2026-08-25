import type { GrantedModule } from "./appModule";
import type { BillingCycle } from "./plan";

export const SUBSCRIPTION_STATUSES = [
  "PENDING",
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
  "SUSPENDED",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED", "FAILED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["CASH", "CARD", "BKASH", "NAGAD"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CASH_PAYMENT_METHOD: PaymentMethod = "CASH";

export const requiresTransactionId = (method: PaymentMethod): boolean =>
  method !== CASH_PAYMENT_METHOD;

export const PAYMENT_REVIEW_ACTIONS = ["APPROVED", "REJECTED", "REFUNDED"] as const;
export type PaymentReviewAction = (typeof PAYMENT_REVIEW_ACTIONS)[number];

/**
 * List/detail responses populate `planId`; the create response returns the raw
 * id. Callers should read `planName`, which is denormalised on the record and
 * always present.
 */
export type SoldSubscriptionPlanRef =
  | string
  | {
      _id: string;
      name: string;
      price: number;
      currency: string;
      billingCycle: BillingCycle;
      features?: string[];
    };

export interface SoldSubscription {
  _id: string;
  invoiceNumber: string;
  planId: SoldSubscriptionPlanRef;
  planName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName: string;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  notes: string;
  paymentReviewAction: PaymentReviewAction | null;
  paymentReviewedBy: string | null;
  paymentReviewedAt: string | null;
  paymentReviewNote: string;
  grantedModules: GrantedModule[];
  createdAt: string;
  updatedAt: string;
}

export interface SoldSubscriptionSummary {
  totalSold: number;
  activeCount: number;
  expiredCount: number;
  pendingCount: number;
  totalRevenue: number;
  awaitingApprovalCount: number;
}

export interface SoldSubscriptionListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: SubscriptionStatus;
  paymentStatus?: PaymentStatus;
  planId?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface SoldSubscriptionCreatePayload {
  planId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  amount?: number;
  currency?: string;
  status?: SubscriptionStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
  notes?: string;
}

/**
 * The server strips `planId`, `planName` and `invoiceNumber` from an update, so
 * they are omitted here rather than being silently dropped.
 */
export type SoldSubscriptionUpdatePayload = Omit<SoldSubscriptionCreatePayload, "planId">;

export interface PaymentReviewPayload {
  note?: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
}

export const planRefId = (planId: SoldSubscriptionPlanRef): string =>
  typeof planId === "string" ? planId : planId._id;
