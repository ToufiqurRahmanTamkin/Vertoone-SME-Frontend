import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  BATCH_STATUS_COLORS,
  BATCH_STATUS_LABELS,
  type InventoryBatch,
} from "@/types/domain/inventoryBatch";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface BatchColumnActions {
  onEdit: (batch: InventoryBatch) => void;
  onDelete: (batch: InventoryBatch) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function BatchRowActions({
  batch,
  ...actions
}: BatchColumnActions & { batch: InventoryBatch }) {
  return (
    <RowActions
      label={`Actions for ${batch.batchNumber}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(batch),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(batch),
        },
      ]}
    />
  );
}

export const expiryLabel = (batch: InventoryBatch): string => {
  if (!batch.expiresAt) return "No expiry";
  if (batch.daysToExpiry === null) return formatDate(batch.expiresAt);
  if (batch.daysToExpiry < 0) return `Expired ${formatDate(batch.expiresAt)}`;
  return `${formatDate(batch.expiresAt)} · ${batch.daysToExpiry}d left`;
};

export const batchColumns = (rowActions: BatchColumnActions): ColumnDef<InventoryBatch>[] => [
  {
    accessorKey: "batchNumber",
    header: "Batch",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono font-medium uppercase">{row.original.batchNumber}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.product?.name ?? "—"}
        </p>
      </div>
    ),
  },
  {
    id: "warehouse",
    header: "Held at",
    cell: ({ row }) => (
      <span className="truncate text-sm">{row.original.warehouse?.name ?? "—"}</span>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Remaining",
    cell: ({ row }) => {
      const initial = row.original.initialQuantity || 1;
      const share = Math.round((row.original.quantity / initial) * 100);

      return (
        <div className="min-w-[6rem] space-y-1">
          <p className="text-sm tabular-nums">
            {formatNumber(row.original.quantity)} of {formatNumber(row.original.initialQuantity)}
          </p>
          <Progress value={Math.max(0, Math.min(100, share))} className="h-1.5" />
        </div>
      );
    },
  },
  {
    accessorKey: "stockValue",
    header: "Value",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatAmountValue(row.original.stockValue)}</span>
    ),
  },
  {
    accessorKey: "expiresAt",
    header: "Expiry",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{expiryLabel(row.original)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={BATCH_STATUS_COLORS[row.original.status]}
        label={BATCH_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <BatchRowActions batch={row.original} {...rowActions} />,
  },
];
