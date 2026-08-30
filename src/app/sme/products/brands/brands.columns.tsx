import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Brand } from "@/types/domain/brand";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

interface BrandColumnActions {
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const brandColumns = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: BrandColumnActions): ColumnDef<Brand>[] => [
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
          disabled={!canDelete}
          aria-label={`Delete ${row.original.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
