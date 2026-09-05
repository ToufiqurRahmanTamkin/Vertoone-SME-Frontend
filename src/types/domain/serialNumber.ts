import type { StatusColor } from "@/components/shared/status-badge";
import type { ProductRef } from "./product";
import type { WarehouseRef } from "./warehouse";

export const SERIAL_STATUSES = [
  "IN_STOCK",
  "RESERVED",
  "SOLD",
  "RETURNED",
  "DAMAGED",
  "SCRAPPED",
] as const;

export type SerialStatus = (typeof SERIAL_STATUSES)[number];

export const SERIAL_STATUS_LABELS: Record<SerialStatus, string> = {
  IN_STOCK: "In stock",
  RESERVED: "Reserved",
  SOLD: "Sold",
  RETURNED: "Returned",
  DAMAGED: "Damaged",
  SCRAPPED: "Scrapped",
};

export const SERIAL_STATUS_COLORS: Record<SerialStatus, StatusColor> = {
  IN_STOCK: "green",
  RESERVED: "blue",
  SOLD: "violet",
  RETURNED: "amber",
  DAMAGED: "orange",
  SCRAPPED: "red",
};

export interface BatchRef {
  _id: string;
  batchNumber: string;
}

export interface SerialNumber {
  _id: string;
  productId: string;
  product: ProductRef | null;
  warehouseId: string | null;
  warehouse: WarehouseRef | null;
  batchId: string | null;
  batch: BatchRef | null;
  serialNumber: string;
  status: SerialStatus;
  purchaseReference: string;
  salesReference: string;
  receivedAt: string | null;
  soldAt: string | null;
  warrantyExpiresAt: string | null;
  warrantyDaysLeft: number | null;
  isUnderWarranty: boolean;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerialNumberListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  productId?: string;
  warehouseId?: string;
  batchId?: string;
  status?: SerialStatus;
}

export interface SerialNumberSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  inStockCount: number;
  soldCount: number;
  reservedCount: number;
  damagedCount: number;
  underWarrantyCount: number;
  trackedProductCount: number;
}

export interface SerialNumberCreatePayload {
  productId: string;
  warehouseId?: string | null;
  batchId?: string | null;
  serialNumbers: string[];
  status?: SerialStatus;
  purchaseReference?: string;
  receivedAt?: string | null;
  warrantyExpiresAt?: string | null;
  note?: string;
}

export interface SerialNumberUpdatePayload {
  warehouseId?: string | null;
  batchId?: string | null;
  serialNumber?: string;
  status?: SerialStatus;
  purchaseReference?: string;
  salesReference?: string;
  receivedAt?: string | null;
  soldAt?: string | null;
  warrantyExpiresAt?: string | null;
  note?: string;
}
