import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/lib/amount";
import {
  REORDER_STATUS_COLORS,
  REORDER_STATUS_LABELS,
  type ReorderRule,
} from "@/types/domain/reorderRule";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface ReorderColumnActions {
  onEdit: (rule: ReorderRule) => void;
  onDelete: (rule: ReorderRule) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function ReorderRowActions({
  rule,
  ...actions
}: ReorderColumnActions & { rule: ReorderRule }) {
  return (
    <RowActions
      label={`Actions for ${rule.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(rule),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(rule),
        },
      ]}
    />
  );
}

export const reorderColumns = (rowActions: ReorderColumnActions): ColumnDef<ReorderRule>[] => [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.sku}
        </p>
      </div>
    ),
  },
  {
    id: "warehouse",
    header: "Applies at",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.warehouse?.name ?? "Every warehouse"}
      </span>
    ),
  },
  {
    id: "level",
    header: "On hand",
    cell: ({ row }) => {
      const minimum = row.original.minimumQuantity || 1;
      const share = Math.round((row.original.onHand / minimum) * 100);

      return (
        <div className="min-w-[6rem] space-y-1">
          <p className="text-sm tabular-nums">
            {formatNumber(row.original.onHand)}
            <span className="ml-1 text-xs text-muted-foreground">
              min {formatNumber(row.original.minimumQuantity)}
            </span>
          </p>
          <Progress value={Math.max(0, Math.min(100, share))} className="h-1.5" />
        </div>
      );
    },
  },
  {
    accessorKey: "suggestedQuantity",
    header: "Suggest ordering",
    cell: ({ row }) =>
      row.original.suggestedQuantity > 0 ? (
        <span className="font-medium tabular-nums">
          {formatNumber(row.original.suggestedQuantity)}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    id: "supplier",
    header: "Buy from",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{row.original.preferredSupplier?.name ?? "—"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.leadTimeDays > 0 ? `${row.original.leadTimeDays} day lead time` : ""}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={REORDER_STATUS_COLORS[row.original.status]}
        label={REORDER_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <ReorderRowActions rule={row.original} {...rowActions} />,
  },
];
