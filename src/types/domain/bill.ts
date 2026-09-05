import type { SupplierRef } from "./supplier";
import type { TagRef } from "./tag";
import type { TradeItem, TradeItemPayload, TradeListQuery, TradeTotals } from "./trade";

export const BILL_STATUSES = [
  "DRAFT",
  "AWAITING_PAYMENT",
  "PARTIALLY_PAID",
  "PAID",
  "CANCELLED",
] as const;

export type BillStatus = (typeof BILL_STATUSES)[number];

export const BILL_STATUS_LABELS: Record<BillStatus, string> = {
  DRAFT: "Draft",
  AWAITING_PAYMENT: "Unpaid",
  PARTIALLY_PAID: "Part paid",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export const BILL_STATUS_COLORS: Record<BillStatus, string> = {
  DRAFT: "zinc",
  AWAITING_PAYMENT: "amber",
  PARTIALLY_PAID: "blue",
  PAID: "green",
  CANCELLED: "red",
};

export interface BillItem extends TradeItem {
  goodsReceiptId: string | null;
  receiptItemId: string | null;
}

export interface Bill extends TradeTotals {
  _id: string;
  billNumber: string;
  supplierInvoiceNumber: string;
  supplierId: string;
  supplier: SupplierRef | null;
  supplierName: string;
  purchaseOrderId: string | null;
  purchaseOrderNumber: string;
  goodsReceiptIds: string[];
  goodsReceiptNumbers: string[];
  billDate: string;
  dueDate: string | null;
  status: BillStatus;
  items: BillItem[];
  totalQuantity: number;
  amountPaid: number;
  creditApplied: number;
  amountDue: number;
  isOverdue: boolean;
  daysOverdue: number;
  reference: string;
  notes: string;
  terms: string;
  tags: TagRef[];
  tagIds: string[];
  postedAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillListQuery extends TradeListQuery {
  status?: BillStatus;
  supplierId?: string;
  purchaseOrderId?: string;
  overdue?: "yes" | "no";
}

export interface BillSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  openCount: number;
  overdueCount: number;
  paidCount: number;
  billedValue: number;
  outstanding: number;
  overdueValue: number;
  dueThisWeek: number;
}

export interface PayableBill {
  _id: string;
  billNumber: string;
  supplierInvoiceNumber: string;
  supplierId: string;
  supplierName: string;
  billDate: string;
  dueDate: string | null;
  grandTotal: number;
  amountDue: number;
  isOverdue: boolean;
}

export interface BillItemPayload extends TradeItemPayload {
  goodsReceiptId?: string | null;
  receiptItemId?: string | null;
}

export interface BillPayload {
  supplierId: string;
  supplierInvoiceNumber?: string;
  purchaseOrderId?: string | null;
  goodsReceiptIds?: string[];
  billDate?: string;
  dueDate?: string | null;
  items?: BillItemPayload[];
  discountAmount?: number;
  shippingCost?: number;
  roundOff?: number;
  reference?: string;
  notes?: string;
  terms?: string;
  tagIds?: string[];
  post?: boolean;
}
