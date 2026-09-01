import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TASK_BOARD_VISIBILITY_LABELS,
  type TaskBoardWithStats,
} from "@/types/domain/task";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export const boardProgress = (board: TaskBoardWithStats): number =>
  board.taskCount > 0 ? Math.round((board.completedCount / board.taskCount) * 100) : 0;

interface BoardColumnActions {
  onEdit: (board: TaskBoardWithStats) => void;
  onDelete: (board: TaskBoardWithStats) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const boardColumns = ({
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: BoardColumnActions): ColumnDef<TaskBoardWithStats>[] => [
  {
    accessorKey: "name",
    header: "Board",
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link to={`/tasks-goals/tasks/${row.original._id}`} className="hover:underline">
          <ColorChip color={row.original.color} label={row.original.name} />
        </Link>
        <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
          {row.original.description || "No description"}
        </p>
      </div>
    ),
  },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => {
      const progress = boardProgress(row.original);

      return (
        <div className="w-32 space-y-1">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {row.original.completedCount} of {row.original.taskCount} done
            </span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      );
    },
  },
  {
    id: "structure",
    header: "Lists",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className="text-[10px] tabular-nums">
          {row.original.lists.length} lists
        </Badge>
        <Badge variant="outline" className="text-[10px] tabular-nums">
          {row.original.labels.length} labels
        </Badge>
      </div>
    ),
  },
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm">{row.original.owner?.name ?? "No owner"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.members.length} member{row.original.members.length === 1 ? "" : "s"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
    cell: ({ row }) => (
      <span className="text-sm">{TASK_BOARD_VISIBILITY_LABELS[row.original.visibility]}</span>
    ),
  },
  {
    accessorKey: "isArchived",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge
          color={row.original.isArchived ? "zinc" : "green"}
          label={row.original.isArchived ? "Archived" : "Active"}
        />
        {row.original.overdueCount > 0 && (
          <StatusBadge color="red" label={`${row.original.overdueCount} overdue`} />
        )}
      </div>
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
