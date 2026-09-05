import type { ProductRef } from "./product";
import type { SupplierRef } from "./supplier";
import type { TagRef } from "./tag";
import type { TradeListQuery } from "./trade";
import type { ActorRef } from "./userOption";
import type { WarehouseRef } from "./warehouse";

export const GOODS_RECEIPT_STATUSES = ["DRAFT", "RECEIVED", "CANCELLED"] as const;

export type GoodsReceiptStatus = (typeof GOODS_RECEIPT_STATUSES)[number];

export const GOODS_RECEIPT_STATUS_LABELS: Record<GoodsReceiptStatus, string> = {
  DRAFT: "Draft",
  RECEIVED: "Booked in",
  CANCELLED: "Cancelled",
};

export const GOODS_RECEIPT_STATUS_COLORS: Record<GoodsReceiptStatus, string> = {
  DRAFT: "zinc",
  RECEIVED: "green",
  CANCELLED: "red",
};

export const GOODS_RECEIPT_QUALITY_RESULTS = ["PENDING", "PASSED", "FAILED"] as const;

export type GoodsReceiptQualityResult = (typeof GOODS_RECEIPT_QUALITY_RESULTS)[number];

export const GOODS_RECEIPT_QUALITY_LABELS: Record<GoodsReceiptQualityResult, string> = {
  PENDING: "Not checked",
  PASSED: "Passed",
  FAILED: "Failed",
};

export const GOODS_RECEIPT_QUALITY_COLORS: Record<GoodsReceiptQualityResult, string> = {
  PENDING: "zinc",
  PASSED: "green",
  FAILED: "red",
};

export interface GoodsReceiptItem {
  _id: string;
  orderItemId: string | null;
  productId: string;
  product: ProductRef | null;
  name: string;
  sku: string;
  quantity: number;
  rejectedQuantity: number;
  unitCost: number;
  taxRate: number;
  landedUnitCost: number;
  totalCost: number;
  billedQuantity: number;
  pendingBillQuantity: number;
  note: string;
}

export interface GoodsReceipt {
  _id: string;
  receiptNumber: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  supplierId: string;
  supplier: SupplierRef | null;
  supplierName: string;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  receiptDate: string;
  status: GoodsReceiptStatus;
  qualityResult: GoodsReceiptQualityResult;
  items: GoodsReceiptItem[];
  totalQuantity: number;
  rejectedQuantity: number;
  goodsValue: number;
  landedCostTotal: number;
  totalValue: number;
  landedCostIds: string[];
  billId: string | null;
  billNumber: string;
  isBilled: boolean;
  supplierDeliveryNote: string;
  reference: string;
  notes: string;
  tags: TagRef[];
  tagIds: string[];
  receivedBy: ActorRef | null;
  receivedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GoodsReceiptListQuery extends TradeListQuery {
  status?: GoodsReceiptStatus;
  qualityResult?: GoodsReceiptQualityResult;
  supplierId?: string;
  warehouseId?: string;
  purchaseOrderId?: string;
  billed?: "yes" | "no";
}

export interface GoodsReceiptSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  receivedCount: number;
  awaitingBillCount: number;
  receivedValue: number;
  awaitingBillValue: number;
  rejectedUnits: number;
}

export interface GoodsReceiptItemPayload {
  orderItemId: string;
  quantity: number;
  rejectedQuantity?: number;
  note?: string;
}

export interface GoodsReceiptPayload {
  purchaseOrderId: string;
  receiptDate?: string;
  items: GoodsReceiptItemPayload[];
  qualityResult?: GoodsReceiptQualityResult;
  supplierDeliveryNote?: string;
  reference?: string;
  notes?: string;
  tagIds?: string[];
  post?: boolean;
}

export interface UpdateGoodsReceiptPayload {
  receiptDate?: string;
  items?: GoodsReceiptItemPayload[];
  qualityResult?: GoodsReceiptQualityResult;
  supplierDeliveryNote?: string;
  reference?: string;
  notes?: string;
  tagIds?: string[];
}
