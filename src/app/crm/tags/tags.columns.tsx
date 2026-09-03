import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/date";
import type { Tag } from "@/types/domain/tag";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface TagColumnActions {
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function TagRowActions({
  tag,
  ...actions
}: TagColumnActions & { tag: Tag }) {
  return (
    <RowActions
      label={`Actions for ${tag.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(tag),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(tag),
        },
      ]}
    />
  );
}

export const tagColumns = (
  rowActions: TagColumnActions
): ColumnDef<Tag>[] => [
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
    cell: ({ row }) => <TagRowActions tag={row.original} {...rowActions} />,
  },
];
