import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { safeDistanceToNow, safeFormat } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  useDeleteCrmActivityMutation,
  useGetCrmActivitiesQuery,
  useUpdateCrmActivityMutation,
} from "@/redux/apis/crmActivityApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  CRM_ACTIVITY_OUTCOME_LABELS,
  CRM_ACTIVITY_RELATED_LABELS,
  CRM_ACTIVITY_TYPE_LABELS,
  type CrmActivity,
  type CrmActivityListQuery,
} from "@/types/domain/crmActivity";
import { AlarmClock, ArrowRightLeft, Check, MapPin, Pencil, Pin, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { ACTIVITY_ICONS, relatedNameOf } from "../activity.helpers";

const dayKeyOf = (iso: string): string => safeFormat(iso, "yyyy-MM-dd", "");

const dayLabelOf = (iso: string): string => safeFormat(iso, "EEEE, d MMMM yyyy", "Unknown date");

interface ActivityTimelineProps {
  filter: CrmActivityListQuery;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (activity: CrmActivity) => void;
  showRelated?: boolean;
  emptyText?: string;
}

export function ActivityTimeline({
  filter,
  canEdit,
  canDelete,
  onEdit,
  showRelated = false,
  emptyText = "Nothing logged yet. Record the first call, demo or note.",
}: ActivityTimelineProps) {
  const { data, isLoading } = useGetCrmActivitiesQuery({
    limit: 100,
    sortBy: "occurredAt",
    sortOrder: "desc",
    ...filter,
  });

  const [updateActivity] = useUpdateCrmActivityMutation();
  const [deleteActivity, { isLoading: isDeleting }] = useDeleteCrmActivityMutation();
  const [pendingDelete, setPendingDelete] = React.useState<CrmActivity | null>(null);

  const activities = React.useMemo(() => data?.data ?? [], [data]);

  const groups = React.useMemo(() => {
    const byDay = new Map<string, CrmActivity[]>();

    activities.forEach((activity) => {
      const key = dayKeyOf(activity.occurredAt);
      const bucket = byDay.get(key) ?? [];
      bucket.push(activity);
      byDay.set(key, bucket);
    });

    return [...byDay.entries()].sort((left, right) => right[0].localeCompare(left[0]));
  }, [activities]);

  const complete = async (activity: CrmActivity) => {
    try {
      await updateActivity({ id: activity._id, body: { isCompleted: true } }).unwrap();
      toast.success("Marked done");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the activity");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteActivity(pendingDelete._id).unwrap();
      toast.success("Activity removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the activity");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {groups.map(([day, rows]) => (
          <section key={day} className="space-y-2">
            <h4 className="sticky top-0 z-10 bg-background/95 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase backdrop-blur">
              {dayLabelOf(rows[0].occurredAt)}
            </h4>

            <ol className="space-y-2 border-l pl-4">
              {rows.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type];
                const isSystem = activity.source === "SYSTEM";

                return (
                  <li key={activity._id} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[26px] flex size-5 items-center justify-center rounded-full border bg-background",
                        activity.isOverdue && "border-red-500 text-red-600 dark:text-red-400",
                        !activity.isOverdue && isSystem && "text-muted-foreground",
                        !activity.isOverdue && !isSystem && "border-primary/50 text-primary"
                      )}
                      aria-hidden
                    >
                      <Icon className="size-3" />
                    </span>

                    <div
                      className={cn(
                        "rounded-lg border p-3",
                        isSystem ? "bg-muted/30" : "bg-card",
                        activity.isPinned && "ring-1 ring-primary/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-sm font-medium">
                            {activity.isPinned && (
                              <Pin className="mr-1 inline size-3 text-primary" aria-hidden />
                            )}
                            {activity.subject}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <time dateTime={activity.occurredAt} className="font-medium">
                              {safeFormat(activity.occurredAt, "hh:mm a")}
                            </time>
                            {" · "}
                            {CRM_ACTIVITY_TYPE_LABELS[activity.type]}
                            {activity.durationMinutes > 0 && ` · ${activity.durationMinutes} min`}
                          </p>
                        </div>

                        {!isSystem && (
                          <div className="flex shrink-0 gap-1">
                            {!activity.isCompleted && canEdit && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Mark done"
                                title="Mark done"
                                className="size-7 cursor-pointer"
                                onClick={() => void complete(activity)}
                              >
                                <Check className="size-3.5" />
                              </Button>
                            )}
                            {canEdit && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Edit activity"
                                title="Edit activity"
                                className="size-7 cursor-pointer"
                                onClick={() => onEdit(activity)}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Delete activity"
                                title="Delete activity"
                                className="size-7 cursor-pointer text-destructive hover:text-destructive"
                                onClick={() => setPendingDelete(activity)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {activity.body && (
                        <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                          {activity.body}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {showRelated && (
                          <Badge variant="secondary" className="text-[11px]">
                            {CRM_ACTIVITY_RELATED_LABELS[activity.relatedType]} ·{" "}
                            {relatedNameOf(activity)}
                          </Badge>
                        )}

                        {activity.fromStage && activity.toStage && (
                          <Badge variant="outline" className="gap-1 text-[11px]">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: activity.fromStage.color }}
                              aria-hidden
                            />
                            {activity.fromStage.name}
                            <ArrowRightLeft className="size-3" aria-hidden />
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: activity.toStage.color }}
                              aria-hidden
                            />
                            {activity.toStage.name}
                          </Badge>
                        )}

                        {activity.outcome !== "NONE" && (
                          <Badge variant="secondary" className="text-[11px]">
                            {CRM_ACTIVITY_OUTCOME_LABELS[activity.outcome]}
                          </Badge>
                        )}

                        {activity.location && (
                          <Badge variant="outline" className="gap-1 text-[11px]">
                            <MapPin className="size-3" aria-hidden />
                            {activity.location}
                          </Badge>
                        )}

                        {activity.performedBy && (
                          <Badge variant="outline" className="text-[11px]">
                            {activity.performedBy.name}
                          </Badge>
                        )}

                        {!activity.isCompleted && activity.dueAt && (
                          <Badge
                            variant={activity.isOverdue ? "destructive" : "outline"}
                            className="gap-1 text-[11px]"
                          >
                            <AlarmClock className="size-3" aria-hidden />
                            Due {safeFormat(activity.dueAt, "d MMM, hh:mm a")}
                            {activity.isOverdue && ` · ${safeDistanceToNow(activity.dueAt)}`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this activity?"
        description="It disappears from the timeline. The record it sits on is untouched."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
