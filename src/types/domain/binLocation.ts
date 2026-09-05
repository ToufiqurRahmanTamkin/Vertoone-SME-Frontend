import type { ProductRef } from "./product";
import type { WarehouseRef } from "./warehouse";

export const BIN_LOCATION_TYPES = [
  "PICKING",
  "BULK",
  "RECEIVING",
  "DISPATCH",
  "RETURNS",
  "QUARANTINE",
] as const;

export type BinLocationType = (typeof BIN_LOCATION_TYPES)[number];

export const BIN_LOCATION_TYPE_LABELS: Record<BinLocationType, string> = {
  PICKING: "Picking",
  BULK: "Bulk storage",
  RECEIVING: "Receiving",
  DISPATCH: "Dispatch",
  RETURNS: "Returns",
  QUARANTINE: "Quarantine",
};

export interface BinLocation {
  _id: string;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  code: string;
  name: string;
  type: BinLocationType;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  path: string;
  capacity: number;
  productIds: string[];
  products: ProductRef[];
  productCount: number;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BinLocationListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  warehouseId?: string;
  productId?: string;
  type?: BinLocationType;
  isActive?: boolean;
}

export interface BinLocationSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  activeCount: number;
  warehouseCount: number;
  assignedProductCount: number;
  emptyCount: number;
}

export interface BinLocationPayload {
  warehouseId: string;
  code: string;
  name?: string;
  type?: BinLocationType;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  capacity?: number;
  productIds?: string[];
  notes?: string;
  isActive?: boolean;
}
