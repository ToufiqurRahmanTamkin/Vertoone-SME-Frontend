import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  CRM_ACTIVITY_RELATED_COLORS,
  CRM_ACTIVITY_RELATED_LABELS,
  CRM_ACTIVITY_TYPE_LABELS,
  type CrmActivity,
} from "@/types/domain/crmActivity";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Pencil, Trash2 } from "lucide-react";
import { activityStateOf, relatedNameOf } from "./activity.helpers";

export interface ActivityColumnActions {
  onEdit: (activity: CrmActivity) => void;
  onComplete: (activity: CrmActivity) => void;
  onDelete: (activity: CrmActivity) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function ActivityRowActions({
  activity,
  ...actions
}: ActivityColumnActions & { activity: CrmActivity }) {
  const isSystem = activity.source === "SYSTEM";

  return (
    <RowActions
      label={`Actions for ${activity.subject}`}
      actions={[
        !isSystem &&
          !activity.isCompleted && {
            key: "complete",
            label: "Mark done",
            icon: Check,
            disabled: !actions.canEdit,
            onSelect: () => actions.onComplete(activity),
          },
        !isSystem && {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(activity),
        },
        !isSystem && {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive" as const,
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(activity),
        },
      ]}
    />
  );
}

export const activityColumns = (
  rowActions: ActivityColumnActions,
  options: { showDue?: boolean } = {}
): ColumnDef<CrmActivity>[] => {
  const columns: ColumnDef<CrmActivity>[] = [
    {
      accessorKey: "subject",
      header: "Activity",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.subject}</p>
          <p className="truncate text-xs text-muted-foreground">
            {CRM_ACTIVITY_TYPE_LABELS[row.original.type]}
            {row.original.durationMinutes > 0 && ` · ${row.original.durationMinutes} min`}
          </p>
        </div>
      ),
    },
    {
      id: "related",
      header: "Against",
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col gap-1">
          <StatusBadge
            color={CRM_ACTIVITY_RELATED_COLORS[row.original.relatedType]}
            label={CRM_ACTIVITY_RELATED_LABELS[row.original.relatedType]}
          />
          <span className="truncate text-xs text-muted-foreground">
            {relatedNameOf(row.original)}
          </span>
        </div>
      ),
    },
    {
      id: "performedBy",
      header: "Owner",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.performedBy?.name || "Unassigned"}</span>
      ),
    },
    {
      accessorKey: "occurredAt",
      header: "When",
      cell: ({ row }) => (
        <span className="text-sm">{formatDateTime(row.original.occurredAt)}</span>
      ),
    },
  ];

  if (options.showDue !== false) {
    columns.push({
      accessorKey: "dueAt",
      header: "Due",
      cell: ({ row }) => (
        <span
          className={cn(
            "text-sm",
            row.original.isOverdue && "font-medium text-red-600 dark:text-red-400"
          )}
        >
          {row.original.dueAt ? formatDateTime(row.original.dueAt) : "—"}
        </span>
      ),
    });
  }

  columns.push(
    {
      id: "state",
      header: "State",
      cell: ({ row }) => {
        const state = activityStateOf(row.original);
        return <StatusBadge color={state.color} label={state.label} />;
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <ActivityRowActions activity={row.original} {...rowActions} />,
    }
  );

  return columns;
};
