import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import { formatDate } from "@/lib/date";
import {
  PRICE_LIST_CHANNEL_LABELS,
  PRICE_LIST_STATUS_COLORS,
  PRICE_LIST_STATUS_LABELS,
  PRICE_LIST_TYPE_LABELS,
  type PriceList,
  type PriceListItem,
} from "@/types/domain/priceList";
import type { ColumnDef } from "@tanstack/react-table";
import { ListOrdered, Pencil, Trash2 } from "lucide-react";

export interface PriceListColumnActions {
  onEdit: (list: PriceList) => void;
  onDelete: (list: PriceList) => void;
  onOpenPrices: (list: PriceList) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export interface PriceListItemColumnActions {
  onEdit: (item: PriceListItem) => void;
  onDelete: (item: PriceListItem) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function PriceListRowActions({
  list,
  ...actions
}: PriceListColumnActions & { list: PriceList }) {
  return (
    <RowActions
      label={`Actions for ${list.name}`}
      actions={[
        {
          key: "prices",
          label: "See prices",
          icon: ListOrdered,
          onSelect: () => actions.onOpenPrices(list),
        },
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(list),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(list),
        },
      ]}
    />
  );
}

export function PriceListItemRowActions({
  item,
  ...actions
}: PriceListItemColumnActions & { item: PriceListItem }) {
  return (
    <RowActions
      label={`Actions for ${item.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(item),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(item),
        },
      ]}
    />
  );
}

export const priceListColumns = (
  rowActions: PriceListColumnActions
): ColumnDef<PriceList>[] => [
  {
    accessorKey: "name",
    header: "Price list",
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate font-medium">{row.original.name}</p>
          {row.original.isDefault && <StatusBadge color="blue" label="Default" />}
        </div>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.code}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Applies to",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <Badge variant="secondary" className="text-[10px]">
          {PRICE_LIST_TYPE_LABELS[row.original.type]}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {PRICE_LIST_CHANNEL_LABELS[row.original.channel]}
        </Badge>
      </div>
    ),
  },
  {
    id: "window",
    header: "Runs",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.validFrom ? formatDate(row.original.validFrom) : "Always"}
        {row.original.validTo ? ` → ${formatDate(row.original.validTo)}` : ""}
      </span>
    ),
  },
  {
    accessorKey: "itemCount",
    header: "Prices",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] tabular-nums">
        {formatNumber(row.original.itemCount)}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={PRICE_LIST_STATUS_COLORS[row.original.status]}
        label={PRICE_LIST_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <PriceListRowActions list={row.original} {...rowActions} />,
  },
];

export const priceListItemColumns = (
  rowActions: PriceListItemColumnActions
): ColumnDef<PriceListItem>[] => [
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
    id: "list",
    header: "Price list",
    cell: ({ row }) => (
      <span className="truncate text-sm">{row.original.priceList?.name ?? "—"}</span>
    ),
  },
  {
    accessorKey: "minQuantity",
    header: "From qty",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatNumber(row.original.minQuantity)}</span>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium tabular-nums">{formatAmountValue(row.original.price)}</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          list {formatAmountValue(row.original.basePrice)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "difference",
    header: "Against list",
    cell: ({ row }) =>
      row.original.basePrice === 0 ? (
        <span className="text-sm text-muted-foreground">—</span>
      ) : (
        <StatusBadge
          color={row.original.difference < 0 ? "green" : row.original.difference > 0 ? "amber" : "zinc"}
          label={`${row.original.difference > 0 ? "+" : ""}${row.original.differencePercent}%`}
        />
      ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={row.original.isActive ? "green" : "zinc"}
        label={row.original.isActive ? "Active" : "Inactive"}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <PriceListItemRowActions item={row.original} {...rowActions} />,
  },
];
