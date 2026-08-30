import type { ProductRef } from "./product";
import type { TagRef } from "./tag";
import type { StockDirection, TradeListQuery } from "./trade";
import type { WarehouseRef } from "./warehouse";

export const STOCK_ADJUSTMENT_STATUSES = ["DRAFT", "APPROVED", "CANCELLED"] as const;

export type StockAdjustmentStatus = (typeof STOCK_ADJUSTMENT_STATUSES)[number];

export const STOCK_ADJUSTMENT_STATUS_LABELS: Record<StockAdjustmentStatus, string> = {
  DRAFT: "Draft",
  APPROVED: "Approved",
  CANCELLED: "Cancelled",
};

export const STOCK_ADJUSTMENT_STATUS_COLORS: Record<StockAdjustmentStatus, string> = {
  DRAFT: "zinc",
  APPROVED: "green",
  CANCELLED: "red",
};

export const STOCK_ADJUSTMENT_REASONS = [
  "STOCK_COUNT",
  "DAMAGE",
  "LOSS",
  "THEFT",
  "EXPIRY",
  "CORRECTION",
  "SAMPLE",
  "OTHER",
] as const;

export type StockAdjustmentReason = (typeof STOCK_ADJUSTMENT_REASONS)[number];

export const STOCK_ADJUSTMENT_REASON_LABELS: Record<StockAdjustmentReason, string> = {
  STOCK_COUNT: "Stock count",
  DAMAGE: "Damage",
  LOSS: "Loss",
  THEFT: "Theft",
  EXPIRY: "Expiry",
  CORRECTION: "Correction",
  SAMPLE: "Sample or giveaway",
  OTHER: "Other",
};

export interface StockAdjustmentItem {
  _id: string;
  productId: string;
  product: ProductRef | null;
  name: string;
  sku: string;
  direction: StockDirection;
  quantity: number;
  unitCost: number;
  countedBefore: number;
  note: string;
}

export interface StockAdjustment {
  _id: string;
  adjustmentNumber: string;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  adjustmentDate: string;
  reason: StockAdjustmentReason;
  status: StockAdjustmentStatus;
  items: StockAdjustmentItem[];
  increaseQuantity: number;
  decreaseQuantity: number;
  valueImpact: number;
  reference: string;
  notes: string;
  tags: TagRef[];
  tagIds: string[];
  approvedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustmentListQuery extends TradeListQuery {
  status?: StockAdjustmentStatus;
  reason?: StockAdjustmentReason;
  warehouseId?: string;
}

export interface StockAdjustmentSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  approvedCount: number;
  increaseQuantity: number;
  decreaseQuantity: number;
  valueImpact: number;
}

export interface StockAdjustmentItemPayload {
  productId: string;
  direction: StockDirection;
  quantity: number;
  unitCost?: number;
  note?: string;
}

export interface StockAdjustmentPayload {
  warehouseId: string;
  adjustmentDate?: string;
  reason?: StockAdjustmentReason;
  items: StockAdjustmentItemPayload[];
  reference?: string;
  notes?: string;
  tagIds?: string[];
}
