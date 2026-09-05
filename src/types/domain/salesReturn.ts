import type { ContactRef } from "./contact";
import type { TagRef } from "./tag";
import type { TradeItem, TradeListQuery, TradeTotals } from "./trade";
import type { WarehouseRef } from "./warehouse";

export const SALES_RETURN_STATUSES = ["DRAFT", "CONFIRMED", "CANCELLED"] as const;

export type SalesReturnStatus = (typeof SALES_RETURN_STATUSES)[number];

export const SALES_RETURN_STATUS_LABELS: Record<SalesReturnStatus, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

export const SALES_RETURN_STATUS_COLORS: Record<SalesReturnStatus, string> = {
  DRAFT: "zinc",
  CONFIRMED: "green",
  CANCELLED: "red",
};

export const SALES_RETURN_REASONS = [
  "DAMAGED",
  "WRONG_ITEM",
  "NOT_AS_DESCRIBED",
  "CHANGED_MIND",
  "EXPIRED",
  "OTHER",
] as const;

export type SalesReturnReason = (typeof SALES_RETURN_REASONS)[number];

export const SALES_RETURN_REASON_LABELS: Record<SalesReturnReason, string> = {
  DAMAGED: "Arrived damaged",
  WRONG_ITEM: "Wrong item",
  NOT_AS_DESCRIBED: "Not as described",
  CHANGED_MIND: "Changed their mind",
  EXPIRED: "Expired stock",
  OTHER: "Other",
};

export const SALES_RETURN_SETTLEMENTS = ["REFUND", "CREDIT_NOTE", "REPLACEMENT"] as const;

export type SalesReturnSettlement = (typeof SALES_RETURN_SETTLEMENTS)[number];

export const SALES_RETURN_SETTLEMENT_LABELS: Record<SalesReturnSettlement, string> = {
  REFUND: "Refund",
  CREDIT_NOTE: "Credit note",
  REPLACEMENT: "Replacement",
};

export interface SalesReturnItem extends TradeItem {
  invoiceItemId: string | null;
  restock: boolean;
}

export interface SalesReturn extends TradeTotals {
  _id: string;
  returnNumber: string;
  customerId: string | null;
  customer: ContactRef | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  salesInvoiceId: string | null;
  salesInvoiceNumber: string;
  returnDate: string;
  status: SalesReturnStatus;
  reason: SalesReturnReason;
  settlement: SalesReturnSettlement;
  items: SalesReturnItem[];
  totalQuantity: number;
  restockedQuantity: number;
  amountRefunded: number;
  balanceDue: number;
  reference: string;
  notes: string;
  tags: TagRef[];
  tagIds: string[];
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesReturnListQuery extends TradeListQuery {
  status?: SalesReturnStatus;
  reason?: SalesReturnReason;
  customerId?: string;
  warehouseId?: string;
}

export interface SalesReturnSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  confirmedCount: number;
  returnedValue: number;
  awaitingRefund: number;
  currency?: string;
}

export interface SalesReturnItemPayload {
  productId: string;
  invoiceItemId?: string | null;
  quantity: number;
  unitPrice?: number;
  discount?: number;
  taxRate?: number;
  restock?: boolean;
}

export interface SalesReturnPayload {
  customerId?: string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  warehouseId: string;
  salesInvoiceId?: string | null;
  returnDate?: string;
  reason?: SalesReturnReason;
  settlement?: SalesReturnSettlement;
  items: SalesReturnItemPayload[];
  discountAmount?: number;
  shippingCost?: number;
  roundOff?: number;
  reference?: string;
  notes?: string;
  tagIds?: string[];
}

export interface RefundSalesReturnPayload {
  amount: number;
  note?: string;
}
