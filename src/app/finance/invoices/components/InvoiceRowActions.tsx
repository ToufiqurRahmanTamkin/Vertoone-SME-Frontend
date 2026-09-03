import { RowActions } from "@/components/shared/row-actions";
import type { Invoice } from "@/types/domain/invoice";
import { Eye, Pencil, Trash2 } from "lucide-react";

export interface InvoiceRowActionHandlers {
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

export function InvoiceRowActions({
  invoice,
  onView,
  onEdit,
  onDelete,
}: InvoiceRowActionHandlers & { invoice: Invoice }) {
  return (
    <RowActions
      label={`Actions for ${invoice.invoiceNumber}`}
      actions={[
        { key: "view", label: "View invoice", icon: Eye, onSelect: () => onView(invoice) },
        { key: "edit", label: "Edit", icon: Pencil, onSelect: () => onEdit(invoice) },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          onSelect: () => onDelete(invoice),
        },
      ]}
    />
  );
}
