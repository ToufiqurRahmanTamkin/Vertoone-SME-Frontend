import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import type { Tag } from "@/types/domain/tag";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

interface TagColumnActions {
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const tagColumns = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: TagColumnActions): ColumnDef<Tag>[] => [
  {
    accessorKey: "name",
    header: "Tag",
    cell: ({ row }) => <ColorChip color={row.original.color} label={row.original.name} />,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.description || "—"}</span>
    ),
  },
  {
    accessorKey: "color",
    header: "Colour",
    cell: ({ row }) => (
      <span className="font-mono text-xs uppercase text-muted-foreground">
        {row.original.color}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>
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
