import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/date";
import {
  WORK_HISTORY_TYPE_COLORS,
  type WorkHistoryEntry,
} from "@/types/domain/workHistory";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export interface WorkHistoryRowActions {
  onEdit: (entry: WorkHistoryEntry) => void;
  onDelete: (entry: WorkHistoryEntry) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function WorkHistoryRowMenu({
  entry,
  actions,
}: {
  entry: WorkHistoryEntry;
  actions: WorkHistoryRowActions;
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 cursor-pointer"
            aria-label={`More actions for ${entry.title || entry.typeLabel}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={!actions.canEdit} onSelect={() => actions.onEdit(entry)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={!actions.canDelete}
            onSelect={() => actions.onDelete(entry)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ChangeSummary({ entry }: { entry: WorkHistoryEntry }) {
  if (!entry.fromLabel && !entry.toLabel) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span className="flex flex-wrap items-center gap-1.5 text-sm">
      {entry.fromLabel && (
        <span className="text-muted-foreground line-through">{entry.fromLabel}</span>
      )}
      {entry.fromLabel && entry.toLabel && (
        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
      )}
      {entry.toLabel && <span className="font-medium">{entry.toLabel}</span>}
    </span>
  );
}

export const workHistoryColumns = (
  actions: WorkHistoryRowActions
): ColumnDef<WorkHistoryEntry>[] => [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.employee?.name ?? "—"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.employee?.employeeCode ?? ""}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Event",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.title || row.original.typeLabel}</p>
        {row.original.note && (
          <p className="max-w-xs truncate text-xs text-muted-foreground">{row.original.note}</p>
        )}
      </div>
    ),
  },
  {
    id: "change",
    header: "Change",
    cell: ({ row }) => <ChangeSummary entry={row.original} />,
  },
  {
    accessorKey: "effectiveDate",
    header: "Effective",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium">{formatDate(row.original.effectiveDate)}</p>
        {row.original.durationDays !== null && (
          <p className="text-xs text-muted-foreground">{row.original.durationDays} days</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <StatusBadge
          color={WORK_HISTORY_TYPE_COLORS[row.original.type] ?? "muted"}
          label={row.original.typeLabel}
        />
        {row.original.isSystem && (
          <Badge variant="outline" className="text-[10px]">
            Automatic
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <WorkHistoryRowMenu entry={row.original} actions={actions} />,
  },
];
