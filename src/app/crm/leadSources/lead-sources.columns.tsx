import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/date";
import type { LeadSource } from "@/types/domain/leadSource";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface LeadSourceColumnActions {
  onEdit: (source: LeadSource) => void;
  onDelete: (source: LeadSource) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function LeadSourceRowActions({
  source,
  ...actions
}: LeadSourceColumnActions & { source: LeadSource }) {
  return (
    <RowActions
      label={`Actions for ${source.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(source),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(source),
        },
      ]}
    />
  );
}

export const leadSourceColumns = (
  rowActions: LeadSourceColumnActions
): ColumnDef<LeadSource>[] => [
  {
    accessorKey: "name",
    header: "Lead source",
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
    cell: ({ row }) => <LeadSourceRowActions source={row.original} {...rowActions} />,
  },
];
