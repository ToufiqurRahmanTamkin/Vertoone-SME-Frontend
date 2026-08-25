/** Pagination block the API returns alongside every list. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorItem {
  path: string;
  message: string;
}

/** The error shape RTK Query surfaces from a failed request. */
export interface ApiErrorResponse {
  status: number;
  data?: {
    success: false;
    message: string;
    errorMessages?: ApiErrorItem[];
  };
}

export type UserRole = "SUPER_ADMIN";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

/* ── System config ─────────────────────────────────────────────────────── */

export interface SystemConfig {
  _id: string;
  key: "GLOBAL";
  appName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  defaultTimezone: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowSignups: boolean;
  trialDays: number;
  createdAt: string;
  updatedAt: string;
}

export type SystemConfigUpdate = Partial<
  Omit<SystemConfig, "_id" | "key" | "createdAt" | "updatedAt">
>;

/* ── Subscription plans ────────────────────────────────────────────────── */

export const BILLING_CYCLES = ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export interface PlanLimits {
  /** `null` means unlimited. */
  users: number | null;
  branches: number | null;
  storageGb: number | null;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features: string[];
  limits: PlanLimits;
  trialDays: number;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionPlanPayload = Omit<
  SubscriptionPlan,
  "_id" | "createdAt" | "updatedAt"
>;

export interface PlanListQuery {
  page?: number;
  limit?: number;
  search?: string;
  billingCycle?: BillingCycle;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/* ── Sold subscriptions ────────────────────────────────────────────────── */

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

export const PAYMENT_METHODS = [
  "BKASH",
  "NAGAD",
  "BANK_TRANSFER",
  "CARD",
  "CASH",
  "OTHER",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** `planId` arrives populated on list/detail reads and as a raw id elsewhere. */
export type PopulatedPlan = Pick<
  SubscriptionPlan,
  "_id" | "name" | "price" | "currency" | "billingCycle"
>;

export interface SoldSubscription {
  _id: string;
  invoiceNumber: string;
  planId: string | PopulatedPlan;
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
  createdAt: string;
  updatedAt: string;
}

export interface SoldSubscriptionPayload {
  planId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  amount?: number;
  status?: SubscriptionStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
  notes?: string;
}

export interface SoldSubscriptionListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: SubscriptionStatus;
  paymentStatus?: PaymentStatus;
  planId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SoldSubscriptionSummary {
  totalSold: number;
  activeCount: number;
  expiredCount: number;
  pendingCount: number;
  totalRevenue: number;
}

/* ── User guides ───────────────────────────────────────────────────────── */

export const GUIDE_CATEGORIES = [
  "GETTING_STARTED",
  "ACCOUNT",
  "BILLING",
  "SUBSCRIPTIONS",
  "CONFIGURATION",
  "TROUBLESHOOTING",
  "FAQ",
] as const;
export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export const GUIDE_AUDIENCES = ["SUPER_ADMIN", "CUSTOMER", "EVERYONE"] as const;
export type GuideAudience = (typeof GUIDE_AUDIENCES)[number];

export interface UserGuide {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: GuideCategory;
  audience: GuideAudience;
  tags: string[];
  sortOrder: number;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserGuidePayload {
  title: string;
  summary?: string;
  content: string;
  category?: GuideCategory;
  audience?: GuideAudience;
  tags?: string[];
  sortOrder?: number;
  isPublished?: boolean;
}

export interface UserGuideListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: GuideCategory;
  audience?: GuideAudience;
  isPublished?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/* ── Dashboard ─────────────────────────────────────────────────────────── */

export interface DashboardStats {
  plans: { total: number; active: number };
  subscriptions: {
    total: number;
    active: number;
    pending: number;
    expired: number;
    cancelled: number;
    suspended: number;
    expiringSoon: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    outstanding: number;
    currency: string;
  };
  guides: { total: number; published: number };
}

export interface RevenuePoint {
  /** `YYYY-MM` */
  month: string;
  revenue: number;
  sales: number;
}

export interface PlanBreakdownEntry {
  planId: string;
  planName: string;
  sales: number;
  revenue: number;
}

export interface RecentSale {
  _id: string;
  invoiceNumber: string;
  planName: string;
  customerName: string;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  revenueTrend: RevenuePoint[];
  planBreakdown: PlanBreakdownEntry[];
  recentSales: RecentSale[];
}
