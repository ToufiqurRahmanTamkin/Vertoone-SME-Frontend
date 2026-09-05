import { ActionButton } from "@/components/shared/action-button";
import { BackLink } from "@/components/shared/back-link";
import { ColorChip } from "@/components/shared/color-chip";
import { CurrencyNote } from "@/components/shared/currency-note";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { formatAmountValue } from "@/lib/amount";
import { useGetCrmActivitySummaryQuery } from "@/redux/apis/crmActivityApis";
import {
  useGetDealBoardQuery,
  useGetDealSummaryQuery,
  useMoveDealMutation,
  useUpdateDealMutation,
} from "@/redux/apis/dealApis";
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import {
  useDeletePipelineMutation,
  useGetPipelineQuery,
} from "@/redux/apis/pipelineApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { CrmActivity } from "@/types/domain/crmActivity";
import {
  DEAL_PRIORITIES,
  DEAL_PRIORITY_LABELS,
  DEAL_STATUS_LABELS,
  DEAL_STATUSES,
  type Deal,
  type DealPriority,
  type DealStatus,
} from "@/types/domain/deal";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ActivityFormModal } from "../activities/components/ActivityFormModal";
import { DealBoard, type DealMove } from "../deals/components/DealBoard";
import { DealDetailSheet } from "../deals/components/DealDetailSheet";
import { DealFormModal } from "../deals/components/DealFormModal";
import { PipelineFormModal } from "./components/PipelineFormModal";

export default function PipelineDetailPage() {
  const { id = "" } = useParams();
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/crm/pipelines");
  const dealAccess = useModulePermission("/crm/deals");
  const navigate = useNavigate();

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const {
    data: pipeline,
    isLoading: isPipelineLoading,
    isError,
  } = useGetPipelineQuery(id, { skip: !id });

  const {
    data: board,
    isLoading: isBoardLoading,
    isFetching,
  } = useGetDealBoardQuery(
    {
      pipelineId: id,
      search: filters.search,
      ownerId: filters.ownerId as string | undefined,
      priority: filters.priority as DealPriority | undefined,
      status: filters.status as DealStatus | undefined,
    },
    { skip: !id }
  );

  const { data: dealSummary } = useGetDealSummaryQuery({ pipelineId: id }, { skip: !id });
  const { data: activitySummary } = useGetCrmActivitySummaryQuery(
    { pipelineId: id },
    { skip: !id }
  );

  const [moveDeal] = useMoveDealMutation();
  const [updateDeal, { isLoading: isSavingReason }] = useUpdateDealMutation();
  const [deletePipeline, { isLoading: isDeletingPipeline }] = useDeletePipelineMutation();

  const [pipelineFormOpen, setPipelineFormOpen] = React.useState(false);
  const [pipelinePendingDelete, setPipelinePendingDelete] = React.useState(false);

  const [dealFormOpen, setDealFormOpen] = React.useState(false);
  const [editingDeal, setEditingDeal] = React.useState<Deal | null>(null);
  const [dealStageId, setDealStageId] = React.useState<string | undefined>(undefined);

  const [detailDeal, setDetailDeal] = React.useState<Deal | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const [activityOpen, setActivityOpen] = React.useState(false);
  const [activityDeal, setActivityDeal] = React.useState<Deal | null>(null);
  const [editingActivity, setEditingActivity] = React.useState<CrmActivity | null>(null);

  const [lostDealId, setLostDealId] = React.useState<string | null>(null);
  const [lostReason, setLostReason] = React.useState("");

  const toolbarFilters = React.useMemo<FilterConfig[]>(
    () => [
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
    [employeeOptions]
  );

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

  const confirmDeletePipeline = async () => {
    try {
      await deletePipeline(id).unwrap();
      toast.success("Pipeline deleted");
      setPipelinePendingDelete(false);
      navigate("/crm/pipelines");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the pipeline");
    }
  };

  if (isPipelineLoading || isBoardLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !pipeline) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
        <p className="font-semibold">Pipeline not found</p>
        <p className="text-sm text-muted-foreground">
          It may have been deleted, or you may not have access to it.
        </p>
        <BackLink to="/crm/pipelines" label="Back to pipelines" variant="outline" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={pipeline.name}
        description={
          pipeline.description ||
          "Drag a deal from one stage to the next as the conversation moves on."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <BackLink to="/crm/pipelines" label="All pipelines" />
            <CurrencyNote currency={pipeline.currency} />
            {access.canEdit && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Edit pipeline"
                title="Edit pipeline"
                className="size-9 cursor-pointer"
                onClick={() => setPipelineFormOpen(true)}
              >
                <Pencil className="size-4" />
              </Button>
            )}
            {access.canDelete && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Delete pipeline"
                title="Delete pipeline"
                className="size-9 cursor-pointer text-destructive hover:text-destructive"
                onClick={() => setPipelinePendingDelete(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
            {dealAccess.canCreate && (
              <ActionButton
                icon={Plus}
                label="New deal"
                onClick={() => {
                  setEditingDeal(null);
                  setDealStageId(undefined);
                  setDealFormOpen(true);
                }}
              />
            )}
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: `${pipeline.color}1a`, borderColor: `${pipeline.color}59` }}
        >
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: pipeline.color }}
            aria-hidden
          />
          {pipeline.stages.length} stages
        </span>
        {pipeline.contactType && (
          <ColorChip color={pipeline.contactType.color} label={pipeline.contactType.name} />
        )}
        <Badge variant="outline">{pipeline.owner?.name ?? "Unassigned"}</Badge>
        {pipeline.isDefault && (
          <Badge variant="secondary" className="gap-1">
            <Star className="size-3 fill-amber-400 text-amber-500" aria-hidden />
            Default
          </Badge>
        )}
        <StatusBadge
          color={pipeline.isActive ? "green" : "zinc"}
          label={pipeline.isActive ? "Active" : "Inactive"}
        />
      </div>

      <StatGrid className="sm:grid-cols-4">
        <Stat>
          <StatLabel>Deals</StatLabel>
          <StatValue>{dealSummary?.total ?? 0}</StatValue>
          <StatDescription>{dealSummary?.openCount ?? 0} still open</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Open value</StatLabel>
          <StatValue>{formatAmountValue(dealSummary?.openValue)}</StatValue>
          <StatDescription>
            {formatAmountValue(dealSummary?.weightedValue)} weighted by stage
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Won</StatLabel>
          <StatValue>{formatAmountValue(dealSummary?.wonValue)}</StatValue>
          <StatDescription>
            {dealSummary?.winRate ?? 0}% win rate · {dealSummary?.lostCount ?? 0} lost
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Needs attention</StatLabel>
          <StatValue>{dealSummary?.rottingCount ?? 0}</StatValue>
          <StatDescription>
            {activitySummary?.overdueCount ?? 0} overdue follow-ups on this pipeline
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
        isLoading={isFetching}
      />

      {board && board.columns.length > 0 ? (
        <DealBoard
          board={board}
          canCreate={dealAccess.canCreate}
          canEdit={dealAccess.canEdit}
          onOpenDeal={(deal) => {
            setDetailDeal(deal);
            setDetailOpen(true);
          }}
          onAddToStage={(stageId) => {
            setEditingDeal(null);
            setDealStageId(stageId);
            setDealFormOpen(true);
          }}
          onMove={(move) => void handleMove(move)}
        />
      ) : (
        <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          This pipeline has no stages yet. Edit it and add the stages a deal moves through.
        </p>
      )}

      <PipelineFormModal
        open={pipelineFormOpen}
        onOpenChange={setPipelineFormOpen}
        pipeline={pipeline}
      />

      <DealFormModal
        open={dealFormOpen}
        onOpenChange={setDealFormOpen}
        deal={editingDeal}
        defaultPipelineId={id}
        defaultStageId={dealStageId}
      />

      <DealDetailSheet
        deal={detailDeal}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        canEdit={dealAccess.canEdit}
        canCreate={dealAccess.canCreate}
        canDelete={dealAccess.canDelete}
        onEditDeal={(deal) => {
          setEditingDeal(deal);
          setDealStageId(deal.stageId);
          setDealFormOpen(true);
        }}
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
        open={pipelinePendingDelete}
        onOpenChange={setPipelinePendingDelete}
        title={`Delete "${pipeline.name}"?`}
        description="Its deals and their activity history go with it. The contacts themselves are kept."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeletingPipeline}
        onConfirm={confirmDeletePipeline}
      />
    </>
  );
}
