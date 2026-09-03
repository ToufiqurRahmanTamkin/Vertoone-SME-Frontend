import { RowActions } from "@/components/shared/row-actions";
import type { Expense, Income } from "@/types/domain/finance";
import { Pencil, Trash2 } from "lucide-react";

export interface FinanceEntryRowActionHandlers<T> {
  onEdit: (entry: T) => void;
  onDelete: (entry: T) => void;
}

const isSystemGeneratedEntry = (entry: Income | Expense): boolean =>
  "sourceType" in entry && entry.sourceType !== "MANUAL";

const SYSTEM_LOCK_HINT =
  "Raised by the system. Settle it from its invoice — marking that paid or unpaid updates this entry.";

export function FinanceEntryRowActions<T extends Income | Expense>({
  entry,
  onEdit,
  onDelete,
}: FinanceEntryRowActionHandlers<T> & { entry: T }) {
  const locked = isSystemGeneratedEntry(entry);

  return (
    <RowActions
      label={`Actions for ${entry.title}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: locked,
          title: locked ? SYSTEM_LOCK_HINT : undefined,
          onSelect: () => onEdit(entry),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: locked,
          title: locked ? SYSTEM_LOCK_HINT : undefined,
          onSelect: () => onDelete(entry),
        },
      ]}
    />
  );
}
