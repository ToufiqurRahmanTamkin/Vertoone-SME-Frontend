import type { ProductRef } from "./product";
import type { SupplierRef } from "./supplier";
import type { TagRef } from "./tag";
import type { TradeListQuery } from "./trade";
import type { WarehouseRef } from "./warehouse";

export const RFQ_STATUSES = [
  "DRAFT",
  "SENT",
  "QUOTED",
  "AWARDED",
  "CLOSED",
  "CANCELLED",
] as const;

export type RequestForQuoteStatus = (typeof RFQ_STATUSES)[number];

export const RFQ_STATUS_LABELS: Record<RequestForQuoteStatus, string> = {
  DRAFT: "Draft",
  SENT: "Out for quotes",
  QUOTED: "Quotes in",
  AWARDED: "Awarded",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

export const RFQ_STATUS_COLORS: Record<RequestForQuoteStatus, string> = {
  DRAFT: "zinc",
  SENT: "blue",
  QUOTED: "amber",
  AWARDED: "green",
  CLOSED: "muted",
  CANCELLED: "red",
};

export const RFQ_SUPPLIER_STATUSES = [
  "INVITED",
  "RESPONDED",
  "DECLINED",
  "AWARDED",
] as const;

export type RequestForQuoteSupplierStatus = (typeof RFQ_SUPPLIER_STATUSES)[number];

export const RFQ_SUPPLIER_STATUS_LABELS: Record<RequestForQuoteSupplierStatus, string> = {
  INVITED: "Invited",
  RESPONDED: "Quoted",
  DECLINED: "Declined",
  AWARDED: "Awarded",
};

export const RFQ_SUPPLIER_STATUS_COLORS: Record<RequestForQuoteSupplierStatus, string> = {
  INVITED: "zinc",
  RESPONDED: "blue",
  DECLINED: "red",
  AWARDED: "green",
};

export interface RequestForQuoteItem {
  _id: string;
  productId: string;
  product: ProductRef | null;
  name: string;
  sku: string;
  quantity: number;
  targetUnitPrice: number;
  note: string;
}

export interface RequestForQuoteLine {
  _id: string;
  itemId: string;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
  note: string;
}

export interface RequestForQuoteSupplier {
  _id: string;
  supplierId: string;
  supplier: SupplierRef | null;
  supplierName: string;
  status: RequestForQuoteSupplierStatus;
  invitedAt: string | null;
  respondedAt: string | null;
  quotedTotal: number;
  leadTimeDays: number;
  validUntil: string | null;
  note: string;
  lines: RequestForQuoteLine[];
  isBestQuote: boolean;
}

export interface RequestForQuote {
  _id: string;
  rfqNumber: string;
  title: string;
  status: RequestForQuoteStatus;
  requisitionId: string | null;
  requisitionNumber: string;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  issueDate: string;
  responseDeadline: string | null;
  items: RequestForQuoteItem[];
  totalQuantity: number;
  estimatedValue: number;
  suppliers: RequestForQuoteSupplier[];
  supplierCount: number;
  respondedCount: number;
  bestQuoteTotal: number;
  bestQuoteSupplierName: string;
  awardedSupplierId: string | null;
  awardedSupplierName: string;
  purchaseOrderId: string | null;
  purchaseOrderNumber: string;
  reference: string;
  notes: string;
  terms: string;
  tags: TagRef[];
  tagIds: string[];
  sentAt: string | null;
  awardedAt: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RequestForQuoteListQuery extends TradeListQuery {
  status?: RequestForQuoteStatus;
  supplierId?: string;
  warehouseId?: string;
  requisitionId?: string;
}

export interface RequestForQuoteSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  awaitingResponseCount: number;
  quotedCount: number;
  awardedCount: number;
  overdueCount: number;
  estimatedValue: number;
  awardedValue: number;
}

export interface RequestForQuoteItemPayload {
  productId: string;
  quantity: number;
  targetUnitPrice?: number;
  note?: string;
}

export interface RequestForQuotePayload {
  title: string;
  warehouseId: string;
  requisitionId?: string | null;
  issueDate?: string;
  responseDeadline?: string | null;
  items?: RequestForQuoteItemPayload[];
  supplierIds: string[];
  reference?: string;
  notes?: string;
  terms?: string;
  tagIds?: string[];
}

export interface RecordQuotePayload {
  supplierId: string;
  declined?: boolean;
  leadTimeDays?: number;
  validUntil?: string | null;
  note?: string;
  lines?: {
    itemId: string;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    note?: string;
  }[];
}

export interface AwardRequestForQuotePayload {
  supplierId: string;
  expectedDate?: string | null;
}
