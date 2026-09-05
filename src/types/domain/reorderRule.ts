import type { StatusColor } from "@/components/shared/status-badge";
import type { ProductRef } from "./product";
import type { SupplierRef } from "./supplier";
import type { WarehouseRef } from "./warehouse";

export const REORDER_STATUSES = [
  "HEALTHY",
  "AT_MINIMUM",
  "BELOW_MINIMUM",
  "OUT_OF_STOCK",
] as const;

export type ReorderStatus = (typeof REORDER_STATUSES)[number];

export const REORDER_STATUS_LABELS: Record<ReorderStatus, string> = {
  HEALTHY: "Comfortable",
  AT_MINIMUM: "At minimum",
  BELOW_MINIMUM: "Below minimum",
  OUT_OF_STOCK: "Out of stock",
};

export const REORDER_STATUS_COLORS: Record<ReorderStatus, StatusColor> = {
  HEALTHY: "green",
  AT_MINIMUM: "amber",
  BELOW_MINIMUM: "orange",
  OUT_OF_STOCK: "red",
};

export const REORDER_STRATEGIES = ["FIXED_QUANTITY", "TOP_UP_TO_MAXIMUM"] as const;

export type ReorderStrategy = (typeof REORDER_STRATEGIES)[number];

export const REORDER_STRATEGY_LABELS: Record<ReorderStrategy, string> = {
  FIXED_QUANTITY: "Order a fixed quantity",
  TOP_UP_TO_MAXIMUM: "Top up to the maximum",
};

export interface ReorderRule {
  _id: string;
  productId: string;
  product: ProductRef | null;
  warehouseId: string | null;
  warehouse: WarehouseRef | null;
  name: string;
  sku: string;
  minimumQuantity: number;
  reorderQuantity: number;
  maximumQuantity: number;
  strategy: ReorderStrategy;
  preferredSupplierId: string | null;
  preferredSupplier: SupplierRef | null;
  leadTimeDays: number;
  note: string;
  isActive: boolean;
  onHand: number;
  shortfall: number;
  suggestedQuantity: number;
  status: ReorderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReorderRuleListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  productId?: string;
  warehouseId?: string;
  supplierId?: string;
  status?: ReorderStatus;
  isActive?: boolean;
}

export interface ReorderRuleSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  belowMinimumCount: number;
  outOfStockCount: number;
  suggestedUnits: number;
  averageLeadTimeDays: number;
}

export interface ReorderRulePayload {
  productId: string;
  warehouseId?: string | null;
  minimumQuantity: number;
  reorderQuantity?: number;
  maximumQuantity?: number;
  strategy?: ReorderStrategy;
  preferredSupplierId?: string | null;
  leadTimeDays?: number;
  note?: string;
  isActive?: boolean;
}
