import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  UNIT_FAMILY_LABELS,
  type UnitOfMeasure,
} from "@/types/domain/unitOfMeasure";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface UnitColumnActions {
  onEdit: (unit: UnitOfMeasure) => void;
  onDelete: (unit: UnitOfMeasure) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function UnitRowActions({ unit, ...actions }: UnitColumnActions & { unit: UnitOfMeasure }) {
  return (
    <RowActions
      label={`Actions for ${unit.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(unit),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(unit),
        },
      ]}
    />
  );
}

export const conversionLabel = (unit: UnitOfMeasure): string =>
  unit.isBase
    ? "Base unit"
    : `1 ${unit.code} = ${unit.conversionFactor} ${unit.baseUnit?.code ?? "base"}`;

export const unitColumns = (rowActions: UnitColumnActions): ColumnDef<UnitOfMeasure>[] => [
  {
    accessorKey: "name",
    header: "Unit",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.code}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "family",
    header: "Measures",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px]">
        {UNIT_FAMILY_LABELS[row.original.family]}
      </Badge>
    ),
  },
  {
    id: "conversion",
    header: "Conversion",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{conversionLabel(row.original)}</span>
    ),
  },
  {
    accessorKey: "productCount",
    header: "Products",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] tabular-nums">
        {row.original.productCount}
      </Badge>
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
    cell: ({ row }) => <UnitRowActions unit={row.original} {...rowActions} />,
  },
];
