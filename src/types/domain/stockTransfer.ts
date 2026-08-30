import type { ProductRef } from "./product";
import type { TagRef } from "./tag";
import type { TradeListQuery } from "./trade";
import type { WarehouseRef } from "./warehouse";

export const STOCK_TRANSFER_STATUSES = [
  "DRAFT",
  "IN_TRANSIT",
  "COMPLETED",
  "CANCELLED",
] as const;

export type StockTransferStatus = (typeof STOCK_TRANSFER_STATUSES)[number];

export const STOCK_TRANSFER_STATUS_LABELS: Record<StockTransferStatus, string> = {
  DRAFT: "Draft",
  IN_TRANSIT: "In transit",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STOCK_TRANSFER_STATUS_COLORS: Record<StockTransferStatus, string> = {
  DRAFT: "zinc",
  IN_TRANSIT: "amber",
  COMPLETED: "green",
  CANCELLED: "red",
};

export interface StockTransferItem {
  _id: string;
  productId: string;
  product: ProductRef | null;
  name: string;
  sku: string;
  quantity: number;
  unitCost: number;
  note: string;
}

export interface StockTransfer {
  _id: string;
  transferNumber: string;
  fromWarehouseId: string;
  fromWarehouse: WarehouseRef | null;
  toWarehouseId: string;
  toWarehouse: WarehouseRef | null;
  transferDate: string;
  expectedDate: string | null;
  status: StockTransferStatus;
  items: StockTransferItem[];
  totalQuantity: number;
  totalValue: number;
  reference: string;
  notes: string;
  tags: TagRef[];
  tagIds: string[];
  dispatchedAt: string | null;
  receivedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransferListQuery extends TradeListQuery {
  status?: StockTransferStatus;
  fromWarehouseId?: string;
  toWarehouseId?: string;
}

export interface StockTransferSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  inTransitCount: number;
  completedCount: number;
  inTransitValue: number;
}

export interface StockTransferItemPayload {
  productId: string;
  quantity: number;
  note?: string;
}

export interface StockTransferPayload {
  fromWarehouseId: string;
  toWarehouseId: string;
  transferDate?: string;
  expectedDate?: string | null;
  items: StockTransferItemPayload[];
  reference?: string;
  notes?: string;
  tagIds?: string[];
}
