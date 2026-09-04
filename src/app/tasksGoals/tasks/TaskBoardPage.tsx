import { ActionButton } from "@/components/shared/action-button";
import { PageHeader } from "@/components/shared/page-header";
import { ShareResourceDialog } from "@/components/shared/share-resource-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useBoardAccess } from "@/hooks/use-board-access";
import { useQueryFilters } from "@/hooks/use-query-filters";
import {
  useDeleteTaskBoardMutation,
  useGetTaskBoardQuery,
  useGetTaskBoardViewQuery,
  useGetTaskSummaryQuery,
  useMoveTaskMutation,
} from "@/redux/apis/taskApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  TASK_ASSIGNEE_KIND_LABELS,
  TASK_ASSIGNEE_KINDS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskAssigneeKind,
  type TaskPriority,
} from "@/types/domain/task";
import { ArrowLeft, Pencil, Plus, Share2, Trash2 } from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { BoardFormModal } from "./components/BoardFormModal";
import { TaskBoardCanvas, type TaskMove } from "./components/TaskBoardCanvas";
import { TaskDetailSheet } from "./components/TaskDetailSheet";
import { TaskFormModal } from "./components/TaskFormModal";

export default function TaskBoardPage() {
  const { id = "" } = useParams();
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useBoardAccess(id);
  const navigate = useNavigate();

  const [shareOpen, setShareOpen] = React.useState(false);

  const { data: boardDetail } = useGetTaskBoardQuery(id, { skip: !id });

  const {
    data: view,
    isLoading,
    isFetching,
    isError,
  } = useGetTaskBoardViewQuery(
    {
      boardId: id,
      search: filters.search,
      assigneeKind: filters.assigneeKind as TaskAssigneeKind | undefined,
      priority: filters.priority as TaskPriority | undefined,
      labelId: filters.labelId as string | undefined,
      isCompleted:
        filters.isCompleted === undefined ? undefined : filters.isCompleted === "true",
      includeArchived: filters.includeArchived === "true" ? true : undefined,
    },
    { skip: !id }
  );

  const { data: summary } = useGetTaskSummaryQuery({ boardId: id }, { skip: !id });

  const [moveTask] = useMoveTaskMutation();
  const [deleteBoard, { isLoading: isDeletingBoard }] = useDeleteTaskBoardMutation();

  const [boardFormOpen, setBoardFormOpen] = React.useState(false);
  const [boardPendingDelete, setBoardPendingDelete] = React.useState(false);

  const [taskFormOpen, setTaskFormOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [taskListId, setTaskListId] = React.useState<string | undefined>(undefined);

  const [detailTask, setDetailTask] = React.useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const board = view?.board;
  const lists = React.useMemo(() => (view?.columns ?? []).map((column) => column.list), [view]);

  const toolbarFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "assigneeKind",
        label: "Assigned to",
        type: "select",
        options: TASK_ASSIGNEE_KINDS.map((kind) => ({
          label: TASK_ASSIGNEE_KIND_LABELS[kind],
          value: kind,
        })),
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        options: TASK_PRIORITIES.map((priority) => ({
          label: TASK_PRIORITY_LABELS[priority],
          value: priority,
        })),
      },
      {
        name: "labelId",
        label: "Label",
        type: "select",
        options: (board?.labels ?? []).map((label) => ({
          label: label.name,
          value: label._id,
        })),
      },
      {
        name: "isCompleted",
        label: "State",
        type: "select",
        options: [
          { label: "Open", value: "false" },
          { label: "Done", value: "true" },
        ],
      },
      {
        name: "includeArchived",
        label: "Archived",
        type: "select",
        options: [{ label: "Show archived", value: "true" }],
      },
    ],
    [board]
  );

  const handleMove = async (move: TaskMove) => {
    try {
      await moveTask({
        id: move.taskId,
        body: { listId: move.listId, position: move.position },
      }).unwrap();

      toast.success(
        move.isDoneList ? `Moved to ${move.listName} and ticked off` : `Moved to ${move.listName}`
      );
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not move the card");
    }
  };

  const confirmDeleteBoard = async () => {
    try {
      await deleteBoard(id).unwrap();
      toast.success("Board deleted");
      setBoardPendingDelete(false);
      navigate("/company/tasks-and-goals/tasks");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the board");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !view || !board) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
        <p className="font-semibold">Board not found</p>
        <p className="text-sm text-muted-foreground">
          It may have been deleted, or you may not have access to it.
        </p>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer gap-1.5"
          onClick={() => navigate("/company/tasks-and-goals/tasks")}
        >
          <ArrowLeft className="size-4" />
          Back to boards
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit cursor-pointer gap-1.5 text-muted-foreground"
        onClick={() => navigate("/company/tasks-and-goals/tasks")}
      >
        <ArrowLeft className="size-4" />
        All boards
      </Button>

      <PageHeader
        title={board.name}
        description={
          board.description || "Drag a card from one list to the next as the work moves along."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {access.canManageBoard && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Edit board"
                title="Edit board"
                className="size-9 cursor-pointer"
                onClick={() => setBoardFormOpen(true)}
              >
                <Pencil className="size-4" />
              </Button>
            )}
            {access.canShare && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Share board"
                title="Share board"
                className="size-9 cursor-pointer"
                onClick={() => setShareOpen(true)}
              >
                <Share2 className="size-4" />
              </Button>
            )}
            {access.canDeleteBoard && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Delete board"
                title="Delete board"
                className="size-9 cursor-pointer text-destructive hover:text-destructive"
                onClick={() => setBoardPendingDelete(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
            {access.canCreateCards && (
              <ActionButton
                icon={Plus}
                label="Add card"
                onClick={() => {
                  setEditingTask(null);
                  setTaskListId(undefined);
                  setTaskFormOpen(true);
                }}
              />
            )}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: `${board.color}1a`, borderColor: `${board.color}59` }}
        >
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: board.color }}
            aria-hidden
          />
          {view.columns.length} lists
        </span>
        {board.labels.map((label) => (
          <span
            key={label._id}
            className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: `${label.color}26`, color: label.color }}
          >
            {label.name}
          </span>
        ))}
        {boardDetail?.owner && (
          <Badge variant="outline">{boardDetail.owner.name}</Badge>
        )}
        {board.isArchived && <StatusBadge color="zinc" label="Archived" />}
        {access.viaShare && <StatusBadge color="violet" label="Shared with you" />}
        {access.seesOwnCardsOnly && (
          <StatusBadge color="amber" label="Only cards assigned to you" />
        )}
      </div>

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Cards</StatLabel>
          <StatValue>{summary?.total ?? 0}</StatValue>
          <StatDescription>{summary?.openCount ?? 0} still open</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Completion</StatLabel>
          <StatValue>{summary?.completionRate ?? 0}%</StatValue>
          <StatDescription>{summary?.completedCount ?? 0} ticked off</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Overdue</StatLabel>
          <StatValue>{summary?.overdueCount ?? 0}</StatValue>
          <StatDescription>{summary?.dueTodayCount ?? 0} due today</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Unassigned</StatLabel>
          <StatValue>{summary?.unassignedCount ?? 0}</StatValue>
          <StatDescription>{summary?.archivedCount ?? 0} archived cards</StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search cards..."
        filters={toolbarFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
      />

      <TaskBoardCanvas
        view={view}
        canCreate={access.canCreateCards}
        canEdit={access.canMoveCards}
        onOpenTask={(task) => {
          setDetailTask(task);
          setDetailOpen(true);
        }}
        onAddToList={(listId) => {
          setEditingTask(null);
          setTaskListId(listId);
          setTaskFormOpen(true);
        }}
        onMove={(move) => void handleMove(move)}
      />

      <BoardFormModal
        open={boardFormOpen}
        onOpenChange={setBoardFormOpen}
        board={boardDetail ?? null}
      />

      <TaskFormModal
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        board={board}
        lists={lists}
        task={editingTask}
        defaultListId={taskListId}
      />

      <TaskDetailSheet
        task={detailTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        canEdit={access.canEditCards}
        canCreate={access.canComment}
        canDelete={access.canDeleteCards}
        onEditTask={(task) => {
          setEditingTask(task);
          setTaskListId(task.listId);
          setTaskFormOpen(true);
        }}
      />

      <ShareResourceDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        resourceType="TASK_BOARD"
        resourceId={id}
        resourceTitle={board.name}
      />

      <ConfirmDialog
        open={boardPendingDelete}
        onOpenChange={setBoardPendingDelete}
        title={`Delete "${board.name}"?`}
        description="Its lists, cards and comments go with it. Archive the board instead if you may want it back."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeletingBoard}
        onConfirm={confirmDeleteBoard}
      />
    </>
  );
}
