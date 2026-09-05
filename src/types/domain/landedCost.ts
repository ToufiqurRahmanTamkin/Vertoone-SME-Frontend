import type { ProductRef } from "./product";
import type { SupplierRef } from "./supplier";
import type { TagRef } from "./tag";
import type { TradeListQuery } from "./trade";

export const LANDED_COST_STATUSES = ["DRAFT", "ALLOCATED", "CANCELLED"] as const;

export type LandedCostStatus = (typeof LANDED_COST_STATUSES)[number];

export const LANDED_COST_STATUS_LABELS: Record<LandedCostStatus, string> = {
  DRAFT: "Draft",
  ALLOCATED: "Spread",
  CANCELLED: "Cancelled",
};

export const LANDED_COST_STATUS_COLORS: Record<LandedCostStatus, string> = {
  DRAFT: "zinc",
  ALLOCATED: "green",
  CANCELLED: "red",
};

export const LANDED_COST_BASES = ["QUANTITY", "VALUE"] as const;

export type LandedCostBasis = (typeof LANDED_COST_BASES)[number];

export const LANDED_COST_BASIS_LABELS: Record<LandedCostBasis, string> = {
  QUANTITY: "By quantity",
  VALUE: "By value",
};

export const LANDED_COST_CATEGORIES = [
  "FREIGHT",
  "DUTY",
  "INSURANCE",
  "HANDLING",
  "CLEARANCE",
  "OTHER",
] as const;

export type LandedCostCategory = (typeof LANDED_COST_CATEGORIES)[number];

export const LANDED_COST_CATEGORY_LABELS: Record<LandedCostCategory, string> = {
  FREIGHT: "Freight",
  DUTY: "Duty",
  INSURANCE: "Insurance",
  HANDLING: "Handling",
  CLEARANCE: "Clearance",
  OTHER: "Other",
};

export interface LandedCostCharge {
  _id: string;
  label: string;
  category: LandedCostCategory;
  amount: number;
}

export interface LandedCostAllocation {
  _id: string;
  receiptId: string;
  receiptNumber: string;
  receiptItemId: string;
  productId: string;
  product: ProductRef | null;
  name: string;
  sku: string;
  quantity: number;
  goodsValue: number;
  amount: number;
  unitAmount: number;
}

export interface LandedCost {
  _id: string;
  landedCostNumber: string;
  costDate: string;
  status: LandedCostStatus;
  basis: LandedCostBasis;
  vendorId: string | null;
  vendor: SupplierRef | null;
  vendorName: string;
  billId: string | null;
  billNumber: string;
  goodsReceiptIds: string[];
  goodsReceiptNumbers: string[];
  charges: LandedCostCharge[];
  totalCharge: number;
  allocations: LandedCostAllocation[];
  allocatedUnits: number;
  reference: string;
  notes: string;
  tags: TagRef[];
  tagIds: string[];
  allocatedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LandedCostListQuery extends TradeListQuery {
  status?: LandedCostStatus;
  basis?: LandedCostBasis;
  vendorId?: string;
  goodsReceiptId?: string;
}

export interface LandedCostSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  allocatedCount: number;
  totalAllocated: number;
  awaitingAllocation: number;
  thisMonth: number;
}

export interface LandedCostPayload {
  costDate?: string;
  basis?: LandedCostBasis;
  vendorId?: string | null;
  billId?: string | null;
  goodsReceiptIds: string[];
  charges: { label?: string; category?: LandedCostCategory; amount: number }[];
  reference?: string;
  notes?: string;
  tagIds?: string[];
  allocate?: boolean;
}
