import type { SupplierRef } from "./supplier";
import type { TagRef } from "./tag";
import type { TradeListQuery, TradePaymentMethod } from "./trade";
import type { ActorRef } from "./userOption";

export const PAYMENT_MADE_STATUSES = ["POSTED", "VOID"] as const;

export type PaymentMadeStatus = (typeof PAYMENT_MADE_STATUSES)[number];

export const PAYMENT_MADE_STATUS_LABELS: Record<PaymentMadeStatus, string> = {
  POSTED: "Posted",
  VOID: "Void",
};

export const PAYMENT_MADE_STATUS_COLORS: Record<PaymentMadeStatus, string> = {
  POSTED: "green",
  VOID: "red",
};

export interface PaymentAllocation {
  _id: string;
  billId: string;
  billNumber: string;
  amount: number;
}

export interface PaymentMade {
  _id: string;
  paymentNumber: string;
  supplierId: string;
  supplier: SupplierRef | null;
  supplierName: string;
  paymentDate: string;
  method: TradePaymentMethod;
  amount: number;
  allocations: PaymentAllocation[];
  allocatedAmount: number;
  unappliedAmount: number;
  purchaseOrderId: string | null;
  purchaseOrderNumber: string;
  status: PaymentMadeStatus;
  reference: string;
  chequeNumber: string;
  notes: string;
  tags: TagRef[];
  tagIds: string[];
  recordedBy: ActorRef | null;
  voidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMadeListQuery extends TradeListQuery {
  status?: PaymentMadeStatus;
  method?: TradePaymentMethod;
  supplierId?: string;
  billId?: string;
  purchaseOrderId?: string;
}

export interface PaymentMadeSummary {
  used: number;
  limit: number | null;
  remaining: number | null;
  postedCount: number;
  voidCount: number;
  paidThisMonth: number;
  totalPaid: number;
  unappliedAmount: number;
  advanceAmount: number;
}

export interface PaymentMadePayload {
  supplierId: string;
  paymentDate?: string;
  method?: TradePaymentMethod;
  amount: number;
  allocations?: { billId: string; amount: number }[];
  purchaseOrderId?: string | null;
  reference?: string;
  chequeNumber?: string;
  notes?: string;
  tagIds?: string[];
}
