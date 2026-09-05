import type { SupplierRef } from "./supplier";
import type { TagRef } from "./tag";
import type { TradeItem, TradeListQuery, TradeTotals } from "./trade";
import type { WarehouseRef } from "./warehouse";

export const PURCHASE_RETURN_STATUSES = ["DRAFT", "CONFIRMED", "CANCELLED"] as const;

export type PurchaseReturnStatus = (typeof PURCHASE_RETURN_STATUSES)[number];

export const PURCHASE_RETURN_STATUS_LABELS: Record<PurchaseReturnStatus, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

export const PURCHASE_RETURN_STATUS_COLORS: Record<PurchaseReturnStatus, string> = {
  DRAFT: "zinc",
  CONFIRMED: "green",
  CANCELLED: "red",
};

export const PURCHASE_RETURN_REASONS = [
  "DAMAGED",
  "WRONG_ITEM",
  "EXPIRED",
  "EXCESS",
  "QUALITY",
  "OTHER",
] as const;

export type PurchaseReturnReason = (typeof PURCHASE_RETURN_REASONS)[number];

export const PURCHASE_RETURN_REASON_LABELS: Record<PurchaseReturnReason, string> = {
  DAMAGED: "Damaged on arrival",
  WRONG_ITEM: "Wrong item sent",
  EXPIRED: "Expired stock",
  EXCESS: "More than ordered",
  QUALITY: "Quality below standard",
  OTHER: "Other",
};

export const PURCHASE_RETURN_SETTLEMENTS = [
  "CREDIT_NOTE",
  "REFUND",
  "REPLACEMENT",
] as const;

export type PurchaseReturnSettlement = (typeof PURCHASE_RETURN_SETTLEMENTS)[number];

export const PURCHASE_RETURN_SETTLEMENT_LABELS: Record<PurchaseReturnSettlement, string> = {
  CREDIT_NOTE: "Credit note",
  REFUND: "Refund",
  REPLACEMENT: "Replacement",
};

export interface PurchaseReturnItem extends TradeItem {
  orderItemId: string | null;
}

export interface PurchaseReturn extends TradeTotals {
  _id: string;
  returnNumber: string;
  supplierId: string;
  supplier: SupplierRef | null;
  supplierName: string;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  purchaseOrderId: string | null;
  purchaseOrderNumber: string;
  returnDate: string;
  status: PurchaseReturnStatus;
  reason: PurchaseReturnReason;
  settlement: PurchaseReturnSettlement;
  items: PurchaseReturnItem[];
  totalQuantity: number;
  amountSettled: number;
  balanceDue: number;
  debitNoteId: string | null;
  debitNoteNumber: string;
  debitNoteAmount: number;
  reference: string;
  notes: string;
  tags: TagRef[];
  tagIds: string[];
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseReturnListQuery extends TradeListQuery {
  status?: PurchaseReturnStatus;
  reason?: PurchaseReturnReason;
  supplierId?: string;
  warehouseId?: string;
}

export interface PurchaseReturnSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  confirmedCount: number;
  returnedValue: number;
  awaitingSettlement: number;
  awaitingDebitNote: number;
}

export interface PurchaseReturnItemPayload {
  productId: string;
  orderItemId?: string | null;
  quantity: number;
  unitPrice?: number;
  discount?: number;
  taxRate?: number;
}

export interface PurchaseReturnPayload {
  supplierId: string;
  warehouseId: string;
  purchaseOrderId?: string | null;
  returnDate?: string;
  reason?: PurchaseReturnReason;
  settlement?: PurchaseReturnSettlement;
  items: PurchaseReturnItemPayload[];
  discountAmount?: number;
  shippingCost?: number;
  roundOff?: number;
  reference?: string;
  notes?: string;
  tagIds?: string[];
}

export interface SettlePurchaseReturnPayload {
  amount: number;
  note?: string;
}
