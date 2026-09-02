import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/date";
import {
  GOAL_CATEGORY_LABELS,
  GOAL_PRIORITY_COLORS,
  GOAL_PRIORITY_LABELS,
  GOAL_STATUS_COLORS,
  GOAL_STATUS_LABELS,
  type Goal,
} from "@/types/domain/goal";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, TrendingUp, Trash2 } from "lucide-react";

interface GoalColumnActions {
  onOpen: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onCheckIn: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const goalColumns = ({
  onOpen,
  onEdit,
  onCheckIn,
  onDelete,
  canEdit,
  canDelete,
}: GoalColumnActions): ColumnDef<Goal>[] => [
  {
    accessorKey: "title",
    header: "Goal",
    cell: ({ row }) => (
      <button
        type="button"
        className="min-w-0 cursor-pointer text-left"
        onClick={() => onOpen(row.original)}
      >
        <ColorChip color={row.original.color} label={row.original.title} />
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-mono uppercase">{row.original.code}</span>
          {" · "}
          {GOAL_CATEGORY_LABELS[row.original.category]}
          {row.original.parentGoal ? ` · under ${row.original.parentGoal.code}` : ""}
        </p>
      </button>
    ),
  },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => (
      <div className="min-w-32 space-y-1">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="tabular-nums text-muted-foreground">
            {row.original.progressMode === "AUTO"
              ? `${row.original.keyResultDoneCount}/${row.original.keyResultCount} key results`
              : "Tracked by hand"}
          </span>
          <span className="tabular-nums font-medium">{row.original.progress}%</span>
        </div>
        <Progress value={row.original.progress} className="h-1.5" />
      </div>
    ),
  },
  {
    id: "owner",
    header: "Accountable",
    cell: ({ row }) => (
      <div className="min-w-0 text-sm">
        <p className="truncate">{row.original.owner?.name || "Unassigned"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.department?.name || "No department"}
        </p>
      </div>
    ),
  },
  {
    id: "dueDate",
    header: "Due",
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1">
        <span className="text-sm">{formatDate(row.original.dueDate)}</span>
        {row.original.isOverdue && <StatusBadge color="red" label="Overdue" />}
        {row.original.isDueSoon && <StatusBadge color="amber" label="Due soon" />}
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <StatusBadge
        color={GOAL_PRIORITY_COLORS[row.original.priority]}
        label={GOAL_PRIORITY_LABELS[row.original.priority]}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        color={GOAL_STATUS_COLORS[row.original.status]}
        label={GOAL_STATUS_LABELS[row.original.status]}
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
          onClick={() => onCheckIn(row.original)}
          disabled={!canEdit}
          aria-label={`Check in on ${row.original.title}`}
        >
          <TrendingUp className="h-4 w-4" />
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
