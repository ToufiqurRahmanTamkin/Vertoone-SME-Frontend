import type { SoldSubscription } from "@/types/domain/soldSubscription";

export const canApprovePayment = (record: SoldSubscription): boolean =>
  record.paymentStatus === "UNPAID" || record.paymentStatus === "FAILED";

export const canRejectPayment = (record: SoldSubscription): boolean =>
  record.paymentStatus === "UNPAID" || record.paymentStatus === "FAILED";

export const canRefundPayment = (record: SoldSubscription): boolean =>
  record.paymentStatus === "PAID";
