import type { ProductRef } from "./product";
import type { SupplierRef } from "./supplier";
import type { TagRef } from "./tag";
import type { TradeItem, TradeItemPayload, TradeListQuery, TradeTotals } from "./trade";

export const DEBIT_NOTE_STATUSES = ["DRAFT", "ISSUED", "APPLIED", "CANCELLED"] as const;

export type DebitNoteStatus = (typeof DEBIT_NOTE_STATUSES)[number];

export const DEBIT_NOTE_STATUS_LABELS: Record<DebitNoteStatus, string> = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  APPLIED: "Applied",
  CANCELLED: "Cancelled",
};

export const DEBIT_NOTE_STATUS_COLORS: Record<DebitNoteStatus, string> = {
  DRAFT: "zinc",
  ISSUED: "amber",
  APPLIED: "green",
  CANCELLED: "red",
};

export const DEBIT_NOTE_REASONS = [
  "RETURNED_GOODS",
  "PRICE_DIFFERENCE",
  "SHORT_DELIVERY",
  "DAMAGED",
  "TAX_ADJUSTMENT",
  "OTHER",
] as const;

export type DebitNoteReason = (typeof DEBIT_NOTE_REASONS)[number];

export const DEBIT_NOTE_REASON_LABELS: Record<DebitNoteReason, string> = {
  RETURNED_GOODS: "Goods sent back",
  PRICE_DIFFERENCE: "Price difference",
  SHORT_DELIVERY: "Short delivery",
  DAMAGED: "Damaged on arrival",
  TAX_ADJUSTMENT: "Tax adjustment",
  OTHER: "Something else",
};

export interface DebitNoteItem extends TradeItem {
  product: ProductRef | null;
}

export interface DebitNoteApplication {
  _id: string;
  billId: string;
  billNumber: string;
  amount: number;
  appliedAt: string;
}

export interface DebitNote extends TradeTotals {
  _id: string;
  debitNoteNumber: string;
  supplierId: string;
  supplier: SupplierRef | null;
  supplierName: string;
  purchaseReturnId: string | null;
  purchaseReturnNumber: string;
  billId: string | null;
  billNumber: string;
  noteDate: string;
  status: DebitNoteStatus;
  reason: DebitNoteReason;
  items: DebitNoteItem[];
  totalQuantity: number;
  amountApplied: number;
  balance: number;
  applications: DebitNoteApplication[];
  reference: string;
  notes: string;
  tags: TagRef[];
  tagIds: string[];
  issuedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DebitNoteListQuery extends TradeListQuery {
  status?: DebitNoteStatus;
  reason?: DebitNoteReason;
  supplierId?: string;
  billId?: string;
}

export interface DebitNoteSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  issuedCount: number;
  appliedCount: number;
  raisedValue: number;
  unappliedValue: number;
}

export interface DebitNotePayload {
  supplierId: string;
  purchaseReturnId?: string | null;
  billId?: string | null;
  noteDate?: string;
  reason?: DebitNoteReason;
  items?: TradeItemPayload[];
  discountAmount?: number;
  shippingCost?: number;
  roundOff?: number;
  reference?: string;
  notes?: string;
  tagIds?: string[];
  issue?: boolean;
}

export interface ApplyDebitNotePayload {
  billId: string;
  amount: number;
}
