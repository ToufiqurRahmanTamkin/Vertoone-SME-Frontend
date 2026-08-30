import type { ProductCategoryRef } from "./productCategory";
import type { ProductRef } from "./product";
import type { StockDirection, StockReferenceType } from "./trade";
import type { WarehouseRef } from "./warehouse";

export const STOCK_STATUSES = ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] as const;

export type StockStatus = (typeof STOCK_STATUSES)[number];

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Running low",
  OUT_OF_STOCK: "Out of stock",
};

export const STOCK_STATUS_COLORS: Record<StockStatus, string> = {
  IN_STOCK: "green",
  LOW_STOCK: "amber",
  OUT_OF_STOCK: "red",
};

export interface StockRow {
  productId: string;
  product: ProductRef | null;
  category: ProductCategoryRef | null;
  barcode: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockAlert: number;
  averageCost: number;
  stockValue: number;
  sellingPrice: number;
  status: StockStatus;
  warehouseCount: number;
  lastMovementAt: string | null;
}

export interface StockBreakdownRow {
  warehouseId: string;
  warehouse: WarehouseRef | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  averageCost: number;
  stockValue: number;
  lastMovementAt: string | null;
}

export interface StockMovement {
  _id: string;
  productId: string;
  product: ProductRef | null;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  direction: StockDirection;
  quantity: number;
  unitCost: number;
  value: number;
  refType: StockReferenceType;
  refId: string | null;
  refNumber: string;
  note: string;
  isReversal: boolean;
  occurredAt: string;
  createdAt: string;
}

export interface StockListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  categoryId?: string;
  warehouseId?: string;
  status?: StockStatus;
}

export interface StockMovementListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  productId?: string;
  warehouseId?: string;
  direction?: StockDirection;
  refType?: StockReferenceType;
  dateFrom?: string;
  dateTo?: string;
}

export interface StockSummary {
  trackedProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  stockValue: number;
  warehouseCount: number;
  reservedQuantity: number;
}
