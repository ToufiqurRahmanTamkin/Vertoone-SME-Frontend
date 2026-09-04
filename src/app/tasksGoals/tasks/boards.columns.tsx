import { ColorChip } from "@/components/shared/color-chip";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TASK_BOARD_VISIBILITY_LABELS, type TaskBoardWithStats } from "@/types/domain/task";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Share2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export const boardProgress = (board: TaskBoardWithStats): number =>
  board.taskCount > 0 ? Math.round((board.completedCount / board.taskCount) * 100) : 0;

export interface BoardColumnActions {
  onEdit: (board: TaskBoardWithStats) => void;
  onShare: (board: TaskBoardWithStats) => void;
  onDelete: (board: TaskBoardWithStats) => void;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
}

export function BoardRowActions({
  board,
  ...actions
}: BoardColumnActions & { board: TaskBoardWithStats }) {
  return (
    <RowActions
      label={`Actions for ${board.name}`}
      actions={[
        {
          key: "edit",
          label: "Edit",
          icon: Pencil,
          disabled: !actions.canEdit,
          onSelect: () => actions.onEdit(board),
        },
        {
          key: "share",
          label: "Share with someone",
          icon: Share2,
          disabled: !actions.canShare,
          onSelect: () => actions.onShare(board),
        },
        {
          key: "delete",
          label: "Delete",
          icon: Trash2,
          variant: "destructive",
          separated: true,
          disabled: !actions.canDelete,
          onSelect: () => actions.onDelete(board),
        },
      ]}
    />
  );
}

export const boardColumns = (rowActions: BoardColumnActions): ColumnDef<TaskBoardWithStats>[] => [
  {
    accessorKey: "name",
    header: "Board",
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link to={`/company/tasks-and-goals/tasks/${row.original._id}`} className="hover:underline">
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
    cell: ({ row }) => <BoardRowActions board={row.original} {...rowActions} />,
  },
];
