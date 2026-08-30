import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/date";
import {
  LEAD_PRIORITY_COLORS,
  LEAD_PRIORITY_LABELS,
  LEAD_STATUS_COLORS,
  LEAD_STATUS_LABELS,
  type Lead,
} from "@/types/domain/lead";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, UserRoundPlus } from "lucide-react";

interface LeadColumnActions {
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  canEdit: boolean;
  canDelete: boolean;
  canConvert: boolean;
}

export const leadColumns = ({
  onEdit,
  onDelete,
  onConvert,
  canEdit,
  canDelete,
  canConvert,
}: LeadColumnActions): ColumnDef<Lead>[] => [
  {
    accessorKey: "title",
    header: "Lead",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.title}</p>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.code}
        </p>
      </div>
    ),
  },
  {
    id: "person",
    header: "Person",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.name || row.original.companyName || "—"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.email || row.original.phone || "No contact details"}
        </p>
      </div>
    ),
  },
  {
    id: "leadSource",
    header: "Source",
    cell: ({ row }) =>
      row.original.leadSource ? (
        <ColorChip color={row.original.leadSource.color} label={row.original.leadSource.name} />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "estimatedValue",
    header: "Value",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {row.original.estimatedValue ? row.original.estimatedValue.toLocaleString() : "—"}
      </span>
    ),
  },
  {
    accessorKey: "expectedCloseDate",
    header: "Expected close",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDate(row.original.expectedCloseDate)}
      </span>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <StatusBadge
        color={LEAD_PRIORITY_COLORS[row.original.priority]}
        label={LEAD_PRIORITY_LABELS[row.original.priority]}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={LEAD_STATUS_COLORS[row.original.status]}
        label={LEAD_STATUS_LABELS[row.original.status]}
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
          onClick={() => onConvert(row.original)}
          disabled={!canConvert || Boolean(row.original.contactId)}
          aria-label={`Convert ${row.original.title} to a contact`}
          title={
            row.original.contactId
              ? "Already converted to a contact"
              : "Convert this lead to a contact"
          }
        >
          <UserRoundPlus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer"
          onClick={() => onEdit(row.original)}
          disabled={!canEdit}
          aria-label={`Edit ${row.original.title}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
          onClick={() => onDelete(row.original)}
          disabled={!canDelete}
          aria-label={`Delete ${row.original.title}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
