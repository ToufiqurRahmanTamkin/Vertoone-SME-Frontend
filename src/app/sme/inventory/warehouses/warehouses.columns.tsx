import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { WAREHOUSE_TYPE_LABELS, type Warehouse } from "@/types/domain/warehouse";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface WarehouseColumnActions {
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function WarehouseRowActions({
  warehouse,
  ...actions
}: WarehouseColumnActions & { warehouse: Warehouse }) {
  return (
    <RowActions
      label={`Actions for ${warehouse.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(warehouse),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete || warehouse.isDefault,
          title: warehouse.isDefault ? "The default warehouse cannot be deleted" : undefined,
          onSelect: () => actions.onDelete(warehouse),
        },
      ]}
    />
  );
}

export const warehouseColumns = (
  rowActions: WarehouseColumnActions
): ColumnDef<Warehouse>[] => [
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
    cell: ({ row }) => <WarehouseRowActions warehouse={row.original} {...rowActions} />,
  },
];
