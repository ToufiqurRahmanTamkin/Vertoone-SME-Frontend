import { RowActions } from "@/components/shared/row-actions";
import type { SoldSubscription } from "@/types/domain/soldSubscription";
import { Ban, CheckCircle2, Pencil, RotateCcw, Trash2, XCircle } from "lucide-react";
import {
  canApprovePayment,
  canRefundPayment,
  canRejectPayment,
  canSuspendSubscription,
} from "../payment-actions";

export interface SoldSubscriptionRowActionHandlers {
  onEdit: (record: SoldSubscription) => void;
  onDelete: (record: SoldSubscription) => void;
  onApprove: (record: SoldSubscription) => void;
  onReject: (record: SoldSubscription) => void;
  onRefund: (record: SoldSubscription) => void;
  onSuspend: (record: SoldSubscription) => void;
}

export function SoldSubscriptionRowActions({
  record,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onRefund,
  onSuspend,
}: SoldSubscriptionRowActionHandlers & { record: SoldSubscription }) {
  return (
    <RowActions
      label={`Actions for ${record.invoiceNumber}`}
      actions={[
        canApprovePayment(record) && {
          key: "approve",
          label: "Approve payment",
          icon: CheckCircle2,
          className: "text-emerald-600 focus:text-emerald-600",
          onSelect: () => onApprove(record),
        },
        canRejectPayment(record) && {
          key: "reject",
          label: "Reject payment",
          icon: XCircle,
          className: "text-destructive focus:text-destructive",
          onSelect: () => onReject(record),
        },
        canSuspendSubscription(record) && {
          key: "suspend",
          label: "Suspend subscription",
          icon: Ban,
          className: "text-orange-600 focus:text-orange-600",
          onSelect: () => onSuspend(record),
        },
        canRefundPayment(record) && {
          key: "refund",
          label: "Refund payment",
          icon: RotateCcw,
          onSelect: () => onRefund(record),
        },
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          separated: true,
          onSelect: () => onEdit(record),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          onSelect: () => onDelete(record),
        },
      ]}
    />
  );
}
