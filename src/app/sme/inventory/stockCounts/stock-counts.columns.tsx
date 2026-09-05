import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  STOCK_COUNT_SCOPE_LABELS,
  STOCK_COUNT_STATUS_COLORS,
  STOCK_COUNT_STATUS_LABELS,
  type StockCount,
} from "@/types/domain/stockCount";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, CheckCheck, Pencil, PlayCircle, Trash2 } from "lucide-react";

export interface StockCountColumnActions {
  onEdit: (count: StockCount) => void;
  onStart: (count: StockCount) => void;
  onComplete: (count: StockCount) => void;
  onCancel: (count: StockCount) => void;
  onDelete: (count: StockCount) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function StockCountRowActions({
  count,
  ...actions
}: StockCountColumnActions & { count: StockCount }) {
  const isOpen = count.status === "DRAFT" || count.status === "IN_PROGRESS";

  return (
    <RowActions
      label={`Actions for ${count.countNumber}`}
      actions={[
        isOpen && {
          key: "edit",
          label: "Edit counted figures",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(count),
        },
        count.status === "DRAFT" && {
          key: "start",
          label: "Start counting",
          icon: PlayCircle,
          disabled: !actions.canEdit,
          onSelect: () => actions.onStart(count),
        },
        isOpen && {
          key: "complete",
          label: "Close and post",
          icon: CheckCheck,
          disabled: !actions.canEdit,
          onSelect: () => actions.onComplete(count),
        },
        count.status !== "CANCELLED" && {
          key: "cancel",
          label: "Cancel",
          icon: Ban,
          disabled: !actions.canEdit,
          separated: true,
          onSelect: () => actions.onCancel(count),
        },
        count.status !== "COMPLETED" && {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(count),
        },
      ]}
    />
  );
}

export const stockCountColumns = (
  rowActions: StockCountColumnActions
): ColumnDef<StockCount>[] => [
  {
    accessorKey: "countNumber",
    header: "Count",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono font-medium uppercase">{row.original.countNumber}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.countDate)}
        </p>
      </div>
    ),
  },
  {
    id: "scope",
    header: "Covers",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{row.original.warehouse?.name ?? "—"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {STOCK_COUNT_SCOPE_LABELS[row.original.scope]}
          {row.original.category ? ` · ${row.original.category.name}` : ""}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "itemCount",
    header: "Lines",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatNumber(row.original.itemCount)}
        <span className="ml-1 text-xs text-muted-foreground">
          ({formatNumber(row.original.varianceItems)} off)
        </span>
      </span>
    ),
  },
  {
    id: "variance",
    header: "Variance",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="text-sm tabular-nums">
          +{formatNumber(row.original.gainUnits)} / −{formatNumber(row.original.lossUnits)}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatAmountValue(row.original.varianceValue)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "accuracyPercent",
    header: "Accuracy",
    cell: ({ row }) => (
      <StatusBadge
        color={
          row.original.accuracyPercent >= 95
            ? "green"
            : row.original.accuracyPercent >= 80
              ? "amber"
              : "red"
        }
        label={`${row.original.accuracyPercent}%`}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={STOCK_COUNT_STATUS_COLORS[row.original.status]}
        label={STOCK_COUNT_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <StockCountRowActions count={row.original} {...rowActions} />,
  },
];
