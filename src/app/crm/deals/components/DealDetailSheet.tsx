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
import { useDeleteDealMutation, useGetDealQuery } from "@/redux/apis/dealApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import type { CrmActivity } from "@/types/domain/crmActivity";
import {
  DEAL_PRIORITY_COLORS,
  DEAL_PRIORITY_LABELS,
  DEAL_STATUS_COLORS,
  DEAL_STATUS_LABELS,
  type Deal,
} from "@/types/domain/deal";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ActivityTimeline } from "../../activities/components/ActivityTimeline";
import { formatMoney } from "../deal.helpers";

interface DealDetailSheetProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditDeal: (deal: Deal) => void;
  onLogActivity: (deal: Deal) => void;
  onEditActivity: (deal: Deal, activity: CrmActivity) => void;
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

export function DealDetailSheet({
  deal,
  open,
  onOpenChange,
  onEditDeal,
  onLogActivity,
  onEditActivity,
  canEdit,
  canCreate,
  canDelete,
}: DealDetailSheetProps) {
  const { data: fresh } = useGetDealQuery(deal?._id ?? "", { skip: !deal || !open });
  const [deleteDeal, { isLoading: isDeleting }] = useDeleteDealMutation();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const current = fresh ?? deal;

  const confirmDelete = async () => {
    if (!current) return;
    try {
      await deleteDeal(current._id).unwrap();
      toast.success("Deal deleted");
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the deal");
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
                    <SheetTitle className="truncate text-base">{current.title}</SheetTitle>
                    <SheetDescription className="truncate">
                      <span className="font-mono uppercase">{current.code}</span>
                      {current.contact?.name ? ` · ${current.contact.name}` : ""}
                    </SheetDescription>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {canEdit && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Edit deal"
                        title="Edit deal"
                        className="size-8 cursor-pointer"
                        onClick={() => onEditDeal(current)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Delete deal"
                        title="Delete deal"
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
                    color={DEAL_STATUS_COLORS[current.status]}
                    label={DEAL_STATUS_LABELS[current.status]}
                  />
                  <StatusBadge
                    color={DEAL_PRIORITY_COLORS[current.priority]}
                    label={DEAL_PRIORITY_LABELS[current.priority]}
                  />
                  {current.isRotting && <StatusBadge color="amber" label="Going stale" />}
                  {current.isStale && !current.isRotting && (
                    <StatusBadge color="amber" label="No recent activity" />
                  )}
                  {current.isOverdue && <StatusBadge color="red" label="Follow-up overdue" />}
                </div>
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <dl className="divide-y">
                  <DetailRow label="Pipeline">{current.pipeline?.name ?? "—"}</DetailRow>
                  <DetailRow label="Value">
                    {current.value > 0 ? formatMoney(current.value, current.currency) : "—"}
                  </DetailRow>
                  <DetailRow label="Weighted value">
                    {current.weightedValue > 0
                      ? `${formatMoney(current.weightedValue, current.currency)} at ${current.probability}%`
                      : `${current.probability}%`}
                  </DetailRow>
                  <DetailRow label="Owner">{current.owner?.name ?? "Unassigned"}</DetailRow>
                  <DetailRow label="Contact">{current.contact?.name ?? "—"}</DetailRow>
                  <DetailRow label="Phone">{current.contact?.phone || "—"}</DetailRow>
                  <DetailRow label="Came from lead">
                    {current.lead ? `${current.lead.code} · ${current.lead.title}` : "—"}
                  </DetailRow>
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
                  <DetailRow label="In this stage since">
                    {formatDateTime(current.enteredStageAt)} ({current.daysInStage}d)
                  </DetailRow>
                  <DetailRow label="Expected close">
                    {formatDate(current.expectedCloseDate)}
                    {current.daysToClose !== null && current.status === "OPEN" && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({current.daysToClose < 0
                          ? `${Math.abs(current.daysToClose)}d overdue`
                          : `in ${current.daysToClose}d`})
                      </span>
                    )}
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

                {current.description && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm whitespace-pre-wrap">{current.description}</p>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Activity</p>
                    <p className="text-xs text-muted-foreground">
                      Every call, demo and stage move, to the minute.
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
                  filter={{ dealId: current._id }}
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
        title={`Delete "${current?.title ?? ""}"?`}
        description="The deal and its activity history stop showing. The contact and lead behind it are kept."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
