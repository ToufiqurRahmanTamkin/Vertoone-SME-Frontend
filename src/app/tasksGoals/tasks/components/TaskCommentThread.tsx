import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Textarea } from "@/components/ui/textarea";
import { safeDistanceToNow, safeFormat } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  useCreateTaskActivityMutation,
  useDeleteTaskActivityMutation,
  useGetTaskActivitiesQuery,
  useUpdateTaskActivityMutation,
} from "@/redux/apis/taskApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  TASK_ACTIVITY_TYPE_LABELS,
  type TaskActivity,
  type TaskActivityType,
} from "@/types/domain/task";
import {
  Archive,
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  ListChecks,
  MessageSquare,
  Paperclip,
  Pencil,
  Pin,
  Plus,
  RotateCcw,
  Send,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

const ICONS: Record<TaskActivityType, LucideIcon> = {
  COMMENT: MessageSquare,
  TASK_CREATED: Plus,
  TASK_MOVED: ArrowRightLeft,
  TASK_UPDATED: Pencil,
  TASK_COMPLETED: CheckCircle2,
  TASK_REOPENED: RotateCcw,
  TASK_ARCHIVED: Archive,
  TASK_RESTORED: RotateCcw,
  TASK_REMOVED: Trash2,
  ASSIGNEES_CHANGED: Users,
  DUE_DATE_CHANGED: CalendarClock,
  CHECKLIST_CHANGED: ListChecks,
  ATTACHMENT_CHANGED: Paperclip,
};

interface TaskCommentThreadProps {
  taskId: string;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function TaskCommentThread({
  taskId,
  canCreate,
  canEdit,
  canDelete,
}: TaskCommentThreadProps) {
  const { data, isLoading } = useGetTaskActivitiesQuery({
    taskId,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [createComment, { isLoading: isPosting }] = useCreateTaskActivityMutation();
  const [updateComment, { isLoading: isSavingEdit }] = useUpdateTaskActivityMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteTaskActivityMutation();

  const [draft, setDraft] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState("");
  const [pendingDelete, setPendingDelete] = React.useState<TaskActivity | null>(null);

  const entries = data?.data ?? [];

  const post = async () => {
    const body = draft.trim();
    if (!body) return;

    try {
      await createComment({ taskId, body }).unwrap();
      setDraft("");
      toast.success("Comment posted");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not post the comment");
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const body = editDraft.trim();
    if (!body) return;

    try {
      await updateComment({ id: editingId, body: { body } }).unwrap();
      setEditingId(null);
      toast.success("Comment updated");
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the comment");
    }
  };

  const togglePin = async (activity: TaskActivity) => {
    try {
      await updateComment({ id: activity._id, body: { isPinned: !activity.isPinned } }).unwrap();
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not pin the comment");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteComment(pendingDelete._id).unwrap();
      toast.success("Comment removed");
      setPendingDelete(null);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not remove the comment");
    }
  };

  return (
    <>
      {canCreate && (
        <div className="mb-4 space-y-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a comment for whoever picks this up next"
            maxLength={4000}
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              className="cursor-pointer gap-1.5"
              disabled={isPosting || draft.trim() === ""}
              onClick={() => void post()}
            >
              <Send className="size-3.5" />
              Comment
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : entries.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          Nothing here yet. The card history and comments show up as work happens.
        </p>
      ) : (
        <ol className="space-y-2 border-l pl-4">
          {entries.map((activity) => {
            const Icon = ICONS[activity.type];
            const isComment = activity.source === "MANUAL";
            const isEditing = editingId === activity._id;

            return (
              <li key={activity._id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[26px] flex size-5 items-center justify-center rounded-full border bg-background",
                    isComment ? "border-primary/50 text-primary" : "text-muted-foreground"
                  )}
                  aria-hidden
                >
                  <Icon className="size-3" />
                </span>

                <div
                  className={cn(
                    "rounded-lg border p-3",
                    isComment ? "bg-card" : "bg-muted/30",
                    activity.isPinned && "ring-1 ring-primary/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-medium">
                        {activity.isPinned && (
                          <Pin className="mr-1 inline size-3 text-primary" aria-hidden />
                        )}
                        {isComment ? activity.actorName || "Someone" : activity.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {safeDistanceToNow(activity.createdAt)}
                        {" · "}
                        {safeFormat(activity.createdAt, "d MMM, hh:mm a")}
                        {!isComment && ` · ${TASK_ACTIVITY_TYPE_LABELS[activity.type]}`}
                        {activity.isEdited && " · edited"}
                      </p>
                    </div>

                    {isComment && (
                      <div className="flex shrink-0 gap-1">
                        {canEdit && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={activity.isPinned ? "Unpin comment" : "Pin comment"}
                            title={activity.isPinned ? "Unpin comment" : "Pin comment"}
                            className="size-7 cursor-pointer"
                            onClick={() => void togglePin(activity)}
                          >
                            <Pin className="size-3.5" />
                          </Button>
                        )}
                        {canEdit && activity.isMine && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Edit comment"
                            title="Edit comment"
                            className="size-7 cursor-pointer"
                            onClick={() => {
                              setEditingId(activity._id);
                              setEditDraft(activity.body);
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        )}
                        {canDelete && activity.isMine && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Delete comment"
                            title="Delete comment"
                            className="size-7 cursor-pointer text-destructive hover:text-destructive"
                            onClick={() => setPendingDelete(activity)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <Textarea
                        value={editDraft}
                        onChange={(event) => setEditDraft(event.target.value)}
                        maxLength={4000}
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="cursor-pointer"
                          disabled={isSavingEdit || editDraft.trim() === ""}
                          onClick={() => void saveEdit()}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    activity.body && (
                      <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                        {activity.body}
                      </p>
                    )
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this comment?"
        description="It disappears from the card history. The card itself is untouched."
        confirmText="Remove"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
