import { StatusBadge, type StatusColor } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAmount, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  STOCK_STATUS_COLORS,
  STOCK_STATUS_LABELS,
  type StockMovement,
  type StockRow,
} from "@/types/domain/stock";
import {
  STOCK_REFERENCE_LABELS,
  type StockDirection,
} from "@/types/domain/trade";
import type { ColumnDef } from "@tanstack/react-table";
import { Layers } from "lucide-react";

const DIRECTION_COLORS: Record<StockDirection, StatusColor> = {
  IN: "green",
  OUT: "red",
};

export const stockColumns = ({
  onInspect,
}: {
  onInspect: (row: StockRow) => void;
}): ColumnDef<StockRow>[] => [
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.product?.name ?? "—"}</p>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.product?.sku ?? ""}
        </p>
      </div>
    ),
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) =>
      row.original.category ? (
        <Badge variant="secondary" className="text-[10px]">
          {row.original.category.name}
        </Badge>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "quantity",
    header: "On hand",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {formatNumber(row.original.quantity)}
      </span>
    ),
  },
  {
    accessorKey: "reservedQuantity",
    header: "Reserved",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-muted-foreground">
        {row.original.reservedQuantity ? formatNumber(row.original.reservedQuantity) : "—"}
      </span>
    ),
  },
  {
    accessorKey: "availableQuantity",
    header: "Free to sell",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatNumber(row.original.availableQuantity)}
      </span>
    ),
  },
  {
    accessorKey: "stockValue",
    header: "Value",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatAmount(row.original.stockValue)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={STOCK_STATUS_COLORS[row.original.status] as StatusColor}
        label={STOCK_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => onInspect(row.original)}
          aria-label={`Warehouse breakdown for ${row.original.product?.name ?? "product"}`}
        >
          <Layers className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export const stockMovementColumns = (): ColumnDef<StockMovement>[] => [
  {
    accessorKey: "occurredAt",
    header: "When",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.occurredAt)}</span>
    ),
  },
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.product?.name ?? "—"}</p>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.product?.sku ?? ""}
        </p>
      </div>
    ),
  },
  {
    id: "warehouse",
    header: "Warehouse",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.warehouse?.name ?? "—"}</span>
    ),
  },
  {
    id: "source",
    header: "Source",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{STOCK_REFERENCE_LABELS[row.original.refType]}</p>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.refNumber || "—"}
          {row.original.isReversal ? " · reversed" : ""}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "direction",
    header: "Direction",
    cell: ({ row }) => (
      <StatusBadge
        color={DIRECTION_COLORS[row.original.direction]}
        label={row.original.direction === "IN" ? "In" : "Out"}
      />
    ),
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {row.original.direction === "IN" ? "+" : "−"}
        {formatNumber(row.original.quantity)}
      </span>
    ),
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">{formatAmount(row.original.value)}</span>
    ),
  },
];
