import { ActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { ShareInvitations } from "@/components/shared/share-invitations";
import { ShareResourceDialog } from "@/components/shared/share-resource-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import { Progress } from "@/components/ui/progress";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatDate } from "@/lib/date";
import { useGetAiAllowanceQuery } from "@/redux/apis/aiApis";
import { useGetDepartmentOptionsQuery } from "@/redux/apis/departmentApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import {
  useDeleteGoalMutation,
  useGetGoalSummaryQuery,
  useGetGoalsQuery,
} from "@/redux/apis/goalApis";
import { useGetShareSummaryQuery } from "@/redux/apis/resourceShareApis";
import { useGetTaskBoardOptionsQuery } from "@/redux/apis/taskApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  GOAL_CATEGORIES,
  GOAL_CATEGORY_LABELS,
  GOAL_PRIORITIES,
  GOAL_PRIORITY_COLORS,
  GOAL_PRIORITY_LABELS,
  GOAL_STATUSES,
  GOAL_STATUS_COLORS,
  GOAL_STATUS_LABELS,
  type Goal,
  type GoalCategory,
  type GoalPriority,
  type GoalStatus,
} from "@/types/domain/goal";
import { Bot, Plus } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { AiGoalModal } from "./components/AiGoalModal";
import { GoalCheckInModal } from "./components/GoalCheckInModal";
import { GoalDetailSheet } from "./components/GoalDetailSheet";
import { GoalFormModal } from "./components/GoalFormModal";
import { SharedGoalsList } from "./components/SharedGoalsList";
import { GoalRowActions, goalColumns } from "./goals.columns";

export default function GoalsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/company/tasks-and-goals/goals");

  // Someone who only got here through a share cannot call the company-wide endpoints.
  const ownsModule = access.canView;
  const tab = ownsModule ? ((filters.tab as string) ?? "all") : "shared";

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery(undefined, {
    skip: !ownsModule,
  });
  const { data: departmentOptions = [] } = useGetDepartmentOptionsQuery(undefined, {
    skip: !ownsModule,
  });
  const { data: boardOptions = [] } = useGetTaskBoardOptionsQuery(undefined, {
    skip: !ownsModule,
  });

  const { data, isLoading, isFetching } = useGetGoalsQuery(
    {
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      category: filters.category as GoalCategory | undefined,
      status: filters.status as GoalStatus | undefined,
      priority: filters.priority as GoalPriority | undefined,
      ownerId: filters.ownerId as string | undefined,
      departmentId: filters.departmentId as string | undefined,
      boardId: filters.boardId as string | undefined,
      isOverdue: filters.isOverdue === "true" ? true : undefined,
      isArchived: filters.isArchived === "true" ? true : undefined,
    },
    { skip: !ownsModule }
  );

  const { data: summary } = useGetGoalSummaryQuery(undefined, { skip: !ownsModule });
  const { data: shareSummary } = useGetShareSummaryQuery();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Goal | null>(null);
  const [reading, setReading] = React.useState<Goal | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [checkingIn, setCheckingIn] = React.useState<Goal | null>(null);
  const [checkInOpen, setCheckInOpen] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<Goal | null>(null);
  const [sharing, setSharing] = React.useState<Goal | null>(null);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [deleteGoal, { isLoading: isDeleting }] = useDeleteGoalMutation();

  const toolbarFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "status",
        label: "Status",
        type: "select",
        options: GOAL_STATUSES.map((status) => ({
          label: GOAL_STATUS_LABELS[status],
          value: status,
        })),
      },
      {
        name: "category",
        label: "Level",
        type: "select",
        options: GOAL_CATEGORIES.map((category) => ({
          label: GOAL_CATEGORY_LABELS[category],
          value: category,
        })),
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        options: GOAL_PRIORITIES.map((priority) => ({
          label: GOAL_PRIORITY_LABELS[priority],
          value: priority,
        })),
      },
      {
        name: "ownerId",
        label: "Accountable",
        type: "select",
        options: employeeOptions.map((employee) => ({
          label: employee.name,
          value: employee._id,
        })),
      },
      {
        name: "departmentId",
        label: "Department",
        type: "select",
        options: departmentOptions.map((department) => ({
          label: department.name,
          value: department._id,
        })),
      },
      {
        name: "boardId",
        label: "Board",
        type: "select",
        options: boardOptions.map((board) => ({ label: board.name, value: board._id })),
      },
      {
        name: "isOverdue",
        label: "Overdue",
        type: "select",
        options: [{ label: "Overdue only", value: "true" }],
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
    [employeeOptions, departmentOptions, boardOptions]
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = React.useCallback((goal: Goal) => {
    setEditing(goal);
    setFormOpen(true);
  }, []);

  const openDetail = React.useCallback((goal: Goal) => {
    setReading(goal);
    setDetailOpen(true);
  }, []);

  const openCheckIn = React.useCallback((goal: Goal) => {
    setCheckingIn(goal);
    setCheckInOpen(true);
  }, []);

  const openShare = React.useCallback((goal: Goal) => {
    setSharing(goal);
    setShareOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteGoal(pendingDelete._id).unwrap();
      toast.success("Goal deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the goal");
    }
  };

  const { data: ai } = useGetAiAllowanceQuery(undefined, { skip: !ownsModule });
  const [aiOpen, setAiOpen] = React.useState(false);

  const rowActions = React.useMemo(
    () => ({
      onOpen: openDetail,
      onEdit: openEdit,
      onCheckIn: openCheckIn,
      onShare: openShare,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
      canShare: access.canEdit,
    }),
    [openDetail, openEdit, openCheckIn, openShare, access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => goalColumns(rowActions), [rowActions]);

  const goals = data?.data ?? [];
  const meta = data?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;

  return (
    <>
      <PageHeader
        title="Goals"
        description="The outcomes your teams are held to, what moves them and how far along they are."
      />

      <ShareInvitations resourceType="GOAL" />

      <Tabs value={tab} onValueChange={(next) => setFilter("tab", next)} className="gap-4">
        <TabsList>
          {ownsModule && <TabsTrigger value="all">All goals</TabsTrigger>}
          <TabsTrigger value="shared" className="gap-1.5">
            Shared with me
            {(shareSummary?.goalCount ?? 0) > 0 && (
              <Badge variant="secondary" className="text-[10px] tabular-nums">
                {shareSummary?.goalCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {ownsModule && (
          <TabsContent value="all" className="space-y-4">
            <StatGrid className="sm:grid-cols-4">
              <Stat>
                <StatLabel>Goals</StatLabel>
                <StatValue>{used}</StatValue>
                <StatDescription>
                  {limit === null
                    ? "Unlimited on your plan"
                    : `${used} of ${limit} allowed by your plan`}
                </StatDescription>
              </Stat>
              <Stat>
                <StatLabel>Average progress</StatLabel>
                <StatValue>{summary?.averageProgress ?? 0}%</StatValue>
                <StatDescription>Across every active goal</StatDescription>
              </Stat>
              <Stat>
                <StatLabel>Need attention</StatLabel>
                <StatValue>{(summary?.atRiskCount ?? 0) + (summary?.offTrackCount ?? 0)}</StatValue>
                <StatDescription>
                  {summary?.atRiskCount ?? 0} at risk · {summary?.offTrackCount ?? 0} off track
                </StatDescription>
              </Stat>
              <Stat>
                <StatLabel>Overdue</StatLabel>
                <StatValue>{summary?.overdueCount ?? 0}</StatValue>
                <StatDescription>{summary?.achievedCount ?? 0} achieved so far</StatDescription>
              </Stat>
            </StatGrid>

            <DataTableToolbar
              searchValue={filters.search}
              onSearchChange={(value) => setFilter("search", value)}
              searchPlaceholder="Search goals..."
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
                        disabled={isLimitReached}
                        onClick={() => setAiOpen(true)}
                      />
                    )}
                    <ActionButton
                      icon={Plus}
                      label="New goal"
                      onClick={openCreate}
                      disabled={isLimitReached}
                      title={
                        isLimitReached
                          ? `Your plan allows ${limit} goals. Delete one or upgrade to add more.`
                          : undefined
                      }
                    />
                  </>
                )
              }
            />

            {isLimitReached && (
              <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
                You have used all {limit} goals your plan allows. Delete one or upgrade your
                subscription to add more.
              </p>
            )}

            <DataTable
              columns={columns}
              data={goals}
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
              mobileCard={(goal) => (
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      className="min-w-0 cursor-pointer text-left"
                      onClick={() => openDetail(goal)}
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
                      <dt className="text-muted-foreground">Accountable</dt>
                      <dd className="truncate font-medium">{goal.owner?.name ?? "Unassigned"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Department</dt>
                      <dd className="truncate font-medium">{goal.department?.name ?? "—"}</dd>
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
                    {goal.isDueSoon && <StatusBadge color="amber" label="Due soon" />}
                    <TagList tags={goal.tags} emptyLabel="" />
                  </div>

                  <div className="mt-3 border-t pt-3">
                    <GoalRowActions goal={goal} {...rowActions} />
                  </div>
                </div>
              )}
            />
          </TabsContent>
        )}

        <TabsContent value="shared">
          <SharedGoalsList onOpen={openDetail} onEdit={openEdit} onCheckIn={openCheckIn} />
        </TabsContent>
      </Tabs>

      <GoalFormModal open={formOpen} onOpenChange={setFormOpen} goal={editing} />

      <GoalCheckInModal open={checkInOpen} onOpenChange={setCheckInOpen} goal={checkingIn} />

      <GoalDetailSheet
        goal={reading}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEditGoal={(goal) => {
          setDetailOpen(false);
          openEdit(goal);
        }}
        onCheckIn={(goal) => {
          setDetailOpen(false);
          openCheckIn(goal);
        }}
        canEdit={access.canEdit}
        canDelete={access.canDelete}
      />

      <AiGoalModal open={aiOpen} onOpenChange={setAiOpen} />

      <ShareResourceDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        resourceType="GOAL"
        resourceId={sharing?._id ?? null}
        resourceTitle={sharing?.title ?? ""}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="Its key results and check-ins go with it, and any goal rolling up into it stands on its own. Archive it instead if you may want it back."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
