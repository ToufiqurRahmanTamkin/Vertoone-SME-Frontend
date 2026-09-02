import type { BillingCycle } from "./plan";

export const SUBSCRIPTION_STATUSES = [
  "PENDING",
  "TRIALING",
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
  "SUSPENDED",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const PAYMENT_STATUSES = ["UNPAID", "PENDING", "PAID", "REFUNDED", "FAILED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ["CASH", "CARD", "BKASH", "NAGAD"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CASH_PAYMENT_METHOD: PaymentMethod = "CASH";

export const requiresTransactionId = (method: PaymentMethod): boolean =>
  method !== CASH_PAYMENT_METHOD;

export const BILLING_ORIGINS = ["MANUAL", "AUTO_RENEWAL", "SELF_SERVICE", "UPGRADE"] as const;
export type BillingOrigin = (typeof BILLING_ORIGINS)[number];

export const PAYMENT_REVIEW_ACTIONS = ["APPROVED", "REJECTED", "REFUNDED"] as const;
export type PaymentReviewAction = (typeof PAYMENT_REVIEW_ACTIONS)[number];

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
  companyId: string | null;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId: string;
  startDate: string;
  endDate: string;
  trialDays: number;
  trialEndsAt: string | null;
  billedAt: string | null;
  autoRenew: boolean;
  notes: string;
  paymentReviewAction: PaymentReviewAction | null;
  paymentReviewedBy: string | null;
  paymentReviewedAt: string | null;
  paymentReviewNote: string;
  billingOrigin: BillingOrigin;
  renewedFromId: string | null;
  renewalCycle: number;
  renewedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string;
  suspendedAt: string | null;
  refundAmount: number;
  systemChargeAmount: number;
  refundedAt: string | null;
  upgradedFromId: string | null;
  upgradedToId: string | null;
  supersededAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RefundBreakdown {
  totalDays: number;
  usedDays: number;
  unusedDays: number;
  paidAmount: number;
  unusedAmount: number;
  systemChargeAmount: number;
  refundAmount: number;
  currency: string;
}

export interface SoldSubscriptionSummary {
  totalSold: number;
  activeCount: number;
  expiredCount: number;
  pendingCount: number;
  totalRevenue: number;
  awaitingApprovalCount: number;
  autoRenewedCount: number;
  trialingCount: number;
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
  companyId?: string;
  billingOrigin?: BillingOrigin;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface SoldSubscriptionCreatePayload {
  companyId: string;
  planId: string;
  startDate: string;
  autoRenew?: boolean;
}

export interface SoldSubscriptionUpdatePayload {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  companyName?: string;
  status?: SubscriptionStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
  notes?: string;
}

export interface PaymentReviewPayload {
  note?: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
}

export interface SuspendSubscriptionPayload {
  note: string;
}

export const planRefId = (planId: SoldSubscriptionPlanRef): string =>
  typeof planId === "string" ? planId : planId._id;
