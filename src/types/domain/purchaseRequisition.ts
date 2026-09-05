import type { DepartmentRef } from "./department";
import type { ProductRef } from "./product";
import type { SupplierRef } from "./supplier";
import type { TagRef } from "./tag";
import type { TradeListQuery } from "./trade";
import type { ActorRef } from "./userOption";
import type { WarehouseRef } from "./warehouse";

export const PURCHASE_REQUISITION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "ORDERED",
  "CANCELLED",
] as const;

export type PurchaseRequisitionStatus = (typeof PURCHASE_REQUISITION_STATUSES)[number];

export const PURCHASE_REQUISITION_STATUS_LABELS: Record<PurchaseRequisitionStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Awaiting approval",
  APPROVED: "Approved",
  REJECTED: "Turned down",
  ORDERED: "Ordered",
  CANCELLED: "Cancelled",
};

export const PURCHASE_REQUISITION_STATUS_COLORS: Record<PurchaseRequisitionStatus, string> = {
  DRAFT: "zinc",
  SUBMITTED: "amber",
  APPROVED: "blue",
  REJECTED: "red",
  ORDERED: "green",
  CANCELLED: "muted",
};

export const PURCHASE_REQUISITION_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

export type PurchaseRequisitionPriority = (typeof PURCHASE_REQUISITION_PRIORITIES)[number];

export const PURCHASE_REQUISITION_PRIORITY_LABELS: Record<
  PurchaseRequisitionPriority,
  string
> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const PURCHASE_REQUISITION_PRIORITY_COLORS: Record<
  PurchaseRequisitionPriority,
  string
> = {
  LOW: "muted",
  NORMAL: "zinc",
  HIGH: "amber",
  URGENT: "red",
};

export interface PurchaseRequisitionItem {
  _id: string;
  productId: string;
  product: ProductRef | null;
  name: string;
  sku: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedTotal: number;
  orderedQuantity: number;
  pendingQuantity: number;
  note: string;
}

export interface PurchaseRequisition {
  _id: string;
  requisitionNumber: string;
  title: string;
  status: PurchaseRequisitionStatus;
  priority: PurchaseRequisitionPriority;
  requisitionDate: string;
  requiredBy: string | null;
  warehouseId: string;
  warehouse: WarehouseRef | null;
  departmentId: string | null;
  department: DepartmentRef | null;
  suggestedSupplierId: string | null;
  suggestedSupplier: SupplierRef | null;
  items: PurchaseRequisitionItem[];
  totalQuantity: number;
  orderedQuantity: number;
  pendingQuantity: number;
  estimatedTotal: number;
  reference: string;
  notes: string;
  rejectionReason: string;
  tags: TagRef[];
  tagIds: string[];
  purchaseOrderIds: string[];
  purchaseOrderNumbers: string[];
  rfqIds: string[];
  rfqNumbers: string[];
  requestedBy: ActorRef | null;
  approvedBy: ActorRef | null;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequisitionListQuery extends TradeListQuery {
  status?: PurchaseRequisitionStatus;
  priority?: PurchaseRequisitionPriority;
  warehouseId?: string;
  departmentId?: string;
}

export interface PurchaseRequisitionSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  draftCount: number;
  awaitingApprovalCount: number;
  approvedCount: number;
  overdueCount: number;
  estimatedValue: number;
  awaitingValue: number;
}

export interface PurchaseRequisitionItemPayload {
  productId: string;
  quantity: number;
  estimatedUnitPrice?: number;
  note?: string;
}

export interface PurchaseRequisitionPayload {
  title: string;
  warehouseId: string;
  departmentId?: string | null;
  suggestedSupplierId?: string | null;
  priority?: PurchaseRequisitionPriority;
  requisitionDate?: string;
  requiredBy?: string | null;
  items: PurchaseRequisitionItemPayload[];
  reference?: string;
  notes?: string;
  tagIds?: string[];
}

export interface ConvertRequisitionPayload {
  supplierId: string;
  warehouseId?: string;
  expectedDate?: string | null;
  items?: { itemId: string; quantity: number }[];
}
