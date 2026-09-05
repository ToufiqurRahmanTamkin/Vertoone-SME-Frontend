import type { ContactRef } from "./contact";
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

export const SALES_INVOICE_STATUSES = ["DRAFT", "ISSUED", "CANCELLED"] as const;

export type SalesInvoiceStatus = (typeof SALES_INVOICE_STATUSES)[number];

export const SALES_INVOICE_STATUS_LABELS: Record<SalesInvoiceStatus, string> = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  CANCELLED: "Cancelled",
};

export const SALES_INVOICE_STATUS_COLORS: Record<SalesInvoiceStatus, string> = {
  DRAFT: "zinc",
  ISSUED: "blue",
  CANCELLED: "red",
};

export interface SalesInvoiceItem extends TradeItem {
  orderItemId: string | null;
  returnedQuantity: number;
  returnableQuantity: number;
}

export interface SalesInvoice extends TradeTotals {
  _id: string;
  invoiceNumber: string;
  customerId: string | null;
  customer: ContactRef | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  salesOrderId: string | null;
  salesOrderNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: SalesInvoiceStatus;
  isOverdue: boolean;
  items: SalesInvoiceItem[];
  totalQuantity: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: TradePaymentStatus;
  payments: TradePayment[];
  movesStock: boolean;
  billingAddress: string;
  reference: string;
  notes: string;
  terms: string;
  tags: TagRef[];
  tagIds: string[];
  issuedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesInvoiceListQuery extends TradeListQuery {
  status?: SalesInvoiceStatus;
  paymentStatus?: TradePaymentStatus;
  customerId?: string;
  warehouseId?: string;
  overdue?: boolean;
}

export interface SalesInvoiceSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  issuedCount: number;
  overdueCount: number;
  invoicedValue: number;
  outstandingReceivable: number;
  overdueValue: number;
  currency?: string;
}

export interface SalesInvoicePayload extends TradeChargesPayload {
  customerId?: string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  warehouseId: string;
  invoiceDate?: string;
  dueDate?: string;
  items: TradeItemPayload[];
  billingAddress?: string;
}

export interface InvoiceFromOrderPayload {
  invoiceDate?: string;
  dueDate?: string;
}
