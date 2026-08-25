import type { StatusColor } from "@/components/shared/status-badge";
import type { BillingCycle } from "@/types/domain/plan";
import type { GuideAudience, GuideCategory } from "@/types/domain/guide";
import type {
  PaymentMethod,
  PaymentStatus,
  SubscriptionStatus,
} from "@/types/domain/soldSubscription";

// Single source of truth for how every backend enum is presented. Pages read
// labels and badge colours from here so the same value never renders two ways.

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  HALF_YEARLY: "Half yearly",
  YEARLY: "Yearly",
};

/** Months each cycle spans — mirrors BILLING_CYCLE_MONTHS on the backend. */
export const BILLING_CYCLE_MONTHS: Record<BillingCycle, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  HALF_YEARLY: 6,
  YEARLY: 12,
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  PENDING: "Pending",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
  SUSPENDED: "Suspended",
};

export const SUBSCRIPTION_STATUS_COLORS: Record<SubscriptionStatus, StatusColor> = {
  PENDING: "amber",
  ACTIVE: "green",
  EXPIRED: "zinc",
  CANCELLED: "red",
  SUSPENDED: "orange",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  REFUNDED: "Refunded",
  FAILED: "Failed",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, StatusColor> = {
  UNPAID: "amber",
  PAID: "green",
  REFUNDED: "violet",
  FAILED: "red",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BKASH: "bKash",
  NAGAD: "Nagad",
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
  CASH: "Cash",
  OTHER: "Other",
};

export const GUIDE_CATEGORY_LABELS: Record<GuideCategory, string> = {
  GETTING_STARTED: "Getting started",
  ACCOUNT: "Account",
  BILLING: "Billing",
  SUBSCRIPTIONS: "Subscriptions",
  CONFIGURATION: "Configuration",
  TROUBLESHOOTING: "Troubleshooting",
  FAQ: "FAQ",
};

export const GUIDE_AUDIENCE_LABELS: Record<GuideAudience, string> = {
  SUPER_ADMIN: "Super admin",
  CUSTOMER: "Customer",
  EVERYONE: "Everyone",
};

/** Builds `[{ label, value }]` options for a FormSelect / toolbar filter. */
export const toOptions = <T extends string>(labels: Record<T, string>) =>
  (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
