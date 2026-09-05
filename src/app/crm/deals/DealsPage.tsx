import { ActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
import { PageHeader } from "@/components/shared/page-header";
import { RowActions } from "@/components/shared/row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar, type FilterConfig } from "@/components/ui/data-table-toolbar";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Stat, StatDescription, StatGrid, StatLabel, StatValue } from "@/components/ui/stat";
import { Textarea } from "@/components/ui/textarea";
import { useModulePermission } from "@/hooks/use-permission";
import { useQueryFilters } from "@/hooks/use-query-filters";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  useDeleteDealMutation,
  useGetDealBoardQuery,
  useGetDealSummaryQuery,
  useGetDealsQuery,
  useMoveDealMutation,
  useUpdateDealMutation,
} from "@/redux/apis/dealApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import { useGetPipelineOptionsQuery } from "@/redux/apis/pipelineApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { CrmActivity } from "@/types/domain/crmActivity";
import {
  DEAL_PRIORITIES,
  DEAL_PRIORITY_COLORS,
  DEAL_PRIORITY_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_STATUS_LABELS,
  DEAL_STATUSES,
  type Deal,
  type DealPriority,
  type DealStatus,
} from "@/types/domain/deal";
import { Columns3, PanelRightOpen, Pencil, Plus, Table2, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ActivityFormModal } from "../activities/components/ActivityFormModal";
import { formatMoney } from "./deal.helpers";
import { dealColumns } from "./deals.columns";
import { DealBoard, type DealMove } from "./components/DealBoard";
import { DealDetailSheet } from "./components/DealDetailSheet";
import { DealFormModal } from "./components/DealFormModal";

type ViewMode = "table" | "board";

export default function DealsPage() {
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/crm/deals");

  const view: ViewMode = filters.view === "board" ? "board" : "table";
  const pipelineId = (filters.pipelineId as string | undefined) ?? "";

  const { data: pipelineOptions = [] } = useGetPipelineOptionsQuery();
  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const boardPipelineId = pipelineId || pipelineOptions[0]?._id || "";

  const { data: summary } = useGetDealSummaryQuery({
    pipelineId: pipelineId || undefined,
    ownerId: filters.ownerId as string | undefined,
  });

  const { data: tableResult, isLoading: isTableLoading, isFetching: isTableFetching } =
    useGetDealsQuery(
      {
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
        pipelineId: pipelineId || undefined,
        ownerId: filters.ownerId as string | undefined,
        status: filters.status as DealStatus | undefined,
        priority: filters.priority as DealPriority | undefined,
      },
      { skip: view !== "table" }
    );

  const {
    data: board,
    isLoading: isBoardLoading,
    isFetching: isBoardFetching,
  } = useGetDealBoardQuery(
    {
      pipelineId: boardPipelineId,
      search: filters.search,
      ownerId: filters.ownerId as string | undefined,
      status: filters.status as DealStatus | undefined,
      priority: filters.priority as DealPriority | undefined,
    },
    { skip: view !== "board" || !boardPipelineId }
  );

  const [moveDeal] = useMoveDealMutation();
  const [updateDeal, { isLoading: isSavingReason }] = useUpdateDealMutation();
  const [deleteDeal, { isLoading: isDeleting }] = useDeleteDealMutation();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Deal | null>(null);
  const [formStageId, setFormStageId] = React.useState<string | undefined>(undefined);

  const [detailDeal, setDetailDeal] = React.useState<Deal | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const [activityOpen, setActivityOpen] = React.useState(false);
  const [activityDeal, setActivityDeal] = React.useState<Deal | null>(null);
  const [editingActivity, setEditingActivity] = React.useState<CrmActivity | null>(null);

  const [pendingDelete, setPendingDelete] = React.useState<Deal | null>(null);
  const [lostDealId, setLostDealId] = React.useState<string | null>(null);
  const [lostReason, setLostReason] = React.useState("");

  const toolbarFilters = React.useMemo<FilterConfig[]>(
    () => [
      {
        name: "pipelineId",
        label: "Pipeline",
        type: "select",
        options: pipelineOptions.map((row) => ({ label: row.name, value: row._id })),
        hideAllOption: view === "board",
      },
      {
        name: "ownerId",
        label: "Owner",
        type: "select",
        options: employeeOptions.map((employee) => ({
          label: employee.name,
          value: employee._id,
        })),
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        options: DEAL_PRIORITIES.map((priority) => ({
          label: DEAL_PRIORITY_LABELS[priority],
          value: priority,
        })),
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: DEAL_STATUSES.map((status) => ({
          label: DEAL_STATUS_LABELS[status],
          value: status,
        })),
      },
    ],
    [pipelineOptions, employeeOptions, view]
  );

  const openCreate = (stageId?: string) => {
    setEditing(null);
    setFormStageId(stageId);
    setFormOpen(true);
  };

  const openEdit = (deal: Deal) => {
    setEditing(deal);
    setFormStageId(deal.stageId);
    setFormOpen(true);
  };

  const openDetail = (deal: Deal) => {
    setDetailDeal(deal);
    setDetailOpen(true);
  };

  const handleMove = async (move: DealMove) => {
    try {
      await moveDeal({
        id: move.dealId,
        body: { stageId: move.stageId, position: move.position },
      }).unwrap();

      toast.success(`Moved to ${move.stageName}`);

      if (move.stageType === "LOST") {
        setLostReason("");
        setLostDealId(move.dealId);
      }
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not move the deal");
    }
  };

  const saveLostReason = async () => {
    if (!lostDealId) return;
    try {
      await updateDeal({ id: lostDealId, body: { lostReason } }).unwrap();
      toast.success("Reason saved");
      setLostDealId(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not save the reason");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteDeal(pendingDelete._id).unwrap();
      toast.success("Deal deleted");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the deal");
    }
  };

  const rowActions = React.useMemo(
    () => ({
      onOpen: openDetail,
      onEdit: openEdit,
      onDelete: setPendingDelete,
      canEdit: access.canEdit,
      canDelete: access.canDelete,
    }),
    [access.canEdit, access.canDelete]
  );

  const columns = React.useMemo(() => dealColumns(rowActions), [rowActions]);

  const deals = tableResult?.data ?? [];
  const meta = tableResult?.meta;
  const used = summary?.used ?? 0;
  const limit = summary?.limit ?? access.limit;
  const isLimitReached = limit !== null && used >= limit;
  const currency = board?.pipeline.currency ?? deals[0]?.currency ?? "BDT";

  return (
    <>
      <PageHeader
        title="Deals"
        description="Open opportunities and the stage each one sits at, from first conversation to signed."
        actions={
          <div className="flex items-center gap-1 rounded-lg border p-0.5">
            <Button
              type="button"
              variant={view === "table" ? "secondary" : "ghost"}
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => setFilter("view", undefined)}
            >
              <Table2 className="size-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
            <Button
              type="button"
              variant={view === "board" ? "secondary" : "ghost"}
              size="sm"
              className="cursor-pointer gap-1.5"
              onClick={() => setFilter("view", "board")}
            >
              <Columns3 className="size-4" />
              <span className="hidden sm:inline">Board</span>
            </Button>
          </div>
        }
      />

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Deals</StatLabel>
          <StatValue>{used}</StatValue>
          <StatDescription>
            {limit === null ? "Unlimited on your plan" : `${used} of ${limit} allowed by your plan`}
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Open value</StatLabel>
          <StatValue>{formatMoney(summary?.openValue ?? 0, currency)}</StatValue>
          <StatDescription>
            {formatMoney(summary?.weightedValue ?? 0, currency)} weighted ·{" "}
            {summary?.openCount ?? 0} open
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Won</StatLabel>
          <StatValue>{formatMoney(summary?.wonValue ?? 0, currency)}</StatValue>
          <StatDescription>
            {summary?.winRate ?? 0}% win rate · {summary?.lostCount ?? 0} lost
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Needs attention</StatLabel>
          <StatValue>{summary?.overdueCount ?? 0}</StatValue>
          <StatDescription>
            {summary?.rottingCount ?? 0} sitting too long in a stage
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search deals and contacts..."
        filters={toolbarFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={view === "board" ? isBoardFetching : isTableFetching}
        actions={
          access.canCreate && (
            <ActionButton
              icon={Plus}
              label="New deal"
              onClick={() => openCreate()}
              disabled={isLimitReached}
              title={
                isLimitReached
                  ? `Your plan allows ${limit} deals. Delete one or upgrade to add more.`
                  : undefined
              }
            />
          )
        }
      />

      {isLimitReached && (
        <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          You have used all {limit} deals your plan allows. Delete one or upgrade your subscription
          to add more.
        </p>
      )}

      {view === "board" ? (
        isBoardLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : !boardPipelineId ? (
          <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
            Create a pipeline first. Deals move through the stages you define there.
          </p>
        ) : board ? (
          <DealBoard
            board={board}
            canCreate={access.canCreate}
            canEdit={access.canEdit}
            onOpenDeal={openDetail}
            onAddToStage={(stageId) => openCreate(stageId)}
            onMove={(move) => void handleMove(move)}
          />
        ) : (
          <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
            That pipeline could not be loaded.
          </p>
        )
      ) : (
        <DataTable
          columns={columns}
          data={deals}
          isLoading={isTableLoading}
          pagination={
            meta
              ? { page: meta.page, limit: meta.limit, total: meta.total, pages: meta.totalPages }
              : undefined
          }
          onPageChange={(page) => setFilter("page", page)}
          onLimitChange={(nextLimit) => setFilter("limit", nextLimit)}
          getRowId={(row) => row._id}
          mobileCard={(deal) => (
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="min-w-0 cursor-pointer text-left"
                  onClick={() => openDetail(deal)}
                >
                  <p className="truncate font-semibold">{deal.title}</p>
                  <p className="truncate font-mono text-xs uppercase text-muted-foreground">
                    {deal.code}
                  </p>
                </button>
                <StatusBadge
                  color={DEAL_STATUS_COLORS[deal.status]}
                  label={DEAL_STATUS_LABELS[deal.status]}
                />
              </div>

              <dl className="mt-3 grid gap-1 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Contact</dt>
                  <dd className="truncate font-medium">{deal.contact?.name || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Value</dt>
                  <dd className="font-medium tabular-nums">
                    {deal.value > 0 ? formatMoney(deal.value, deal.currency) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Expected close</dt>
                  <dd
                    className={cn(
                      "font-medium",
                      deal.isOverdue && "text-red-600 dark:text-red-400"
                    )}
                  >
                    {formatDate(deal.expectedCloseDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Owner</dt>
                  <dd className="truncate font-medium">{deal.owner?.name || "Unassigned"}</dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge
                  color={DEAL_PRIORITY_COLORS[deal.priority]}
                  label={DEAL_PRIORITY_LABELS[deal.priority]}
                />
                {deal.stage && <ColorChip color={deal.stage.color} label={deal.stage.name} />}
                <TagList tags={deal.tags} emptyLabel="" />
              </div>

              <div className="mt-3 border-t pt-3">
                <RowActions
                  label={`Actions for ${deal.title}`}
                  actions={[
                    {
                      key: "open",
                      label: "Open",
                      icon: PanelRightOpen,
                      onSelect: () => openDetail(deal),
                    },
                    {
                      key: "activity",
                      label: "Log activity",
                      icon: Plus,
                      disabled: !access.canCreate,
                      onSelect: () => {
                        setActivityDeal(deal);
                        setEditingActivity(null);
                        setActivityOpen(true);
                      },
                    },
                    {
                      key: "edit",
                      label: "Edit",
                      icon: Pencil,
                      disabled: !access.canEdit,
                      onSelect: () => openEdit(deal),
                    },
                    {
                      key: "delete",
                      label: "Delete",
                      icon: Trash2,
                      variant: "destructive",
                      separated: true,
                      disabled: !access.canDelete,
                      onSelect: () => setPendingDelete(deal),
                    },
                  ]}
                />
              </div>
            </div>
          )}
        />
      )}

      <DealFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        deal={editing}
        defaultPipelineId={boardPipelineId || undefined}
        defaultStageId={formStageId}
      />

      <DealDetailSheet
        deal={detailDeal}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        canEdit={access.canEdit}
        canCreate={access.canCreate}
        canDelete={access.canDelete}
        onEditDeal={openEdit}
        onLogActivity={(deal) => {
          setActivityDeal(deal);
          setEditingActivity(null);
          setActivityOpen(true);
        }}
        onEditActivity={(deal, activity) => {
          setActivityDeal(deal);
          setEditingActivity(activity);
          setActivityOpen(true);
        }}
      />

      {activityDeal && (
        <ActivityFormModal
          open={activityOpen}
          onOpenChange={setActivityOpen}
          activity={editingActivity}
          target={{ relatedType: "DEAL", dealId: activityDeal._id }}
          lockTarget
        />
      )}

      <Dialog open={Boolean(lostDealId)} onOpenChange={(open) => !open && setLostDealId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Why was it lost?</DialogTitle>
            <DialogDescription>
              Worth a line now. It is what tells you where deals keep slipping.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Textarea
              value={lostReason}
              onChange={(event) => setLostReason(event.target.value)}
              placeholder="Went with a cheaper supplier"
              maxLength={500}
              autoFocus
            />
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLostDealId(null)}>
              Skip
            </Button>
            <Button
              type="button"
              disabled={isSavingReason || lostReason.trim() === ""}
              onClick={() => void saveLostReason()}
            >
              Save reason
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title ?? ""}"?`}
        description="The deal and its activity history stop showing. The contact and lead behind it are kept."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
