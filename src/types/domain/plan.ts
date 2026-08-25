export const BILLING_CYCLES = ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

/** null means "unlimited" — the backend stores it that way. */
export interface PlanLimits {
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

export interface PlanListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  billingCycle?: BillingCycle;
  isActive?: boolean;
}

export interface PlanPayload {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  billingCycle: BillingCycle;
  features?: string[];
  limits?: Partial<PlanLimits>;
  trialDays?: number;
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
}
