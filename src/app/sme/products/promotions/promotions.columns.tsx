import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  PROMOTION_SCOPE_LABELS,
  PROMOTION_STATUS_COLORS,
  PROMOTION_STATUS_LABELS,
  PROMOTION_TYPE_LABELS,
  type Promotion,
} from "@/types/domain/promotion";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface PromotionColumnActions {
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function PromotionRowActions({
  promotion,
  ...actions
}: PromotionColumnActions & { promotion: Promotion }) {
  return (
    <RowActions
      label={`Actions for ${promotion.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(promotion),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(promotion),
        },
      ]}
    />
  );
}

export const rewardLabel = (promotion: Promotion): string => {
  if (promotion.type === "PERCENTAGE") return `${promotion.value}% off`;
  if (promotion.type === "FIXED_AMOUNT") return `${formatAmountValue(promotion.value)} off`;
  if (promotion.type === "BUY_X_GET_Y") {
    return `Buy ${formatNumber(promotion.buyQuantity)}, get ${formatNumber(promotion.getQuantity)}`;
  }
  return "Free shipping";
};

export const promotionColumns = (
  rowActions: PromotionColumnActions
): ColumnDef<Promotion>[] => [
  {
    accessorKey: "name",
    header: "Promotion",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        {row.original.couponCode ? (
          <p className="truncate font-mono text-xs uppercase text-muted-foreground">
            {row.original.couponCode}
          </p>
        ) : (
          <p className="truncate text-xs text-muted-foreground">Applied automatically</p>
        )}
      </div>
    ),
  },
  {
    id: "reward",
    header: "Offer",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{rewardLabel(row.original)}</p>
        <p className="truncate text-xs text-muted-foreground">
          {PROMOTION_TYPE_LABELS[row.original.type]}
        </p>
      </div>
    ),
  },
  {
    id: "scope",
    header: "Covers",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {PROMOTION_SCOPE_LABELS[row.original.appliesTo]}
        {row.original.appliesTo !== "ALL" ? ` · ${row.original.targetCount}` : ""}
      </Badge>
    ),
  },
  {
    id: "window",
    header: "Runs",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.startsAt)}
        {row.original.endsAt ? ` → ${formatDate(row.original.endsAt)}` : " → open ended"}
      </span>
    ),
  },
  {
    id: "usage",
    header: "Used",
    cell: ({ row }) =>
      row.original.usageLimit === null ? (
        <span className="tabular-nums text-sm">
          {formatNumber(row.original.usageCount)} · no cap
        </span>
      ) : (
        <div className="min-w-[6rem] space-y-1">
          <p className="text-xs tabular-nums text-muted-foreground">
            {formatNumber(row.original.usageCount)} / {formatNumber(row.original.usageLimit)}
          </p>
          <Progress value={row.original.usagePercent} className="h-1.5" />
        </div>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={PROMOTION_STATUS_COLORS[row.original.status]}
        label={PROMOTION_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <PromotionRowActions promotion={row.original} {...rowActions} />,
  },
];
