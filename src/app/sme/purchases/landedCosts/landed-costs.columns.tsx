import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  LANDED_COST_BASIS_LABELS,
  LANDED_COST_STATUS_COLORS,
  LANDED_COST_STATUS_LABELS,
  type LandedCost,
} from "@/types/domain/landedCost";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, PackageCheck, Pencil, Split, Trash2 } from "lucide-react";

export interface LandedCostColumnActions {
  onEdit: (cost: LandedCost) => void;
  onAllocate: (cost: LandedCost) => void;
  onViewReceipts: (cost: LandedCost) => void;
  onCancel: (cost: LandedCost) => void;
  onDelete: (cost: LandedCost) => void;
  canEdit: boolean;
  canDelete: boolean;
  canViewReceipts: boolean;
}

export function LandedCostRowActions({
  cost,
  ...actions
}: LandedCostColumnActions & { cost: LandedCost }) {
  const isDraft = cost.status === "DRAFT";

  return (
    <RowActions
      label={`Actions for ${cost.landedCostNumber}`}
      actions={[
        isDraft && {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(cost),
        },
        isDraft && {
          key: "allocate",
          label: "Spread across receipts",
          icon: Split,
          disabled: !actions.canEdit,
          onSelect: () => actions.onAllocate(cost),
        },
        actions.canViewReceipts &&
          cost.goodsReceiptNumbers.length > 0 && {
            key: "receipts",
            label: "Receipts it lands on",
            icon: PackageCheck,
            onSelect: () => actions.onViewReceipts(cost),
          },
        cost.status !== "CANCELLED" && {
          key: "cancel",
          label: "Cancel",
          icon: Ban,
          separated: true,
          disabled: !actions.canEdit,
          onSelect: () => actions.onCancel(cost),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canDelete || cost.status === "ALLOCATED",
          onSelect: () => actions.onDelete(cost),
        },
      ]}
    />
  );
}

export const landedCostColumns = (
  rowActions: LandedCostColumnActions
): ColumnDef<LandedCost>[] => [
  {
    accessorKey: "landedCostNumber",
    header: "Landed cost",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium uppercase">
          {row.original.landedCostNumber}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(row.original.costDate)}
        </p>
      </div>
    ),
  },
  {
    id: "vendor",
    header: "Charged by",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.vendor?.name ?? (row.original.vendorName || "—")}</p>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.billNumber || "No bill linked"}
        </p>
      </div>
    ),
  },
  {
    id: "receipts",
    header: "Spread over",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate font-mono text-xs uppercase">
          {row.original.goodsReceiptNumbers.join(", ") || "—"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatNumber(row.original.allocatedUnits)} units ·{" "}
          {LANDED_COST_BASIS_LABELS[row.original.basis]}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "totalCharge",
    header: "Charges",
    cell: ({ row }) => (
      <div className="text-sm tabular-nums">
        <p>{formatAmountValue(row.original.totalCharge)}</p>
        <p className="text-xs text-muted-foreground">
          {formatNumber(row.original.charges.length)} lines
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={LANDED_COST_STATUS_COLORS[row.original.status] as StatusColor}
        label={LANDED_COST_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <LandedCostRowActions cost={row.original} {...rowActions} />,
  },
];
