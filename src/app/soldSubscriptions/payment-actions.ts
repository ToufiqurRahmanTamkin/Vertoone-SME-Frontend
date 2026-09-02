import type {
  PaymentStatus,
  SoldSubscription,
  SubscriptionStatus,
} from "@/types/domain/soldSubscription";

const REVIEWABLE_PAYMENT_STATUSES: PaymentStatus[] = ["UNPAID", "PENDING", "FAILED"];

export const canApprovePayment = (record: SoldSubscription): boolean =>
  REVIEWABLE_PAYMENT_STATUSES.includes(record.paymentStatus);

export const canRejectPayment = (record: SoldSubscription): boolean =>
  REVIEWABLE_PAYMENT_STATUSES.includes(record.paymentStatus);

export const canRefundPayment = (record: SoldSubscription): boolean =>
  record.paymentStatus === "PAID";

const RUNNING_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ["TRIALING", "ACTIVE"];

export const canSuspendSubscription = (record: SoldSubscription): boolean =>
  RUNNING_SUBSCRIPTION_STATUSES.includes(record.status);
