import type { StatusColor } from "@/components/shared/status-badge";
import type { BillingCycle } from "@/types/domain/plan";
import type { FinanceCategoryType, IncomeSourceType } from "@/types/domain/finance";
import type { GuideAudience, GuideCategory } from "@/types/domain/guide";
import type { InvoiceOrigin, InvoiceStatus, InvoiceType } from "@/types/domain/invoice";
import type {
  LoginDeviceType,
  LoginFailureReason,
  LoginStatus,
} from "@/types/domain/loginHistory";
import type { NotificationLevel, NotificationType } from "@/types/domain/notification";
import type { CompanyStatus, EmployeeRange } from "@/types/domain/company";
import type { Role, UserStatus } from "@/types/domain/auth";
import type {
  BillingOrigin,
  PaymentMethod,
  PaymentReviewAction,
  PaymentStatus,
  SubscriptionStatus,
} from "@/types/domain/soldSubscription";
import type { EmailStatus, EmailTemplateKey } from "@/types/domain/email";
import type {
  ActivityAction,
  ActivityCategory,
  ActivityEntityType,
  ActivitySeverity,
} from "@/types/domain/activity";
import type { WipeScope } from "@/types/domain/dataWipe";
import type {
  BloodGroup,
  EmployeeStatus,
  EmploymentType,
  Gender,
  MaritalStatus,
} from "@/types/domain/employee";
import type { TagScope } from "@/types/domain/tag";

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  HALF_YEARLY: "Half yearly",
  YEARLY: "Yearly",
};

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
  PENDING: "Awaiting approval",
  PAID: "Paid",
  REFUNDED: "Refunded",
  FAILED: "Failed",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, StatusColor> = {
  UNPAID: "zinc",
  PENDING: "amber",
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
  SELF_SERVICE: "Self sign-up",
};

export const BILLING_ORIGIN_COLORS: Record<BillingOrigin, StatusColor> = {
  MANUAL: "zinc",
  AUTO_RENEWAL: "violet",
  SELF_SERVICE: "blue",
};

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  PENDING: "Pending approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SUSPENDED: "Suspended",
};

export const COMPANY_STATUS_COLORS: Record<CompanyStatus, StatusColor> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
  SUSPENDED: "orange",
};

export const EMPLOYEE_RANGE_LABELS: Record<EmployeeRange, string> = {
  "1-50": "1 – 50 employees",
  "51-100": "51 – 100 employees",
  "101-200": "101 – 200 employees",
  "201-300": "201 – 300 employees",
  "301-500": "301 – 500 employees",
  "501-1000": "501 – 1000 employees",
  "1000+": "1000+ employees",
};

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super admin",
  COMPANY_OWNER: "Company owner",
  COMPANY_USER: "Team member",
  CONCERN_HEAD: "Concern head",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  PENDING_APPROVAL: "Pending approval",
  REJECTED: "Rejected",
};

export const USER_STATUS_COLORS: Record<UserStatus, StatusColor> = {
  ACTIVE: "green",
  INACTIVE: "zinc",
  PENDING_APPROVAL: "amber",
  REJECTED: "red",
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

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  INCOME: "Receivable",
  EXPENSE: "Payable",
};

export const INVOICE_TYPE_COLORS: Record<InvoiceType, StatusColor> = {
  INCOME: "green",
  EXPENSE: "orange",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, StatusColor> = {
  DRAFT: "zinc",
  ISSUED: "amber",
  PAID: "green",
  CANCELLED: "red",
};

export const INVOICE_ORIGIN_LABELS: Record<InvoiceOrigin, string> = {
  AUTO: "Auto raised",
  MANUAL: "Manual",
};

export const INVOICE_ORIGIN_COLORS: Record<InvoiceOrigin, StatusColor> = {
  AUTO: "violet",
  MANUAL: "zinc",
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

export const toOptions = <T extends string>(labels: Record<T, string>) =>
  (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  SUBSCRIPTION_SOLD: "Subscription sold",
  COMPANY_REGISTERED: "Company registered",
  COMPANY_APPROVED: "Company approved",
  COMPANY_REJECTED: "Company rejected",
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
  ACCOUNT_PENDING_APPROVAL: "Awaiting approval",
  ACCOUNT_REJECTED: "Registration rejected",
  UNKNOWN_ACCOUNT: "Unknown email",
};

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  SUBSCRIPTION_RENEWED: "Subscription renewed",
  REGISTRATION_RECEIVED: "Registration received",
  REGISTRATION_SUBMITTED_ADMIN: "Registration submitted (admin)",
  REGISTRATION_APPROVED: "Registration approved",
  REGISTRATION_REJECTED: "Registration rejected",
  PASSWORD_RESET_OTP: "Password reset code",
  PASSWORD_RESET_SUCCESS: "Password reset confirmed",
  PASSWORD_RESET_BY_ADMIN: "Password reset by admin",
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

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  COMPANY: "Company",
  SUBSCRIPTION: "Subscription",
  BILLING: "Billing",
  FINANCE: "Finance",
  CATALOG: "Catalog",
  CONTENT: "Content",
  SECURITY: "Security",
  SYSTEM: "System",
};

export const ACTIVITY_CATEGORY_COLORS: Record<ActivityCategory, StatusColor> = {
  COMPANY: "blue",
  SUBSCRIPTION: "violet",
  BILLING: "green",
  FINANCE: "orange",
  CATALOG: "blue",
  CONTENT: "zinc",
  SECURITY: "amber",
  SYSTEM: "zinc",
};

export const ACTIVITY_SEVERITY_LABELS: Record<ActivitySeverity, string> = {
  INFO: "Info",
  SUCCESS: "Success",
  WARNING: "Warning",
  CRITICAL: "Critical",
};

export const ACTIVITY_SEVERITY_COLORS: Record<ActivitySeverity, StatusColor> = {
  INFO: "muted",
  SUCCESS: "green",
  WARNING: "amber",
  CRITICAL: "red",
};

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  COMPANY_REGISTERED: "Company registered",
  COMPANY_APPROVED: "Company approved",
  COMPANY_REJECTED: "Company rejected",
  COMPANY_SUSPENDED: "Company suspended",
  COMPANY_REACTIVATED: "Company reactivated",
  COMPANY_DELETED: "Company deleted",
  SUBSCRIPTION_CREATED: "Subscription sold",
  SUBSCRIPTION_UPDATED: "Subscription updated",
  SUBSCRIPTION_DELETED: "Subscription deleted",
  SUBSCRIPTION_RENEWED: "Subscription renewed",
  SUBSCRIPTION_EXPIRED: "Subscription expired",
  PAYMENT_APPROVED: "Payment approved",
  PAYMENT_REJECTED: "Payment rejected",
  PAYMENT_REFUNDED: "Payment refunded",
  PLAN_CREATED: "Plan created",
  PLAN_UPDATED: "Plan updated",
  PLAN_DELETED: "Plan deleted",
  INCOME_CREATED: "Income recorded",
  INCOME_UPDATED: "Income updated",
  INCOME_DELETED: "Income deleted",
  EXPENSE_CREATED: "Expense recorded",
  EXPENSE_UPDATED: "Expense updated",
  EXPENSE_DELETED: "Expense deleted",
  INVOICE_CREATED: "Invoice raised",
  INVOICE_UPDATED: "Invoice updated",
  INVOICE_DELETED: "Invoice deleted",
  CATEGORY_CREATED: "Category created",
  CATEGORY_UPDATED: "Category updated",
  CATEGORY_DELETED: "Category deleted",
  GUIDE_CREATED: "Guide created",
  GUIDE_UPDATED: "Guide updated",
  GUIDE_DELETED: "Guide deleted",
  USER_LOGGED_IN: "Signed in",
  USER_LOGIN_FAILED: "Sign-in failed",
  USER_PROFILE_UPDATED: "Profile updated",
  USER_PASSWORD_CHANGED: "Password changed",
  USER_PASSWORD_RESET: "Password reset",
  USER_PASSWORD_RESET_BY_ADMIN: "Password reset by admin",
  EMAIL_RESENT: "Email resent",
  SYSTEM_CONFIG_UPDATED: "System config updated",
  DATA_WIPE_EXECUTED: "Data wipe executed",
  CONCERN_CREATED: "Concern created",
  CONCERN_UPDATED: "Concern updated",
  CONCERN_DELETED: "Concern removed",
  CONCERN_HEAD_CREATED: "Concern head created",
  CONCERN_HEAD_UPDATED: "Concern head updated",
};

export const ACTIVITY_ENTITY_TYPE_LABELS: Record<ActivityEntityType, string> = {
  COMPANY: "Company",
  SOLD_SUBSCRIPTION: "Sold subscription",
  SUBSCRIPTION_PLAN: "Subscription plan",
  INCOME: "Income",
  EXPENSE: "Expense",
  INVOICE: "Invoice",
  FINANCE_CATEGORY: "Finance category",
  USER_GUIDE: "User guide",
  USER: "User",
  CONCERN: "Concern",
  EMAIL: "Email",
  SYSTEM_CONFIG: "System config",
  SYSTEM: "System",
};

export const WIPE_SCOPE_LABELS: Record<WipeScope, string> = {
  SOFT_DELETED: "Purge deleted records",
  OPERATIONAL: "Wipe operational data",
  FACTORY_RESET: "Factory reset",
};

export const WIPE_SCOPE_DESCRIPTIONS: Record<WipeScope, string> = {
  SOFT_DELETED:
    "Permanently removes only the records already deleted from the UI. Live data is untouched.",
  OPERATIONAL:
    "Permanently removes companies, users, invoices, ledgers, emails and logs. The plan catalog, finance categories, guides and settings stay.",
  FACTORY_RESET:
    "Permanently removes everything above plus the plan catalog, finance categories, guides and system settings. Only super admin logins survive.",
};

export const WIPE_SCOPE_COLORS: Record<WipeScope, StatusColor> = {
  SOFT_DELETED: "amber",
  OPERATIONAL: "orange",
  FACTORY_RESET: "red",
};


export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: "Active",
  PROBATION: "On probation",
  ON_LEAVE: "On leave",
  SUSPENDED: "Suspended",
  RESIGNED: "Resigned",
  TERMINATED: "Terminated",
};

export const EMPLOYEE_STATUS_COLORS: Record<EmployeeStatus, StatusColor> = {
  ACTIVE: "green",
  PROBATION: "amber",
  ON_LEAVE: "blue",
  SUSPENDED: "orange",
  RESIGNED: "zinc",
  TERMINATED: "red",
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: "Full time",
  PART_TIME: "Part time",
  CONTRACT: "Contract",
  INTERN: "Intern",
  TEMPORARY: "Temporary",
  CONSULTANT: "Consultant",
};

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  SINGLE: "Single",
  MARRIED: "Married",
  DIVORCED: "Divorced",
  WIDOWED: "Widowed",
};

export const BLOOD_GROUP_LABELS: Record<BloodGroup, string> = {
  "A+": "A+",
  "A-": "A-",
  "B+": "B+",
  "B-": "B-",
  "AB+": "AB+",
  "AB-": "AB-",
  "O+": "O+",
  "O-": "O-",
};

export const TAG_SCOPE_LABELS: Record<TagScope, string> = {
  EMPLOYEE: "Employees",
  TEAM: "Teams",
  LEAD: "Leads",
  CONTACT: "Contacts",
  ACCOUNT: "Accounts",
  DEAL: "Deals",
  TICKET: "Tickets",
  PRODUCT: "Products",
  SUPPLIER: "Suppliers",
  CUSTOMER: "Customers",
  INVOICE: "Invoices",
  TASK: "Tasks",
};
