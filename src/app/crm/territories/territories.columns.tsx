import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatAmountValue, formatNumber } from "@/lib/amount";
import {
  TERRITORY_MATCH_MODE_COLORS,
  TERRITORY_MATCH_MODE_LABELS,
  type Territory,
} from "@/types/domain/territory";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";

export interface TerritoryColumnActions {
  onEdit: (territory: Territory) => void;
  onDelete: (territory: Territory) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const ruleSummaryOf = (territory: Territory): string => {
  if (territory.matchMode === "OWNER") {
    const heads = territory.members.length + (territory.manager ? 1 : 0);
    return heads === 0 ? "Nobody assigned" : `${heads} person${heads === 1 ? "" : "s"}`;
  }
  if (territory.matchMode === "MANUAL") return "Assigned by hand";

  const parts = [
    territory.rules.countries.length && `${territory.rules.countries.length} countries`,
    territory.rules.states.length && `${territory.rules.states.length} states`,
    territory.rules.cities.length && `${territory.rules.cities.length} cities`,
    territory.rules.postalCodes.length && `${territory.rules.postalCodes.length} postcodes`,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(" · ") : "No rules yet";
};

export function TerritoryRowActions({
  territory,
  ...actions
}: TerritoryColumnActions & { territory: Territory }) {
  return (
    <RowActions
      label={`Actions for ${territory.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(territory),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(territory),
        },
      ]}
    />
  );
}

export const territoryColumns = (
  rowActions: TerritoryColumnActions
): ColumnDef<Territory>[] => [
  {
    accessorKey: "name",
    header: "Territory",
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <ColorChip color={row.original.color} label={row.original.name} />
          {row.original.code && (
            <span className="font-mono text-xs uppercase text-muted-foreground">
              {row.original.code}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{ruleSummaryOf(row.original)}</p>
      </div>
    ),
  },
  {
    id: "matchMode",
    header: "Matched",
    cell: ({ row }) => (
      <StatusBadge
        color={TERRITORY_MATCH_MODE_COLORS[row.original.matchMode]}
        label={TERRITORY_MATCH_MODE_LABELS[row.original.matchMode]}
      />
    ),
  },
  {
    id: "team",
    header: "Team",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.manager?.name || "No manager"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.members.length} member{row.original.members.length === 1 ? "" : "s"}
        </p>
      </div>
    ),
  },
  {
    id: "coverage",
    header: "Covers",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">
          {formatNumber(row.original.coverage.contactCount)} contacts ·{" "}
          {formatNumber(row.original.coverage.leadCount)} leads
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatNumber(row.original.coverage.openDealCount)} open deals
        </p>
      </div>
    ),
  },
  {
    id: "value",
    header: "Open value",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm tabular-nums">
        <p>{formatAmountValue(row.original.coverage.openValue)}</p>
        <p className="text-xs text-muted-foreground">
          {formatAmountValue(row.original.coverage.wonValue)} won
        </p>
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: "Order",
    cell: ({ row }) => (
      <Badge variant="outline" className="tabular-nums">
        {row.original.priority}
      </Badge>
    ),
  },
  {
    id: "state",
    header: "State",
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
    cell: ({ row }) => <TerritoryRowActions territory={row.original} {...rowActions} />,
  },
];
