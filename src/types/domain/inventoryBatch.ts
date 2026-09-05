import type { StatusColor } from "@/components/shared/status-badge";
import type { ProductRef } from "./product";
import type { SupplierRef } from "./supplier";
import type { WarehouseRef } from "./warehouse";

export const BATCH_STATUSES = ["ACTIVE", "EXPIRING", "EXPIRED", "DEPLETED"] as const;

export type BatchStatus = (typeof BATCH_STATUSES)[number];

export const BATCH_STATUS_LABELS: Record<BatchStatus, string> = {
  ACTIVE: "Good",
  EXPIRING: "Expiring soon",
  EXPIRED: "Expired",
  DEPLETED: "Used up",
};

export const BATCH_STATUS_COLORS: Record<BatchStatus, StatusColor> = {
  ACTIVE: "green",
  EXPIRING: "amber",
  EXPIRED: "red",
  DEPLETED: "zinc",
};

export interface InventoryBatch {
  _id: string;
  productId: string;
  product: ProductRef | null;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  supplierId: string | null;
  supplier: SupplierRef | null;
  batchNumber: string;
  lotNumber: string;
  quantity: number;
  initialQuantity: number;
  consumedQuantity: number;
  unitCost: number;
  stockValue: number;
  manufacturedAt: string | null;
  expiresAt: string | null;
  daysToExpiry: number | null;
  status: BatchStatus;
  note: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryBatchListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  productId?: string;
  warehouseId?: string;
  supplierId?: string;
  status?: BatchStatus;
  isActive?: boolean;
}

export interface InventoryBatchSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  expiringCount: number;
  expiredCount: number;
  depletedCount: number;
  trackedQuantity: number;
  stockValue: number;
  expiringValue: number;
}

export interface InventoryBatchPayload {
  productId: string;
  warehouseId: string;
  supplierId?: string | null;
  batchNumber: string;
  lotNumber?: string;
  quantity: number;
  unitCost?: number;
  manufacturedAt?: string | null;
  expiresAt?: string | null;
  note?: string;
  isActive?: boolean;
}
