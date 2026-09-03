import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/date";
import {
  DEAL_PRIORITY_COLORS,
  DEAL_PRIORITY_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_STATUS_LABELS,
  type Deal,
} from "@/types/domain/deal";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { formatMoney } from "./deal.helpers";

export interface DealColumnActions {
  onOpen: (deal: Deal) => void;
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function DealRowActions({
  deal,
  ...actions
}: DealColumnActions & { deal: Deal }) {
  return (
    <RowActions
      label={`Actions for ${deal.title}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(deal),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(deal),
        },
      ]}
    />
  );
}

export const dealColumns = (
  rowActions: DealColumnActions
): ColumnDef<Deal>[] => [
  {
    accessorKey: "title",
    header: "Deal",
    cell: ({ row }) => (
      <div className="min-w-0">
        <button
          type="button"
          className="block max-w-full cursor-pointer truncate text-left font-medium hover:underline"
          onClick={() => rowActions.onOpen(row.original)}
        >
          {row.original.title}
        </button>
        <p className="truncate font-mono text-xs uppercase text-muted-foreground">
          {row.original.code}
        </p>
      </div>
    ),
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.contact?.name || "—"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.contact?.email || row.original.contact?.phone || "No contact details"}
        </p>
      </div>
    ),
  },
  {
    id: "stage",
    header: "Stage",
    cell: ({ row }) =>
      row.original.stage ? (
        <ColorChip color={row.original.stage.color} label={row.original.stage.name} />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => (
      <div className="text-sm tabular-nums">
        <p className="font-medium">
          {row.original.value > 0 ? formatMoney(row.original.value, row.original.currency) : "—"}
        </p>
        <p className="text-xs text-muted-foreground">
          {row.original.probability}% · {formatMoney(row.original.weightedValue, row.original.currency)}
        </p>
      </div>
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
    id: "owner",
    header: "Owner",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.owner?.name ?? "Unassigned"}</span>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <StatusBadge
        color={DEAL_PRIORITY_COLORS[row.original.priority]}
        label={DEAL_PRIORITY_LABELS[row.original.priority]}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={DEAL_STATUS_COLORS[row.original.status]}
        label={DEAL_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <DealRowActions deal={row.original} {...rowActions} />,
  },
];
