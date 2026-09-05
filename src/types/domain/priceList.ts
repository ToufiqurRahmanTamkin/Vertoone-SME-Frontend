import type { StatusColor } from "@/components/shared/status-badge";
import type { ProductRef } from "./product";

export const PRICE_LIST_TYPES = ["SELLING", "PURCHASE"] as const;

export type PriceListType = (typeof PRICE_LIST_TYPES)[number];

export const PRICE_LIST_TYPE_LABELS: Record<PriceListType, string> = {
  SELLING: "Selling prices",
  PURCHASE: "Purchase prices",
};

export const PRICE_LIST_CHANNELS = ["ALL", "POS", "SHOP"] as const;

export type PriceListChannel = (typeof PRICE_LIST_CHANNELS)[number];

export const PRICE_LIST_CHANNEL_LABELS: Record<PriceListChannel, string> = {
  ALL: "Every channel",
  POS: "Point of Sale",
  SHOP: "Online shop",
};

export const PRICE_LIST_STATUSES = ["SCHEDULED", "ACTIVE", "EXPIRED", "INACTIVE"] as const;

export type PriceListStatus = (typeof PRICE_LIST_STATUSES)[number];

export const PRICE_LIST_STATUS_LABELS: Record<PriceListStatus, string> = {
  SCHEDULED: "Scheduled",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  INACTIVE: "Inactive",
};

export const PRICE_LIST_STATUS_COLORS: Record<PriceListStatus, StatusColor> = {
  SCHEDULED: "blue",
  ACTIVE: "green",
  EXPIRED: "red",
  INACTIVE: "zinc",
};

export interface PriceListRef {
  _id: string;
  name: string;
  code: string;
  type: PriceListType;
}

export interface PriceList extends PriceListRef {
  channel: PriceListChannel;
  currency: string;
  description: string;
  validFrom: string | null;
  validTo: string | null;
  priority: number;
  isDefault: boolean;
  isActive: boolean;
  status: PriceListStatus;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceListItem {
  _id: string;
  priceListId: string;
  priceList: PriceListRef | null;
  productId: string;
  product: ProductRef | null;
  name: string;
  sku: string;
  minQuantity: number;
  price: number;
  discountPercent: number;
  basePrice: number;
  difference: number;
  differencePercent: number;
  note: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceListListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  type?: PriceListType;
  channel?: PriceListChannel;
  status?: PriceListStatus;
  isActive?: boolean;
}

export interface PriceListItemListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  priceListId?: string;
  productId?: string;
  isActive?: boolean;
}

export interface PriceListSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  scheduledCount: number;
  expiredCount: number;
  itemCount: number;
  pricedProductCount: number;
}

export interface PriceListPayload {
  name: string;
  code?: string;
  type?: PriceListType;
  channel?: PriceListChannel;
  currency?: string;
  description?: string;
  validFrom?: string | null;
  validTo?: string | null;
  priority?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface PriceListItemPayload {
  priceListId: string;
  productId: string;
  minQuantity?: number;
  price: number;
  discountPercent?: number;
  note?: string;
  isActive?: boolean;
}
