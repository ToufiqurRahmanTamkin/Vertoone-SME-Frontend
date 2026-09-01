import { ActionButton } from "@/components/shared/action-button";
import { ColorChip } from "@/components/shared/color-chip";
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
import { useGetEmployeeOptionsQuery } from "@/redux/apis/employeeApis";
import {
  useDeletePipelineMutation,
  useGetPipelineBoardQuery,
  useGetPipelineEntrySummaryQuery,
  useMovePipelineEntryMutation,
  useUpdatePipelineEntryMutation,
} from "@/redux/apis/pipelineApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PIPELINE_ENTRY_PRIORITIES,
  PIPELINE_ENTRY_PRIORITY_LABELS,
  PIPELINE_ENTRY_STATUS_LABELS,
  PIPELINE_ENTRY_STATUSES,
  type PipelineActivity,
  type PipelineEntry,
  type PipelineEntryPriority,
  type PipelineEntryStatus,
} from "@/types/domain/pipeline";
import { ArrowLeft, Pencil, Plus, Star, Trash2 } from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ActivityFormModal } from "./components/ActivityFormModal";
import { EntryDetailSheet } from "./components/EntryDetailSheet";
import { EntryFormModal } from "./components/EntryFormModal";
import { PipelineBoard, type EntryMove } from "./components/PipelineBoard";
import { PipelineFormModal } from "./components/PipelineFormModal";
import { formatMoney } from "./pipeline.helpers";

export default function PipelineDetailPage() {
  const { id = "" } = useParams();
  const { filters, setFilter, clearFilters } = useQueryFilters();
  const access = useModulePermission("/crm/pipelines");
  const navigate = useNavigate();

  const { data: employeeOptions = [] } = useGetEmployeeOptionsQuery();

  const {
    data: board,
    isLoading,
    isFetching,
    isError,
  } = useGetPipelineBoardQuery(
    {
      pipelineId: id,
      search: filters.search,
      ownerId: filters.ownerId as string | undefined,
      priority: filters.priority as PipelineEntryPriority | undefined,
      status: filters.status as PipelineEntryStatus | undefined,
    },
    { skip: !id }
  );

  const { data: entrySummary } = useGetPipelineEntrySummaryQuery({ pipelineId: id }, { skip: !id });

  const [moveEntry] = useMovePipelineEntryMutation();
  const [updateEntry, { isLoading: isSavingReason }] = useUpdatePipelineEntryMutation();
  const [deletePipeline, { isLoading: isDeletingPipeline }] = useDeletePipelineMutation();

  const [pipelineFormOpen, setPipelineFormOpen] = React.useState(false);
  const [pipelinePendingDelete, setPipelinePendingDelete] = React.useState(false);

  const [entryFormOpen, setEntryFormOpen] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<PipelineEntry | null>(null);
  const [entryStageId, setEntryStageId] = React.useState<string | undefined>(undefined);

  const [detailEntry, setDetailEntry] = React.useState<PipelineEntry | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const [activityOpen, setActivityOpen] = React.useState(false);
  const [activityEntry, setActivityEntry] = React.useState<PipelineEntry | null>(null);
  const [editingActivity, setEditingActivity] = React.useState<PipelineActivity | null>(null);

  const [lostEntryId, setLostEntryId] = React.useState<string | null>(null);
  const [lostReason, setLostReason] = React.useState("");

  const pipeline = board?.pipeline;

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
        options: PIPELINE_ENTRY_PRIORITIES.map((priority) => ({
          label: PIPELINE_ENTRY_PRIORITY_LABELS[priority],
          value: priority,
        })),
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: PIPELINE_ENTRY_STATUSES.map((status) => ({
          label: PIPELINE_ENTRY_STATUS_LABELS[status],
          value: status,
        })),
      },
    ],
    [employeeOptions]
  );

  const handleMove = async (move: EntryMove) => {
    try {
      await moveEntry({
        id: move.entryId,
        body: { stageId: move.stageId, position: move.position },
      }).unwrap();

      toast.success(`Moved to ${move.stageName}`);

      if (move.stageType === "LOST") {
        setLostReason("");
        setLostEntryId(move.entryId);
      }
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not move the card");
    }
  };

  const saveLostReason = async () => {
    if (!lostEntryId) return;
    try {
      await updateEntry({ id: lostEntryId, body: { lostReason } }).unwrap();
      toast.success("Reason saved");
      setLostEntryId(null);
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !board || !pipeline) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
        <p className="font-semibold">Pipeline not found</p>
        <p className="text-sm text-muted-foreground">
          It may have been deleted, or you may not have access to it.
        </p>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer gap-1.5"
          onClick={() => navigate("/crm/pipelines")}
        >
          <ArrowLeft className="size-4" />
          Back to pipelines
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
        onClick={() => navigate("/crm/pipelines")}
      >
        <ArrowLeft className="size-4" />
        All pipelines
      </Button>

      <PageHeader
        title={pipeline.name}
        description={
          pipeline.description ||
          "Drag a card from one stage to the next as the conversation moves on."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
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
            {access.canCreate && (
              <ActionButton
                icon={Plus}
                label="Add contact"
                onClick={() => {
                  setEditingEntry(null);
                  setEntryStageId(undefined);
                  setEntryFormOpen(true);
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
        <Badge variant="outline">{pipeline.currency}</Badge>
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
          <StatLabel>Cards</StatLabel>
          <StatValue>{entrySummary?.total ?? 0}</StatValue>
          <StatDescription>{entrySummary?.openCount ?? 0} still open</StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Open value</StatLabel>
          <StatValue>{formatMoney(entrySummary?.openValue ?? 0, pipeline.currency)}</StatValue>
          <StatDescription>
            {formatMoney(entrySummary?.weightedValue ?? 0, pipeline.currency)} weighted by stage
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Won</StatLabel>
          <StatValue>{formatMoney(entrySummary?.wonValue ?? 0, pipeline.currency)}</StatValue>
          <StatDescription>
            {entrySummary?.wonCount ?? 0} won · {entrySummary?.lostCount ?? 0} lost
          </StatDescription>
        </Stat>
        <Stat>
          <StatLabel>Needs attention</StatLabel>
          <StatValue>{entrySummary?.overdueCount ?? 0}</StatValue>
          <StatDescription>
            {entrySummary?.rottingCount ?? 0} sitting too long in a stage
          </StatDescription>
        </Stat>
      </StatGrid>

      <DataTableToolbar
        searchValue={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search cards and contacts..."
        filters={toolbarFilters}
        currentFilters={filters}
        onFilterChange={setFilter}
        onClear={clearFilters}
        isLoading={isFetching}
      />

      <PipelineBoard
        board={board}
        canCreate={access.canCreate}
        canEdit={access.canEdit}
        onOpenEntry={(entry) => {
          setDetailEntry(entry);
          setDetailOpen(true);
        }}
        onAddToStage={(stageId) => {
          setEditingEntry(null);
          setEntryStageId(stageId);
          setEntryFormOpen(true);
        }}
        onMove={(move) => void handleMove(move)}
      />

      <PipelineFormModal
        open={pipelineFormOpen}
        onOpenChange={setPipelineFormOpen}
        pipeline={pipeline}
      />

      <EntryFormModal
        open={entryFormOpen}
        onOpenChange={setEntryFormOpen}
        pipeline={pipeline}
        entry={editingEntry}
        defaultStageId={entryStageId}
      />

      <EntryDetailSheet
        entry={detailEntry}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        canEdit={access.canEdit}
        canCreate={access.canCreate}
        canDelete={access.canDelete}
        onEditEntry={(entry) => {
          setEditingEntry(entry);
          setEntryStageId(entry.stageId);
          setEntryFormOpen(true);
        }}
        onLogActivity={(entry) => {
          setActivityEntry(entry);
          setEditingActivity(null);
          setActivityOpen(true);
        }}
        onEditActivity={(entry, activity) => {
          setActivityEntry(entry);
          setEditingActivity(activity);
          setActivityOpen(true);
        }}
      />

      {activityEntry && (
        <ActivityFormModal
          open={activityOpen}
          onOpenChange={setActivityOpen}
          pipelineId={activityEntry.pipelineId}
          entryId={activityEntry._id}
          contactId={activityEntry.contactId}
          activity={editingActivity}
        />
      )}

      <Dialog open={Boolean(lostEntryId)} onOpenChange={(open) => !open && setLostEntryId(null)}>
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
            <Button type="button" variant="outline" onClick={() => setLostEntryId(null)}>
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
        description="Its cards and their activity history go with it. The contacts themselves are kept."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeletingPipeline}
        onConfirm={confirmDeletePipeline}
      />
    </>
  );
}
