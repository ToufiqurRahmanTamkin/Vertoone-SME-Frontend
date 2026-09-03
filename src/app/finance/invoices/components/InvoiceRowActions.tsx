import { RowActions } from "@/components/shared/row-actions";
import {
  canReviewInvoicePayment,
  canRevertInvoicePayment,
  canSubmitInvoicePayment,
  isSubscriptionInvoice,
  isSystemInvoice,
  type Invoice,
} from "@/types/domain/invoice";
import {
  BadgeCheck,
  BadgeX,
  Eye,
  Pencil,
  RotateCcw,
  Tags,
  Trash2,
  Wallet,
} from "lucide-react";

export interface InvoiceRowActionHandlers {
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onChangeStatus: (invoice: Invoice) => void;
  onPay: (invoice: Invoice) => void;
  onApprove: (invoice: Invoice) => void;
  onReject: (invoice: Invoice) => void;
  onRevert: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  isPlatform: boolean;
}

const SYSTEM_LOCK_HINT =
  "Raised by the system. It can only be marked paid or unpaid.";

export function InvoiceRowActions({
  invoice,
  onView,
  onEdit,
  onChangeStatus,
  onPay,
  onApprove,
  onReject,
  onRevert,
  onDelete,
  isPlatform,
}: InvoiceRowActionHandlers & { invoice: Invoice }) {
  const system = isSystemInvoice(invoice);
  const subscription = isSubscriptionInvoice(invoice);
  const canPay = !isPlatform && canSubmitInvoicePayment(invoice);
  const canReview = isPlatform && canReviewInvoicePayment(invoice);
  const canRevert = canRevertInvoicePayment(invoice, isPlatform);

  return (
    <RowActions
      label={`Actions for ${invoice.invoiceNumber}`}
      actions={[
        { key: "view", label: "View invoice", icon: Eye, onSelect: () => onView(invoice) },
        canPay && {
          key: "pay",
          label:
            invoice.paymentReviewAction === "REJECTED" ? "Resubmit payment" : "Mark as paid",
          icon: Wallet,
          onSelect: () => onPay(invoice),
        },
        canReview && {
          key: "approve",
          label: "Approve payment",
          icon: BadgeCheck,
          onSelect: () => onApprove(invoice),
        },
        canReview && {
          key: "reject",
          label: "Reject payment",
          icon: BadgeX,
          onSelect: () => onReject(invoice),
        },
        canRevert && {
          key: "revert",
          label: isPlatform ? "Mark as unpaid" : "Withdraw payment",
          icon: RotateCcw,
          onSelect: () => onRevert(invoice),
        },
        !subscription && {
          key: "status",
          label: system ? "Mark paid or unpaid" : "Change status",
          icon: Tags,
          onSelect: () => onChangeStatus(invoice),
        },
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: system,
          title: system ? SYSTEM_LOCK_HINT : undefined,
          onSelect: () => onEdit(invoice),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: system,
          title: system ? SYSTEM_LOCK_HINT : undefined,
          onSelect: () => onDelete(invoice),
        },
      ]}
    />
  );
}
