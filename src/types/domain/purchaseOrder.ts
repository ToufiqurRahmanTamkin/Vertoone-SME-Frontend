import type { SupplierRef } from "./supplier";
import type { TagRef } from "./tag";
import type {
  TradeChargesPayload,
  TradeItem,
  TradeItemPayload,
  TradeListQuery,
  TradePayment,
  TradePaymentStatus,
  TradeTotals,
} from "./trade";
import type { WarehouseRef } from "./warehouse";

export const PURCHASE_ORDER_STATUSES = [
  "DRAFT",
  "ORDERED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED",
] as const;

export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number];

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "Draft",
  ORDERED: "Ordered",
  PARTIALLY_RECEIVED: "Part received",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
};

export const PURCHASE_ORDER_STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  DRAFT: "zinc",
  ORDERED: "blue",
  PARTIALLY_RECEIVED: "amber",
  RECEIVED: "green",
  CANCELLED: "red",
};

export const PURCHASE_ORDER_SOURCES = ["MANUAL", "REQUISITION", "RFQ"] as const;

export type PurchaseOrderSource = (typeof PURCHASE_ORDER_SOURCES)[number];

export const PURCHASE_ORDER_SOURCE_LABELS: Record<PurchaseOrderSource, string> = {
  MANUAL: "Raised by hand",
  REQUISITION: "From a requisition",
  RFQ: "Awarded from an RFQ",
};

export const PURCHASE_ORDER_SOURCE_PATHS: Record<PurchaseOrderSource, string | null> = {
  MANUAL: null,
  REQUISITION: "/sme/purchases/requisitions",
  RFQ: "/sme/purchases/rfq",
};

export interface PurchaseOrderItem extends TradeItem {
  receivedQuantity: number;
  returnedQuantity: number;
  pendingQuantity: number;
}

export interface PurchaseOrder extends TradeTotals {
  _id: string;
  orderNumber: string;
  supplierId: string;
  supplier: SupplierRef | null;
  supplierName: string;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  orderDate: string;
  expectedDate: string | null;
  status: PurchaseOrderStatus;
  sourceType: PurchaseOrderSource;
  sourceId: string | null;
  sourceNumber: string;
  items: PurchaseOrderItem[];
  totalQuantity: number;
  receivedQuantity: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: TradePaymentStatus;
  payments: TradePayment[];
  reference: string;
  notes: string;
  terms: string;
  tags: TagRef[];
  tagIds: string[];
  orderedAt: string | null;
  receivedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderListQuery extends TradeListQuery {
  status?: PurchaseOrderStatus;
  sourceType?: PurchaseOrderSource;
  paymentStatus?: TradePaymentStatus;
  supplierId?: string;
  warehouseId?: string;
}

export interface PurchaseOrderSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  openCount: number;
  receivedCount: number;
  orderedValue: number;
  outstandingPayable: number;
}

export interface PurchaseOrderPayload extends TradeChargesPayload {
  supplierId: string;
  warehouseId: string;
  orderDate?: string;
  expectedDate?: string | null;
  items: TradeItemPayload[];
}

export interface ReceivePurchaseOrderPayload {
  items?: { itemId: string; quantity: number }[];
  receivedAt?: string;
  note?: string;
}
