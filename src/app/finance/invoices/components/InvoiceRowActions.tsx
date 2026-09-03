import { RowActions } from "@/components/shared/row-actions";
import {
  canReviewInvoicePayment,
  canSubmitInvoicePayment,
  isSubscriptionInvoice,
  type Invoice,
} from "@/types/domain/invoice";
import { BadgeCheck, BadgeX, Eye, Pencil, Tags, Trash2, Wallet } from "lucide-react";

export interface InvoiceRowActionHandlers {
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onChangeStatus: (invoice: Invoice) => void;
  onPay: (invoice: Invoice) => void;
  onApprove: (invoice: Invoice) => void;
  onReject: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  isPlatform: boolean;
}

export function InvoiceRowActions({
  invoice,
  onView,
  onEdit,
  onChangeStatus,
  onPay,
  onApprove,
  onReject,
  onDelete,
  isPlatform,
}: InvoiceRowActionHandlers & { invoice: Invoice }) {
  const subscription = isSubscriptionInvoice(invoice);
  const canPay = !isPlatform && canSubmitInvoicePayment(invoice);
  const canReview = isPlatform && canReviewInvoicePayment(invoice);

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
        !subscription && {
          key: "status",
          label: "Change status",
          icon: Tags,
          onSelect: () => onChangeStatus(invoice),
        },
        !subscription && {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          onSelect: () => onEdit(invoice),
        },
        !subscription && {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          onSelect: () => onDelete(invoice),
        },
      ]}
    />
  );
}
