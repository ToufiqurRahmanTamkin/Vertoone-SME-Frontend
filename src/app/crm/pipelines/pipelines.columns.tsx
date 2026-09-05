import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import type { PipelineWithStats } from "@/types/domain/pipeline";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatMoney } from "./pipeline.helpers";

export interface PipelineColumnActions {
  onEdit: (pipeline: PipelineWithStats) => void;
  onDelete: (pipeline: PipelineWithStats) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function PipelineRowActions({
  pipeline,
  ...actions
}: PipelineColumnActions & { pipeline: PipelineWithStats }) {
  return (
    <RowActions
      label={`Actions for ${pipeline.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(pipeline),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(pipeline),
        },
      ]}
    />
  );
}

export const pipelineColumns = (
  rowActions: PipelineColumnActions
): ColumnDef<PipelineWithStats>[] => [
  {
    accessorKey: "name",
    header: "Pipeline",
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: row.original.color }}
          aria-hidden
        />
        <Link
          to={`/crm/pipelines/${row.original._id}`}
          className="truncate font-medium hover:underline"
          onClick={(event) => event.stopPropagation()}
        >
          {row.original.name}
        </Link>
        {row.original.isDefault && (
          <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-500" aria-label="Default" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "contactType",
    header: "Contact type",
    cell: ({ row }) =>
      row.original.contactType ? (
        <ColorChip
          color={row.original.contactType.color}
          label={row.original.contactType.name}
        />
      ) : (
        <span className="text-xs text-muted-foreground">Any</span>
      ),
  },
  {
    accessorKey: "stages",
    header: "Stages",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {row.original.stages.slice(0, 6).map((stage) => (
          <span
            key={stage._id}
            className="size-2.5 rounded-full"
            style={{ backgroundColor: stage.color }}
            title={stage.name}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">{row.original.stages.length}</span>
      </div>
    ),
  },
  {
    accessorKey: "dealCount",
    header: "Deals",
    cell: ({ row }) => (
      <Badge variant="secondary" className="tabular-nums">
        {row.original.dealCount}
      </Badge>
    ),
  },
  {
    accessorKey: "openValue",
    header: "Open value",
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {formatMoney(row.original.openValue, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "wonValue",
    header: "Won value",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
        {formatMoney(row.original.wonValue, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.owner?.name ?? "Unassigned"}
      </span>
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
    cell: ({ row }) => <PipelineRowActions pipeline={row.original} {...rowActions} />,
  },
];
