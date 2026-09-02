import type { BillingCycle } from "./plan";

export const SUBSCRIPTION_REQUEST_TYPES = ["CANCELLATION", "UPGRADE"] as const;
export type SubscriptionRequestType = (typeof SUBSCRIPTION_REQUEST_TYPES)[number];

export const SUBSCRIPTION_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type SubscriptionRequestStatus = (typeof SUBSCRIPTION_REQUEST_STATUSES)[number];

export interface SubscriptionRequestPlanRef {
  _id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  trialDays?: number;
}

export interface SubscriptionRequestSubscriptionRef {
  _id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  startDate?: string;
  endDate?: string;
  trialEndsAt?: string | null;
}

export type RequestPlanRef = string | null | SubscriptionRequestPlanRef;

export type RequestSubscriptionRef = string | null | SubscriptionRequestSubscriptionRef;

export interface SubscriptionRequest {
  _id: string;
  type: SubscriptionRequestType;
  status: SubscriptionRequestStatus;
  companyId: string;
  companyName: string;
  subscriptionId: RequestSubscriptionRef;
  subscriptionInvoiceNumber: string;
  currentPlanId: RequestPlanRef;
  currentPlanName: string;
  targetPlanId: RequestPlanRef;
  targetPlanName: string;
  targetSubscriptionId: RequestSubscriptionRef;
  targetInvoiceNumber: string;
  amount: number;
  currency: string;
  reason: string;
  requestedBy: string | null;
  requestedByName: string;
  requestedByEmail: string;
  requestedAt: string;
  dataWipeRequired: boolean;
  dataWipedAt: string | null;
  dataWipedRecords: number;
  refundAmount: number;
  systemChargeAmount: number;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionRequestListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  type?: SubscriptionRequestType;
  status?: SubscriptionRequestStatus;
  companyId?: string;
}

export interface SubscriptionRequestSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  pendingCancellations: number;
  pendingUpgrades: number;
  refundedAmount: number;
}

export interface CancellationRequestPayload {
  reason: string;
}

export interface UpgradeRequestPayload {
  planId: string;
  reason?: string;
}

export interface SubscriptionRequestReviewPayload {
  note?: string;
}

export const subscriptionRefOf = (
  value: RequestSubscriptionRef
): SubscriptionRequestSubscriptionRef | null =>
  value && typeof value === "object" ? value : null;

export const requestPlanRefOf = (
  value: RequestPlanRef
): SubscriptionRequestPlanRef | null => (value && typeof value === "object" ? value : null);
