import type { ContactRef } from "./contact";
import type { TagRef } from "./tag";
import type {
  TradeChargesPayload,
  TradeItem,
  TradeItemPayload,
  TradeListQuery,
  TradeTotals,
} from "./trade";

export const QUOTATION_STATUSES = [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED",
] as const;

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CONVERTED: "Converted",
};

export const QUOTATION_STATUS_COLORS: Record<QuotationStatus, string> = {
  DRAFT: "zinc",
  SENT: "blue",
  ACCEPTED: "green",
  REJECTED: "red",
  EXPIRED: "amber",
  CONVERTED: "violet",
};

export interface QuotationItem extends TradeItem {
  _id: string;
}

export interface Quotation extends TradeTotals {
  _id: string;
  quotationNumber: string;
  customerId: string | null;
  customer: ContactRef | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quotationDate: string;
  validUntil: string;
  status: QuotationStatus;
  isExpired: boolean;
  subject: string;
  items: QuotationItem[];
  totalQuantity: number;
  reference: string;
  notes: string;
  terms: string;
  tags: TagRef[];
  tagIds: string[];
  salesOrderId: string | null;
  salesOrderNumber: string;
  sentAt: string | null;
  respondedAt: string | null;
  convertedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationListQuery extends TradeListQuery {
  status?: QuotationStatus;
  customerId?: string;
}

export interface QuotationSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  sentCount: number;
  acceptedCount: number;
  openValue: number;
  acceptedValue: number;
  currency?: string;
}

export interface QuotationPayload extends TradeChargesPayload {
  customerId?: string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  quotationDate?: string;
  validUntil?: string;
  subject?: string;
  items: TradeItemPayload[];
}

export interface ConvertQuotationPayload {
  warehouseId?: string;
  orderDate?: string;
  expectedDate?: string | null;
}
