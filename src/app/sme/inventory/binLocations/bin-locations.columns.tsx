import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/amount";
import {
  BIN_LOCATION_TYPE_LABELS,
  type BinLocation,
} from "@/types/domain/binLocation";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface BinColumnActions {
  onEdit: (bin: BinLocation) => void;
  onDelete: (bin: BinLocation) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function BinRowActions({ bin, ...actions }: BinColumnActions & { bin: BinLocation }) {
  return (
    <RowActions
      label={`Actions for ${bin.code}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(bin),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(bin),
        },
      ]}
    />
  );
}

export const binColumns = (rowActions: BinColumnActions): ColumnDef<BinLocation>[] => [
  {
    accessorKey: "code",
    header: "Bin",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-mono font-medium uppercase">{row.original.code}</p>
        <p className="truncate text-xs text-muted-foreground">{row.original.name || "—"}</p>
      </div>
    ),
  },
  {
    id: "warehouse",
    header: "Warehouse",
    cell: ({ row }) => (
      <span className="truncate text-sm">{row.original.warehouse?.name ?? "—"}</span>
    ),
  },
  {
    id: "path",
    header: "Where",
    cell: ({ row }) => (
      <span className="truncate text-sm text-muted-foreground">
        {row.original.path || "Not mapped"}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Used for",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {BIN_LOCATION_TYPE_LABELS[row.original.type]}
      </Badge>
    ),
  },
  {
    accessorKey: "productCount",
    header: "Products",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatNumber(row.original.productCount)}
        {row.original.capacity > 0 && (
          <span className="ml-1 text-xs text-muted-foreground">
            cap {formatNumber(row.original.capacity)}
          </span>
        )}
      </span>
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
    cell: ({ row }) => <BinRowActions bin={row.original} {...rowActions} />,
  },
];
