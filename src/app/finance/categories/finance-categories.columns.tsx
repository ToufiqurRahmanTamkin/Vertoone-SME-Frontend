import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { FINANCE_CATEGORY_TYPE_COLORS, FINANCE_CATEGORY_TYPE_LABELS } from "@/constant";
import { formatDate } from "@/lib/date";
import type { FinanceCategory } from "@/types/domain/finance";
import type { ColumnDef } from "@tanstack/react-table";
import { Lock, Pencil, Trash2 } from "lucide-react";

export interface FinanceCategoryColumnActions {
  onEdit: (category: FinanceCategory) => void;
  onDelete: (category: FinanceCategory) => void;
}

export function FinanceCategoryRowActions({
  category,
  ...actions
}: FinanceCategoryColumnActions & { category: FinanceCategory }) {
  return (
    <RowActions
      label={`Actions for ${category.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          onSelect: () => actions.onEdit(category),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: category.isSystem,
          title: category.isSystem ? "System categories cannot be deleted" : undefined,
          onSelect: () => actions.onDelete(category),
        },
      ]}
    />
  );
}

export const financeCategoryColumns = (
  rowActions: FinanceCategoryColumnActions
): ColumnDef<FinanceCategory>[] => [
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-medium">{category.name}</p>
            {category.isSystem && (
              <Lock className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="System managed" />
            )}
          </div>
          {category.description && (
            <p className="max-w-sm truncate text-xs text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <StatusBadge
        color={FINANCE_CATEGORY_TYPE_COLORS[row.original.type]}
        label={FINANCE_CATEGORY_TYPE_LABELS[row.original.type]}
      />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <StatusBadge color="green" label="Active" />
      ) : (
        <StatusBadge color="zinc" label="Inactive" />
      ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <FinanceCategoryRowActions category={row.original} {...rowActions} />,
  },
];
