import { ActionButton, CardActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Progress } from "@/components/ui/progress";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteTaskBoardMutation,
  useGetTaskBoardSummaryQuery,
  useGetTaskBoardsQuery,
} from "@/redux/apis/taskApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  TASK_BOARD_VISIBILITIES,
  TASK_BOARD_VISIBILITY_LABELS,
  type TaskBoardVisibility,
  type TaskBoardWithStats,
} from "@/types/domain/task";
import { LayoutGrid, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BoardFormModal } from "./components/BoardFormModal";

export default function TasksPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters(12);
  const access = useModulePermission("/tasks-goals/tasks");
  const navigate = useNavigate();

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const { data, isLoading, isFetching } = useGetTaskBoardsQuery({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    visibility: filters.visibility as TaskBoardVisibility | undefined,
    memberId: filters.memberId as string | undefined,
    isArchived: filters.isArchived === "true" ? true : undefined,
  });

  const { data: summary } = useGetTaskBoardSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TaskBoardWithStats | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<TaskBoardWithStats | null>(null);
  const [deleteBoard, { isLoading: isDeleting }] = useDeleteTaskBoardMutation();

  const toolbarFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "visibility",
        label: "Visibility",
        type: "select",
        options: TASK_BOARD_VISIBILITIES.map((visibility) => ({
          label: TASK_BOARD_VISIBILITY_LABELS[visibility],
          value: visibility,
        })),
      },
      {
        name: "memberId",
        label: "Member",
        type: "select",
        options: employeeOptions.map((employee) => ({
          label: employee.name,
          value: employee._id,
        })),
      },
      {
        name: "isArchived",
        label: "Archived",
        type: "select",
        options: [
          { label: "Archived only", value: "true" },
          { label: "Active only", value: "false" },
        ],
      },
    ],
    [employeeOptions]
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteBoard(pendingDelete._id).unwrap();
      toast.success("Board deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the board");
    }
  };

  const boards = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Boards, lists and cards. Drag work across the board and assign it to whoever needs to act."
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Cards</StatLabel>
          <StatValue>{summary?.taskCount ?? 0}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Still open</StatLabel>
          <StatValue>{summary?.openCount ?? 0}</StatValue>
          <StatDescription>Not yet ticked off across every board</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Overdue</StatLabel>
          <StatValue>{summary?.overdueCount ?? 0}</StatValue>
          <StatDescription>Past their due date and still open</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Boards</StatLabel>
          <StatValue>{summary?.activeCount ?? 0}</StatValue>
          <StatDescription>{summary?.archivedCount ?? 0} archived</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search boards..."
        filters={toolbarFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New board"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            />
          )
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : boards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-16 text-center">
          <LayoutGrid className="size-8 text-muted-foreground" aria-hidden />
          <p className="font-semibold">No boards yet</p>
          <p className="max-w-md text-sm text-muted-foreground">
            A board is where the work lives. Create one and it comes with Backlog, To Do, In
            Progress, Review and Done lists ready to use.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const progress =
              board.taskCount > 0
                ? Math.round((board.completedCount / board.taskCount) * 100)
                : 0;

            return (
              <article
                key={board._id}
                className="flex flex-col overflow-hidden rounded-xl border bg-card transition hover:border-primary/40"
              >
                <span
                  className="block h-1.5 w-full"
                  style={{ backgroundColor: board.color }}
                  aria-hidden
                />

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      className="min-w-0 cursor-pointer text-left"
                      onClick={() => navigate(`/tasks-goals/tasks/${board._id}`)}
                    >
                      <p className="truncate font-semibold hover:underline">{board.name}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {board.description || "No description"}
                      </p>
                    </button>
                    {board.isArchived && <StatusBadge color="zinc" label="Archived" />}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-[11px]">
                      {board.lists.length} lists
                    </Badge>
                    <Badge variant="outline" className="text-[11px]">
                      {board.labels.length} labels
                    </Badge>
                    <Badge variant="outline" className="text-[11px]">
                      {TASK_BOARD_VISIBILITY_LABELS[board.visibility]}
                    </Badge>
                    {board.overdueCount > 0 && (
                      <StatusBadge color="red" label={`${board.overdueCount} overdue`} />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>
                        {board.completedCount} of {board.taskCount} done
                      </span>
                      <span className="tabular-nums">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  <p className="truncate text-xs text-muted-foreground">
                    {board.owner ? `Owned by ${board.owner.name}` : "No owner"}
                    {board.members.length > 0 && ` · ${board.members.length} members`}
                  </p>

                  <div className="mt-auto flex justify-end gap-2 border-t pt-3">
                    <CardActionButton
                      icon={LayoutGrid}
                      label="Open board"
                      onClick={() => navigate(`/tasks-goals/tasks/${board._id}`)}
                    />
                    <CardActionButton
                      icon={Pencil}
                      label="Edit board"
                      onClick={() => {
                        setEditing(board);
                        setFormOpen(true);
                      }}
                      disabled={!access.canEdit}
                    />
                    <CardActionButton
                      icon={Trash2}
                      label="Delete board"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete(board)}
                      disabled={!access.canDelete}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <DataTablePagination
          page={meta.page}
          limit={meta.limit}
          total={meta.total}
          pages={meta.totalPages}
          onPageChange={(page) => setFilter("page", page)}
          onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
        />
      )}

      <BoardFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        board={editing}
        onCreated={(boardId) => navigate(`/tasks-goals/tasks/${boardId}`)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.name ?? ""}"?`}
        description="Its lists, cards and comments go with it. Archive the board instead if you may want it back."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
