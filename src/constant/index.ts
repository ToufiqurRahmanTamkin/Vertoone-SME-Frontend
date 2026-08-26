import type { StatusColor } from "@/components/shared/status-badge";
import type { BillingCycle } from "@/types/domain/plan";
import type { FinanceCategoryType, IncomeSourceType } from "@/types/domain/finance";
import type { GuideAudience, GuideCategory } from "@/types/domain/guide";
import type {
  LoginDeviceType,
  LoginFailureReason,
  LoginStatus,
} from "@/types/domain/loginHistory";
import type { NotificationLevel, NotificationType } from "@/types/domain/notification";
import type {
  BillingOrigin,
  PaymentMethod,
  PaymentReviewAction,
  PaymentStatus,
  SubscriptionStatus,
} from "@/types/domain/soldSubscription";
import type { EmailStatus, EmailTemplateKey } from "@/types/domain/email";

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
  CASH: "Cash",
  CARD: "Card",
  BKASH: "bKash",
  NAGAD: "Nagad",
};

export const PAYMENT_REVIEW_ACTION_LABELS: Record<PaymentReviewAction, string> = {
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REFUNDED: "Refunded",
};

export const PAYMENT_REVIEW_ACTION_COLORS: Record<PaymentReviewAction, StatusColor> = {
  APPROVED: "green",
  REJECTED: "red",
  REFUNDED: "violet",
};

export const BILLING_ORIGIN_LABELS: Record<BillingOrigin, string> = {
  MANUAL: "Manual",
  AUTO_RENEWAL: "Auto renewal",
};

export const BILLING_ORIGIN_COLORS: Record<BillingOrigin, StatusColor> = {
  MANUAL: "zinc",
  AUTO_RENEWAL: "violet",
};

export const FINANCE_CATEGORY_TYPE_LABELS: Record<FinanceCategoryType, string> = {
  INCOME: "Income",
  EXPENSE: "Expense",
};

export const FINANCE_CATEGORY_TYPE_COLORS: Record<FinanceCategoryType, StatusColor> = {
  INCOME: "green",
  EXPENSE: "orange",
};

export const INCOME_SOURCE_TYPE_LABELS: Record<IncomeSourceType, string> = {
  MANUAL: "Manual",
  SOLD_SUBSCRIPTION: "Subscription",
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

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  SUBSCRIPTION_SOLD: "Subscription sold",
  PAYMENT_APPROVED: "Payment approved",
  PAYMENT_REJECTED: "Payment rejected",
  PAYMENT_REFUNDED: "Payment refunded",
  SUBSCRIPTION_EXPIRING: "Expiring soon",
  FINANCE_ENTRY: "Finance",
  SECURITY_LOGIN: "Security",
  SYSTEM: "System",
};

export const NOTIFICATION_LEVEL_LABELS: Record<NotificationLevel, string> = {
  INFO: "Info",
  SUCCESS: "Success",
  WARNING: "Warning",
  ERROR: "Error",
};

export const NOTIFICATION_LEVEL_COLORS: Record<NotificationLevel, StatusColor> = {
  INFO: "blue",
  SUCCESS: "green",
  WARNING: "amber",
  ERROR: "red",
};

export const LOGIN_STATUS_LABELS: Record<LoginStatus, string> = {
  SUCCESS: "Successful",
  FAILED: "Failed",
};

export const LOGIN_STATUS_COLORS: Record<LoginStatus, StatusColor> = {
  SUCCESS: "green",
  FAILED: "red",
};

export const LOGIN_DEVICE_TYPE_LABELS: Record<LoginDeviceType, string> = {
  DESKTOP: "Desktop",
  MOBILE: "Mobile",
  TABLET: "Tablet",
  BOT: "Automated",
  UNKNOWN: "Unknown",
};

export const LOGIN_FAILURE_REASON_LABELS: Record<LoginFailureReason, string> = {
  INVALID_CREDENTIALS: "Wrong password",
  ACCOUNT_INACTIVE: "Account deactivated",
  UNKNOWN_ACCOUNT: "Unknown email",
};

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  SUBSCRIPTION_RENEWED: "Subscription renewed",
  RENEWAL_BILL_GENERATED: "Renewal bill generated",
  PAYMENT_APPROVED: "Payment approved",
  PAYMENT_REJECTED: "Payment rejected",
  PAYMENT_REFUNDED: "Payment refunded",
  SUBSCRIPTION_EXPIRING: "Subscription expiring",
  SUBSCRIPTION_EXPIRED: "Subscription expired",
};

export const EMAIL_STATUS_LABELS: Record<EmailStatus, string> = {
  SENT: "Sent",
  FAILED: "Failed",
  SKIPPED: "Skipped",
};

export const EMAIL_STATUS_COLORS: Record<EmailStatus, StatusColor> = {
  SENT: "green",
  FAILED: "red",
  SKIPPED: "amber",
};
