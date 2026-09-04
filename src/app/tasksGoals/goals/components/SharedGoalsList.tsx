import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/date";
import { useGetSharedGoalsQuery } from "@/redux/apis/resourceShareApis";
import {
  GOAL_CATEGORY_LABELS,
  GOAL_PRIORITY_COLORS,
  GOAL_PRIORITY_LABELS,
  GOAL_STATUS_COLORS,
  GOAL_STATUS_LABELS,
  type Goal,
} from "@/types/domain/goal";
import { Eye, Pencil, TrendingUp } from "lucide-react";
import * as React from "react";

interface SharedGoalsListProps {
  onOpen: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onCheckIn: (goal: Goal) => void;
}

export function SharedGoalsList({ onOpen, onEdit, onCheckIn }: SharedGoalsListProps) {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const { data, isLoading } = useGetSharedGoalsQuery({ page, limit, search });

  const rows = data?.data ?? [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        value={search}
        placeholder="Search shared goals..."
        className="sm:max-w-xs"
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
      />

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
          Nothing has been shared with you yet. Once you accept an invitation the goal shows up
          here.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map(({ share, goal }) => (
            <article key={share._id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="min-w-0 cursor-pointer text-left"
                  onClick={() => onOpen(goal)}
                >
                  <ColorChip color={goal.color} label={goal.title} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-mono uppercase">{goal.code}</span>
                    {` · ${GOAL_CATEGORY_LABELS[goal.category]}`}
                  </p>
                </button>
                <StatusBadge
                  color={GOAL_STATUS_COLORS[goal.status]}
                  label={GOAL_STATUS_LABELS[goal.status]}
                />
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="tabular-nums text-muted-foreground">
                    {goal.progressMode === "AUTO"
                      ? `${goal.keyResultDoneCount} of ${goal.keyResultCount} key results`
                      : "Tracked by hand"}
                  </span>
                  <span className="font-medium tabular-nums">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-1.5" />
              </div>

              <dl className="mt-3 grid gap-1 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Shared by</dt>
                  <dd className="truncate font-medium">
                    {share.sharedByName || share.sharedByEmail}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Accountable</dt>
                  <dd className="truncate font-medium">{goal.owner?.name ?? "Unassigned"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Due</dt>
                  <dd className="truncate font-medium">{formatDate(goal.dueDate)}</dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge
                  color={GOAL_PRIORITY_COLORS[goal.priority]}
                  label={GOAL_PRIORITY_LABELS[goal.priority]}
                />
                {goal.isOverdue && <StatusBadge color="red" label="Overdue" />}
                {!share.permissions.canEdit && <StatusBadge color="zinc" label="Read only" />}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => onOpen(goal)}
                >
                  <Eye className="size-4" />
                  Open
                </Button>
                {share.permissions.canComment && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => onCheckIn(goal)}
                  >
                    <TrendingUp className="size-4" />
                    Check in
                  </Button>
                )}
                {share.permissions.canEdit && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => onEdit(goal)}
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {meta && meta.total > 0 && (
        <DataTablePagination
          page={meta.page}
          limit={meta.limit}
          total={meta.total}
          pages={meta.totalPages}
          onPageChange={setPage}
          onLimitChange={(next) => {
            setLimit(next);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
