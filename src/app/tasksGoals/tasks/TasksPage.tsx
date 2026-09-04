import { ActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { ShareInvitations } from "@/components/shared/share-invitations";
import { ShareResourceDialog } from "@/components/shared/share-resource-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Progress } from "@/components/ui/progress";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { useGetAiAllowanceQuery } from "@/redux/apis/aiApis";
import {
  useDeleteTaskBoardMutation,
  useGetTaskBoardSummaryQuery,
  useGetTaskBoardsQuery,
} from "@/redux/apis/taskApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetShareSummaryQuery } from "@/redux/apis/resourceShareApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  TASK_BOARD_VISIBILITIES,
  TASK_BOARD_VISIBILITY_LABELS,
  type TaskBoardVisibility,
  type TaskBoardWithStats,
} from "@/types/domain/task";
import { Bot, Plus } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BoardRowActions, boardColumns, boardProgress } from "./boards.columns";
import { AiBoardModal } from "./components/AiBoardModal";
import { BoardFormModal } from "./components/BoardFormModal";
import { SharedBoardsList } from "./components/SharedBoardsList";

export default function TasksPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/company/tasks-and-goals/tasks");
  const navigate = useNavigate();

  // Someone who only got here through a share cannot call the company-wide endpoints.
  const ownsModule = access.canView;
  const tab = ownsModule ? ((filters.tab as string) ?? "all") : "shared";

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery(undefined, {
    skip: !ownsModule,
  });

  const { data, isLoading, isFetching } = useGetTaskBoardsQuery(
    {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      visibility: filters.visibility as TaskBoardVisibility | undefined,
      memberId: filters.memberId as string | undefined,
      isArchived: filters.isArchived === "true" ? true : undefined,
    },
    { skip: !ownsModule }
  );

  const { data: summary } = useGetTaskBoardSummaryQuery(undefined, { skip: !ownsModule });
  const { data: shareSummary } = useGetShareSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TaskBoardWithStats | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<TaskBoardWithStats | null>(null);
  const [sharing, setSharing] = React.useState<TaskBoardWithStats | null>(null);
  const [shareOpen, setShareOpen] = React.useState(false);
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

  const openEdit = React.useCallback((board: TaskBoardWithStats) => {
    setEditing(board);
    setFormOpen(true);
  }, []);

  const openShare = React.useCallback((board: TaskBoardWithStats) => {
    setSharing(board);
    setShareOpen(true);
  }, []);

  const { data: ai } = useGetAiAllowanceQuery(undefined, { skip: !ownsModule });
  const [aiOpen, setAiOpen] = React.useState(false);

  const rowActions = React.useMemo(
    () => ({
      onEdit: openEdit,
      onShare: openShare,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canShare: access.canEdit,
    }),
    [openEdit, openShare, access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => boardColumns(rowActions), [rowActions]);

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Boards, lists and cards. Drag work across the board and assign it to whoever needs to act."
      />

      <ShareInvitations resourceType="TASK_BOARD" />

      <Tabs value={tab} onValueChange={(next) => setFilter("tab", next)} className="gap-4">
        <TabsList>
          {ownsModule && <TabsTrigger value="all">All boards</TabsTrigger>}
          <TabsTrigger value="shared" className="gap-1.5">
            Shared with me
            {(shareSummary?.boardCount ?? 0) > 0 && (
              <Badge variant="secondary" className="text-[10px] tabular-nums">
                {shareSummary?.boardCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {ownsModule && (
          <TabsContent value="all" className="space-y-4">
            <StatGrid className="sm:grid-cols-4">
              <Stat>
                <StatLabel>Cards</StatLabel>
                <StatValue>{summary?.taskCount ?? 0}</StatValue>
                <StatDescription>
                  {limit === null
                    ? "Unlimited on your plan"
                    : `${used} of ${limit} allowed by your plan`}
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
                  <>
                    {ai?.isConfigured && (
                      <ActionButton
                        icon={Bot}
                        label="Create with AI"
                        variant="outline"
                        onClick={() => setAiOpen(true)}
                      />
                    )}
                    <ActionButton
                      icon={Plus}
                      label="New board"
                      onClick={() => {
                        setEditing(null);
                        setFormOpen(true);
                      }}
                    />
                  </>
                )
              }
            />

            <DataTable
              columns={columns}
              data={boards}
              isLoading={isLoading}
              pagination={
                meta
                  ? {
                      page: meta.page,
                      limit: meta.limit,
                      total: meta.total,
                      pages: meta.totalPages,
                    }
                  : undefined
              }
              onPageChange={(page) => setFilter("page", page)}
              onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
              getRowId={(row) => row._id}
              mobileCard={(board) => {
                const progress = boardProgress(board);

                return (
                  <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        className="min-w-0 cursor-pointer text-left"
                        onClick={() => navigate(`/company/tasks-and-goals/tasks/${board._id}`)}
                      >
                        <ColorChip color={board.color} label={board.name} />
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {board.description || "No description"}
                        </p>
                      </button>
                      <StatusBadge
                        color={board.isArchived ? "zinc" : "green"}
                        label={board.isArchived ? "Archived" : "Active"}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px] tabular-nums">
                        {board.lists.length} lists
                      </Badge>
                      <Badge variant="outline" className="text-[10px] tabular-nums">
                        {board.labels.length} labels
                      </Badge>
                      {board.overdueCount > 0 && (
                        <StatusBadge color="red" label={`${board.overdueCount} overdue`} />
                      )}
                    </div>

                    <dl className="mt-3 grid gap-1 text-xs">
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Owner</dt>
                        <dd className="truncate font-medium">{board.owner?.name ?? "No owner"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Members</dt>
                        <dd className="font-medium tabular-nums">{board.members.length}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Visibility</dt>
                        <dd className="truncate font-medium">
                          {TASK_BOARD_VISIBILITY_LABELS[board.visibility]}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="tabular-nums text-muted-foreground">
                          {board.completedCount} of {board.taskCount} done
                        </span>
                        <span className="tabular-nums text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>

                    <div className="mt-3 border-t pt-3">
                      <BoardRowActions board={board} {...rowActions} />
                    </div>
                  </div>
                );
              }}
            />
          </TabsContent>
        )}

        <TabsContent value="shared">
          <SharedBoardsList />
        </TabsContent>
      </Tabs>

      <BoardFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        board={editing}
        onCreated={(boardId) => navigate(`/company/tasks-and-goals/tasks/${boardId}`)}
      />

      <AiBoardModal open={aiOpen} onOpenChange={setAiOpen} />

      <ShareResourceDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        resourceType="TASK_BOARD"
        resourceId={sharing?._id ?? null}
        resourceTitle={sharing?.name ?? ""}
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
