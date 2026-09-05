import type { StatusColor } from "@/components/shared/status-badge";
import type { BrandRef } from "./brand";
import type { ProductCategoryRef } from "./productCategory";
import type { ProductRef } from "./product";

export const PROMOTION_TYPES = [
  "PERCENTAGE",
  "FIXED_AMOUNT",
  "BUY_X_GET_Y",
  "FREE_SHIPPING",
] as const;

export type PromotionType = (typeof PROMOTION_TYPES)[number];

export const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  PERCENTAGE: "Percentage off",
  FIXED_AMOUNT: "Fixed amount off",
  BUY_X_GET_Y: "Buy X get Y",
  FREE_SHIPPING: "Free shipping",
};

export const PROMOTION_SCOPES = ["ALL", "PRODUCTS", "CATEGORIES", "BRANDS"] as const;

export type PromotionScope = (typeof PROMOTION_SCOPES)[number];

export const PROMOTION_SCOPE_LABELS: Record<PromotionScope, string> = {
  ALL: "Whole catalogue",
  PRODUCTS: "Chosen products",
  CATEGORIES: "Chosen categories",
  BRANDS: "Chosen brands",
};

export const PROMOTION_STATUSES = [
  "INACTIVE",
  "SCHEDULED",
  "ACTIVE",
  "EXPIRED",
  "EXHAUSTED",
] as const;

export type PromotionStatus = (typeof PROMOTION_STATUSES)[number];

export const PROMOTION_STATUS_LABELS: Record<PromotionStatus, string> = {
  INACTIVE: "Paused",
  SCHEDULED: "Scheduled",
  ACTIVE: "Running",
  EXPIRED: "Ended",
  EXHAUSTED: "Fully used",
};

export const PROMOTION_STATUS_COLORS: Record<PromotionStatus, StatusColor> = {
  INACTIVE: "zinc",
  SCHEDULED: "blue",
  ACTIVE: "green",
  EXPIRED: "red",
  EXHAUSTED: "amber",
};

export interface PromotionChannels {
  pos: boolean;
  shop: boolean;
}

export interface Promotion {
  _id: string;
  name: string;
  couponCode: string;
  type: PromotionType;
  value: number;
  maxDiscountAmount: number;
  appliesTo: PromotionScope;
  productIds: string[];
  products: ProductRef[];
  categoryIds: string[];
  categories: ProductCategoryRef[];
  brandIds: string[];
  brands: BrandRef[];
  targetCount: number;
  minOrderAmount: number;
  minQuantity: number;
  buyQuantity: number;
  getQuantity: number;
  startsAt: string;
  endsAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  usagePercent: number;
  perCustomerLimit: number | null;
  channels: PromotionChannels;
  description: string;
  isActive: boolean;
  status: PromotionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  type?: PromotionType;
  appliesTo?: PromotionScope;
  status?: PromotionStatus;
  productId?: string;
  channel?: "pos" | "shop";
  isActive?: boolean;
}

export interface PromotionSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  scheduledCount: number;
  expiredCount: number;
  couponCount: number;
  redemptionCount: number;
}

export interface PromotionPayload {
  name: string;
  couponCode?: string;
  type?: PromotionType;
  value?: number;
  maxDiscountAmount?: number;
  appliesTo?: PromotionScope;
  productIds?: string[];
  categoryIds?: string[];
  brandIds?: string[];
  minOrderAmount?: number;
  minQuantity?: number;
  buyQuantity?: number;
  getQuantity?: number;
  startsAt?: string;
  endsAt?: string | null;
  usageLimit?: number | null;
  perCustomerLimit?: number | null;
  channels?: Partial<PromotionChannels>;
  description?: string;
  isActive?: boolean;
}
