import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WAREHOUSE_TYPE_LABELS, type Warehouse } from "@/types/domain/warehouse";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

interface WarehouseColumnActions {
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const warehouseColumns = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: WarehouseColumnActions): ColumnDef<Warehouse>[] => [
  {
    accessorKey: "name",
    header: "Warehouse",
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{row.original.name}</p>
          {row.original.isDefault && (
            <Badge variant="secondary" className="text-[10px]">
              Default
            </Badge>
          )}
        </div>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.code}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {WAREHOUSE_TYPE_LABELS[row.original.type]}
      </Badge>
    ),
  },
  {
    id: "manager",
    header: "Manager",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.manager?.name || row.original.contactPerson || "—"}
      </span>
    ),
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const { city, country } = row.original.address;
      const location = [city, country].filter(Boolean).join(", ");
      return <span className="text-sm">{location || "—"}</span>;
    },
  },
  {
    id: "negative",
    header: "Negative stock",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.allowNegativeStock ? "Allowed" : "Blocked"}
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
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => onEdit(row.original)}
          disabled={!canEdit}
          aria-label={`Edit ${row.original.name}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
          onClick={() => onDelete(row.original)}
          disabled={!canDelete || row.original.isDefault}
          aria-label={`Delete ${row.original.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
