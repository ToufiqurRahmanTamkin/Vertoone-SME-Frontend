import type { ProductRef } from "./product";

export const TRADE_PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "MOBILE_BANKING",
  "CHEQUE",
  "CREDIT",
] as const;

export type TradePaymentMethod = (typeof TRADE_PAYMENT_METHODS)[number];

export const TRADE_PAYMENT_METHOD_LABELS: Record<TradePaymentMethod, string> = {
  CASH: "Cash",
  CARD: "Card",
  BANK_TRANSFER: "Bank transfer",
  MOBILE_BANKING: "Mobile banking",
  CHEQUE: "Cheque",
  CREDIT: "On credit",
};

export const TRADE_PAYMENT_STATUSES = ["UNPAID", "PARTIAL", "PAID"] as const;

export type TradePaymentStatus = (typeof TRADE_PAYMENT_STATUSES)[number];

export const TRADE_PAYMENT_STATUS_LABELS: Record<TradePaymentStatus, string> = {
  UNPAID: "Unpaid",
  PARTIAL: "Part paid",
  PAID: "Paid",
};

export const TRADE_PAYMENT_STATUS_COLORS: Record<TradePaymentStatus, string> = {
  UNPAID: "red",
  PARTIAL: "amber",
  PAID: "green",
};

export const STOCK_DIRECTIONS = ["IN", "OUT"] as const;

export type StockDirection = (typeof STOCK_DIRECTIONS)[number];

export const STOCK_DIRECTION_LABELS: Record<StockDirection, string> = {
  IN: "Stock in",
  OUT: "Stock out",
};

export const STOCK_REFERENCE_TYPES = [
  "OPENING",
  "PURCHASE_ORDER",
  "PURCHASE_RETURN",
  "SALES_ORDER",
  "SALES_INVOICE",
  "SALES_RETURN",
  "STOCK_TRANSFER",
  "STOCK_ADJUSTMENT",
] as const;

export type StockReferenceType = (typeof STOCK_REFERENCE_TYPES)[number];

export const STOCK_REFERENCE_LABELS: Record<StockReferenceType, string> = {
  OPENING: "Opening stock",
  PURCHASE_ORDER: "Purchase order",
  PURCHASE_RETURN: "Purchase return",
  SALES_ORDER: "Sales order",
  SALES_INVOICE: "Sales invoice",
  SALES_RETURN: "Sales return",
  STOCK_TRANSFER: "Stock transfer",
  STOCK_ADJUSTMENT: "Stock adjustment",
};

export interface TradeItem {
  _id: string;
  productId: string;
  product: ProductRef | null;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

export interface TradeItemPayload {
  productId: string;
  quantity: number;
  unitPrice?: number;
  discount?: number;
  taxRate?: number;
}

export interface TradeTotals {
  subTotal: number;
  itemDiscountTotal: number;
  taxTotal: number;
  discountAmount: number;
  shippingCost: number;
  roundOff: number;
  grandTotal: number;
}

export interface TradePayment {
  _id: string;
  amount: number;
  method: TradePaymentMethod;
  reference: string;
  note: string;
  paidAt: string;
}

export interface RecordPaymentPayload {
  amount: number;
  method?: TradePaymentMethod;
  reference?: string;
  note?: string;
  paidAt?: string;
}

export interface FulfilmentLine {
  itemId: string;
  quantity: number;
}

export interface TradeChargesPayload {
  discountAmount?: number;
  shippingCost?: number;
  roundOff?: number;
  reference?: string;
  notes?: string;
  terms?: string;
  tagIds?: string[];
}

export interface TradeListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  tagIds?: string;
}

export const emptyTotals = (): TradeTotals => ({
  subTotal: 0,
  itemDiscountTotal: 0,
  taxTotal: 0,
  discountAmount: 0,
  shippingCost: 0,
  roundOff: 0,
  grandTotal: 0,
});
