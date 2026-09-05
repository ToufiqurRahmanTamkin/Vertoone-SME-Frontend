import type { ContactRef } from "./contact";
import type { TagRef } from "./tag";
import type {
  TradeChargesPayload,
  TradeItem,
  TradeItemPayload,
  TradeListQuery,
  TradeTotals,
} from "./trade";
import type { WarehouseRef } from "./warehouse";

export const SALES_ORDER_STATUSES = [
  "DRAFT",
  "CONFIRMED",
  "PARTIALLY_DELIVERED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type SalesOrderStatus = (typeof SALES_ORDER_STATUSES)[number];

export const SALES_ORDER_STATUS_LABELS: Record<SalesOrderStatus, string> = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  PARTIALLY_DELIVERED: "Part delivered",
  DELIVERED: "Delivered",
  COMPLETED: "Closed",
  CANCELLED: "Cancelled",
};

export const SALES_ORDER_STATUS_COLORS: Record<SalesOrderStatus, string> = {
  DRAFT: "zinc",
  CONFIRMED: "blue",
  PARTIALLY_DELIVERED: "amber",
  DELIVERED: "green",
  COMPLETED: "violet",
  CANCELLED: "red",
};

export interface SalesOrderItem extends TradeItem {
  deliveredQuantity: number;
  invoicedQuantity: number;
  reservedQuantity: number;
  pendingQuantity: number;
  uninvoicedQuantity: number;
}

export interface SalesOrder extends TradeTotals {
  _id: string;
  orderNumber: string;
  customerId: string | null;
  customer: ContactRef | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  orderDate: string;
  expectedDate: string | null;
  status: SalesOrderStatus;
  items: SalesOrderItem[];
  totalQuantity: number;
  deliveredQuantity: number;
  invoicedQuantity: number;
  quotationId: string | null;
  quotationNumber: string;
  shippingAddress: string;
  reference: string;
  notes: string;
  terms: string;
  tags: TagRef[];
  tagIds: string[];
  confirmedAt: string | null;
  deliveredAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderListQuery extends TradeListQuery {
  status?: SalesOrderStatus;
  customerId?: string;
  warehouseId?: string;
}

export interface SalesOrderSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  openCount: number;
  deliveredCount: number;
  openValue: number;
  reservedValue: number;
  currency?: string;
}

export interface SalesOrderPayload extends TradeChargesPayload {
  customerId?: string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  warehouseId: string;
  orderDate?: string;
  expectedDate?: string | null;
  items: TradeItemPayload[];
  shippingAddress?: string;
}

export interface DeliverSalesOrderPayload {
  items?: { itemId: string; quantity: number }[];
  deliveredAt?: string;
  note?: string;
}
