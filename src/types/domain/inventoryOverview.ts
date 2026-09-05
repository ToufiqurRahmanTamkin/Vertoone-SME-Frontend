import type { ProductRef } from "./product";
import type { WarehouseRef } from "./warehouse";

export interface InventoryStockKpis {
  trackedProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  reservedQuantity: number;
  stockValue: number;
  retailValue: number;
  warehouseCount: number;
  warehouseLimit: number | null;
}

export interface InventoryMovementKpis {
  movementsThisMonth: number;
  inboundUnits: number;
  outboundUnits: number;
  openTransfers: number;
  draftAdjustments: number;
  openCounts: number;
  countLimit: number | null;
}

export interface InventoryTrackingKpis {
  batches: number;
  batchLimit: number | null;
  expiringBatches: number;
  expiredBatches: number;
  expiringValue: number;
  serials: number;
  serialLimit: number | null;
  serialsInStock: number;
  bins: number;
  binLimit: number | null;
  reorderRules: number;
  reorderLimit: number | null;
  belowMinimumCount: number;
  suggestedUnits: number;
}

export interface WarehouseValuePoint {
  _id: string;
  name: string;
  code: string;
  quantity: number;
  stockValue: number;
  sharePercent: number;
}

export interface LowStockRow {
  productId: string;
  product: ProductRef | null;
  quantity: number;
  lowStockAlert: number;
  stockValue: number;
  status: string;
}

export interface ExpiringBatchRow {
  _id: string;
  batchNumber: string;
  product: ProductRef | null;
  warehouse: WarehouseRef | null;
  quantity: number;
  expiresAt: string | null;
  daysToExpiry: number | null;
  status: string;
}

export interface InventoryOverview {
  stock: InventoryStockKpis;
  movement: InventoryMovementKpis;
  tracking: InventoryTrackingKpis;
  warehouses: WarehouseValuePoint[];
  lowStock: LowStockRow[];
  expiringBatches: ExpiringBatchRow[];
  currency: string;
}
