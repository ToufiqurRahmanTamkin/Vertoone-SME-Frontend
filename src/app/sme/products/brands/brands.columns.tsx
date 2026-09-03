import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { Brand } from "@/types/domain/brand";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface BrandColumnActions {
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function BrandRowActions({
  brand,
  ...actions
}: BrandColumnActions & { brand: Brand }) {
  return (
    <RowActions
      label={`Actions for ${brand.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(brand),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(brand),
        },
      ]}
    />
  );
}

export const brandColumns = (
  rowActions: BrandColumnActions
): ColumnDef<Brand>[] => [
  {
    accessorKey: "name",
    header: "Brand",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-2">
        {row.original.logoUrl ? (
          <img
            src={row.original.logoUrl}
            alt=""
            className="h-8 w-8 shrink-0 rounded-md border object-contain"
          />
        ) : null}
        <ColorChip color={row.original.color} label={row.original.name} />
      </div>
    ),
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => (
      <span className="truncate text-sm text-muted-foreground">
        {row.original.website || "—"}
      </span>
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
    cell: ({ row }) => <BrandRowActions brand={row.original} {...rowActions} />,
  },
];
