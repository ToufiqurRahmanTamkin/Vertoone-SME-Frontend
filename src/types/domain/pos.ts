import type { SalesInvoice } from "./salesInvoice";
import type { TradePaymentMethod } from "./trade";

export interface PosProduct {
  _id: string;
  name: string;
  sku: string;
  barcode: string;
  imageUrl: string | null;
  categoryId: string | null;
  categoryName: string;
  sellingPrice: number;
  taxRate: number;
  isTracked: boolean;
  availableQuantity: number;
}

export interface PosCategory {
  _id: string;
  name: string;
  productCount: number;
}

export interface PosCatalog {
  warehouseId: string;
  categories: PosCategory[];
  products: PosProduct[];
  total: number;
}

export interface PosCatalogQuery {
  warehouseId?: string;
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface PosCheckoutItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
  discount?: number;
  taxRate?: number;
}

export interface PosCheckoutPayload {
  warehouseId: string;
  customerId?: string | null;
  customerName?: string;
  customerPhone?: string;
  items: PosCheckoutItem[];
  discountAmount?: number;
  roundOff?: number;
  paymentMethod?: TradePaymentMethod;
  amountTendered?: number;
  reference?: string;
  note?: string;
}

export interface PosSaleResult {
  invoice: SalesInvoice;
  amountTendered: number;
  changeDue: number;
}

export interface PosSummary {
  salesCount: number;
  itemsSold: number;
  takings: number;
  averageSale: number;
  cashTakings: number;
  currency?: string;
  since: string;
}

export interface PosRecentSale {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  grandTotal: number;
  status: string;
  soldAt: string;
}

export interface PosCartLine {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  taxRate: number;
  quantity: number;
  isTracked: boolean;
  availableQuantity: number;
}
