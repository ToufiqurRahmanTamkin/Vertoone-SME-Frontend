import { StatusBadge } from "@/components/shared/status-badge";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { safeDistanceToNow } from "@/lib/date";
import type { ValuationRow } from "@/types/domain/inventoryValuation";
import type { ColumnDef } from "@tanstack/react-table";

export const valuationColumns = (): ColumnDef<ValuationRow>[] => [
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
    accessorKey: "categoryName",
    header: "Category",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{row.original.categoryName}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.brandName}</p>
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "On hand",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="tabular-nums">{formatNumber(row.original.quantity)}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.warehouseCount} location
          {row.original.warehouseCount === 1 ? "" : "s"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "costValue",
    header: "At cost",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium tabular-nums">{formatAmountValue(row.original.costValue)}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatAmountValue(row.original.unitCost)} each
        </p>
      </div>
    ),
  },
  {
    accessorKey: "retailValue",
    header: "At retail",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium tabular-nums">{formatAmountValue(row.original.retailValue)}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatAmountValue(row.original.sellingPrice)} each
        </p>
      </div>
    ),
  },
  {
    accessorKey: "marginPercent",
    header: "Margin",
    cell: ({ row }) => (
      <StatusBadge
        color={
          row.original.marginPercent >= 30
            ? "green"
            : row.original.marginPercent >= 10
              ? "amber"
              : "red"
        }
        label={`${row.original.marginPercent}%`}
      />
    ),
  },
  {
    id: "movement",
    header: "Last moved",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">
          {row.original.lastMovementAt ? safeDistanceToNow(row.original.lastMovementAt) : "Never"}
        </p>
        {row.original.isDeadStock && <StatusBadge color="red" label="Dead stock" />}
      </div>
    ),
  },
];
