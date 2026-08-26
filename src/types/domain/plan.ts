import type { ModulePermissionMap } from "./permission";

export const BILLING_CYCLES = ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

/** null means "unlimited" — the backend stores it that way. */
export interface PlanLimits {
  users: number | null;
}

export const SUPPORTED_CURRENCIES = [
  "BDT",
  "USD",
  "EUR",
  "GBP",
  "INR",
  "AUD",
  "CAD",
  "SGD",
  "AED",
  "SAR",
  "MYR",
  "JPY",
] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: SupportedCurrency = "BDT";

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features: string[];
  limits: PlanLimits;
  /** Menus this plan unlocks, with the actions and record cap for each. */
  modulePermissions: ModulePermissionMap;
  trialDays: number;
  isActive: boolean;
  autoRenewEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  billingCycle?: BillingCycle;
  isActive?: boolean;
  autoRenewEnabled?: boolean;
}

export interface PlanPayload {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  billingCycle: BillingCycle;
  features?: string[];
  limits?: Partial<PlanLimits>;
  modulePermissions?: ModulePermissionMap;
  trialDays?: number;
  isActive?: boolean;
  autoRenewEnabled?: boolean;
}
