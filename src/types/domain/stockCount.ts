import type { StatusColor } from "@/components/shared/status-badge";
import type { ProductCategoryRef } from "./productCategory";
import type { ProductRef } from "./product";
import type { WarehouseRef } from "./warehouse";

export const STOCK_COUNT_STATUSES = [
  "DRAFT",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

export type StockCountStatus = (typeof STOCK_COUNT_STATUSES)[number];

export const STOCK_COUNT_STATUS_LABELS: Record<StockCountStatus, string> = {
  DRAFT: "Draft",
  IN_PROGRESS: "Counting",
  COMPLETED: "Closed",
  CANCELLED: "Cancelled",
};

export const STOCK_COUNT_STATUS_COLORS: Record<StockCountStatus, StatusColor> = {
  DRAFT: "zinc",
  IN_PROGRESS: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
};

export const STOCK_COUNT_SCOPES = ["FULL", "CATEGORY", "SELECTED"] as const;

export type StockCountScope = (typeof STOCK_COUNT_SCOPES)[number];

export const STOCK_COUNT_SCOPE_LABELS: Record<StockCountScope, string> = {
  FULL: "Everything in the warehouse",
  CATEGORY: "One category",
  SELECTED: "Chosen products",
};

export interface StockCountItem {
  _id: string;
  productId: string;
  product: ProductRef | null;
  name: string;
  sku: string;
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
  unitCost: number;
  varianceValue: number;
  note: string;
}

export interface StockCount {
  _id: string;
  countNumber: string;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  categoryId: string | null;
  category: ProductCategoryRef | null;
  scope: StockCountScope;
  countDate: string;
  status: StockCountStatus;
  items: StockCountItem[];
  itemCount: number;
  countedItems: number;
  varianceItems: number;
  gainUnits: number;
  lossUnits: number;
  varianceValue: number;
  accuracyPercent: number;
  reference: string;
  notes: string;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockCountListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  warehouseId?: string;
  status?: StockCountStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface StockCountSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  inProgressCount: number;
  completedCount: number;
  gainUnits: number;
  lossUnits: number;
  varianceValue: number;
}

export interface StockCountItemPayload {
  productId: string;
  countedQuantity: number;
  note?: string;
}

export interface StockCountPayload {
  warehouseId: string;
  categoryId?: string | null;
  scope?: StockCountScope;
  countDate?: string;
  reference?: string;
  notes?: string;
  items?: StockCountItemPayload[];
}
