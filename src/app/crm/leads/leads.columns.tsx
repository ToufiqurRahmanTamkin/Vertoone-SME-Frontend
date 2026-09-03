import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
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

export interface LeadColumnActions {
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  canEdit: boolean;
  canDelete: boolean;
  canConvert: boolean;
}

export function LeadRowActions({
  lead,
  ...actions
}: LeadColumnActions & { lead: Lead }) {
  return (
    <RowActions
      label={`Actions for ${lead.title}`}
      actions={[
        {
          key: "convert",
          label: "Convert to a contact",
          icon: UserRoundPlus,
          disabled: !actions.canConvert || Boolean(lead.contactId),
          title: lead.contactId ? "Already converted to a contact" : undefined,
          onSelect: () => actions.onConvert(lead),
        },
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(lead),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(lead),
        },
      ]}
    />
  );
}

export const leadColumns = (
  rowActions: LeadColumnActions
): ColumnDef<Lead>[] => [
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
    cell: ({ row }) => <LeadRowActions lead={row.original} {...rowActions} />,
  },
];
