import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Button } from "@/components/ui/button";
import {
  CONTACT_STATUS_COLORS,
  CONTACT_STATUS_LABELS,
  type Contact,
} from "@/types/domain/contact";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

interface ContactColumnActions {
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const contactColumns = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: ContactColumnActions): ColumnDef<Contact>[] => [
  {
    accessorKey: "name",
    header: "Contact",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name || "—"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.jobTitle || "No job title"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "companyName",
    header: "Company",
    cell: ({ row }) => <span className="text-sm">{row.original.companyName || "—"}</span>,
  },
  {
    id: "reach",
    header: "Reach",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.email || "—"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.phone || "No phone"}
        </p>
      </div>
    ),
  },
  {
    id: "contactType",
    header: "Type",
    cell: ({ row }) =>
      row.original.contactType ? (
        <ColorChip
          color={row.original.contactType.color}
          label={row.original.contactType.name}
        />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.owner?.name || "Unassigned"}</span>
    ),
  },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) => <TagList tags={row.original.tags} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={CONTACT_STATUS_COLORS[row.original.status]}
        label={CONTACT_STATUS_LABELS[row.original.status]}
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
