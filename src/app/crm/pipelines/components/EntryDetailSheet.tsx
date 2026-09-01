import { ColorChip } from "@/components/shared/color-chip";
import { StatusBadge } from "@/components/shared/status-badge";
import { TagList } from "@/components/shared/tag-list";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDate, formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useDeletePipelineEntryMutation, useGetPipelineEntryQuery } from "@/redux/apis/pipelineApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  PIPELINE_ENTRY_PRIORITY_COLORS,
  PIPELINE_ENTRY_PRIORITY_LABELS,
  PIPELINE_ENTRY_STATUS_COLORS,
  PIPELINE_ENTRY_STATUS_LABELS,
  type PipelineActivity,
  type PipelineEntry,
} from "@/types/domain/pipeline";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ActivityTimeline } from "./ActivityTimeline";
import { formatMoney } from "../pipeline.helpers";

interface EntryDetailSheetProps {
  entry: PipelineEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditEntry: (entry: PipelineEntry) => void;
  onLogActivity: (entry: PipelineEntry) => void;
  onEditActivity: (entry: PipelineEntry, activity: PipelineActivity) => void;
  canEdit: boolean;
  canCreate: boolean;
  canDelete: boolean;
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

export function EntryDetailSheet({
  entry,
  open,
  onOpenChange,
  onEditEntry,
  onLogActivity,
  onEditActivity,
  canEdit,
  canCreate,
  canDelete,
}: EntryDetailSheetProps) {
  const { data: fresh } = useGetPipelineEntryQuery(entry?._id ?? "", { skip: !entry || !open });
  const [deleteEntry, { isLoading: isDeleting }] = useDeletePipelineEntryMutation();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const current = fresh ?? entry;

  const confirmDelete = async () => {
    if (!current) return;
    try {
      await deleteEntry(current._id).unwrap();
      toast.success("Contact removed from the pipeline");
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the card");
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
          aria-describedby={undefined}
        >
          {current && (
            <>
              <SheetHeader className="space-y-2 border-b px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <SheetTitle className="truncate text-base">
                      {current.title || "Untitled"}
                    </SheetTitle>
                    <SheetDescription className="truncate">
                      {current.contact?.name || "No contact"}
                      {current.contact?.email ? ` · ${current.contact.email}` : ""}
                    </SheetDescription>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {canEdit && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Edit card"
                        title="Edit card"
                        className="size-8 cursor-pointer"
                        onClick={() => onEditEntry(current)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Remove card"
                        title="Remove card"
                        className="size-8 cursor-pointer text-destructive hover:text-destructive"
                        onClick={() => setConfirmOpen(true)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {current.stage && (
                    <ColorChip color={current.stage.color} label={current.stage.name} />
                  )}
                  <StatusBadge
                    color={PIPELINE_ENTRY_STATUS_COLORS[current.status]}
                    label={PIPELINE_ENTRY_STATUS_LABELS[current.status]}
                  />
                  <StatusBadge
                    color={PIPELINE_ENTRY_PRIORITY_COLORS[current.priority]}
                    label={PIPELINE_ENTRY_PRIORITY_LABELS[current.priority]}
                  />
                  {current.isRotting && <StatusBadge color="amber" label="Going stale" />}
                  {current.isOverdue && <StatusBadge color="red" label="Follow-up overdue" />}
                </div>
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <dl className="divide-y">
                  <DetailRow label="Value">
                    {current.value > 0 ? formatMoney(current.value, current.currency) : "—"}
                  </DetailRow>
                  <DetailRow label="Weighted value">
                    {current.weightedValue > 0
                      ? formatMoney(current.weightedValue, current.currency)
                      : "—"}
                  </DetailRow>
                  <DetailRow label="Owner">{current.owner?.name ?? "Unassigned"}</DetailRow>
                  <DetailRow label="Lead source">
                    {current.leadSource ? (
                      <ColorChip
                        color={current.leadSource.color}
                        label={current.leadSource.name}
                      />
                    ) : (
                      "—"
                    )}
                  </DetailRow>
                  <DetailRow label="Phone">{current.contact?.phone || "—"}</DetailRow>
                  <DetailRow label="In this stage since">
                    {formatDateTime(current.enteredStageAt)} ({current.daysInStage}d)
                  </DetailRow>
                  <DetailRow label="Expected close">
                    {formatDate(current.expectedCloseDate)}
                  </DetailRow>
                  <DetailRow label="Last activity">
                    {formatDateTime(current.lastActivityAt)}
                  </DetailRow>
                  <DetailRow label="Next activity">
                    <span className={cn(current.isOverdue && "text-red-600 dark:text-red-400")}>
                      {formatDateTime(current.nextActivityAt)}
                    </span>
                  </DetailRow>
                  {current.closedAt && (
                    <DetailRow label="Closed">{formatDateTime(current.closedAt)}</DetailRow>
                  )}
                  {current.lostReason && (
                    <DetailRow label="Lost because">{current.lostReason}</DetailRow>
                  )}
                  <DetailRow label="Tags">
                    <TagList tags={current.tags} max={6} className="justify-end" />
                  </DetailRow>
                </dl>

                {current.notes && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{current.notes}</p>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Activity</p>
                    <p className="text-xs text-muted-foreground">
                      Every call, meeting and stage move, to the minute.
                    </p>
                  </div>
                  {canCreate && (
                    <Button
                      type="button"
                      size="sm"
                      className="shrink-0 cursor-pointer gap-1.5"
                      onClick={() => onLogActivity(current)}
                    >
                      <Plus className="size-4" />
                      Log
                    </Button>
                  )}
                </div>

                <ActivityTimeline
                  pipelineId={current.pipelineId}
                  entryId={current._id}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onEdit={(activity) => onEditActivity(current, activity)}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Remove "${current?.title ?? ""}" from this pipeline?`}
        description="The contact itself is kept. The card and its activity history stop showing on the board."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
