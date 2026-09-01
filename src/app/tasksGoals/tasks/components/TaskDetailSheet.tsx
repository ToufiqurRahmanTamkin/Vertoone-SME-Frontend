import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Progress } from "@/components/ui/progress";
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
import {
  useDeleteTaskMutation,
  useGetTaskQuery,
  useUpdateTaskMutation,
} from "@/redux/apis/taskApis";
import { type ApiErrorResponse } from "@/redux/baseApi";
import {
  TASK_ASSIGNEE_KIND_COLORS,
  TASK_ASSIGNEE_KIND_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskChecklist,
} from "@/types/domain/task";
import { Archive, ArchiveRestore, CheckCircle2, Paperclip, Pencil, RotateCcw, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { TaskCommentThread } from "./TaskCommentThread";

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditTask: (task: Task) => void;
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

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onEditTask,
  canEdit,
  canCreate,
  canDelete,
}: TaskDetailSheetProps) {
  const { data: fresh } = useGetTaskQuery(task?._id ?? "", { skip: !task || !open });
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const current = fresh ?? task;

  const patch = async (body: Parameters<typeof updateTask>[0]["body"], message: string) => {
    if (!current) return;
    try {
      await updateTask({ id: current._id, body }).unwrap();
      toast.success(message);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not update the card");
    }
  };

  const toggleChecklistItem = async (checklist: TaskChecklist, itemId: string) => {
    if (!current) return;

    await patch(
      {
        checklists: current.checklists.map((row) => ({
          _id: row._id,
          title: row.title,
          items: row.items.map((item) => ({
            _id: item._id,
            title: item.title,
            isChecked:
              row._id === checklist._id && item._id === itemId ? !item.isChecked : item.isChecked,
            dueAt: item.dueAt,
          })),
        })),
      },
      "Checklist updated"
    );
  };

  const confirmDelete = async () => {
    if (!current) return;
    try {
      await deleteTask(current._id).unwrap();
      toast.success("Card deleted");
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as ApiErrorResponse;
      toast.error(err?.data?.message || "Could not delete the card");
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
                    <SheetTitle
                      className={cn("truncate text-base", current.isCompleted && "line-through")}
                    >
                      {current.title}
                    </SheetTitle>
                    <SheetDescription className="truncate">
                      <span className="font-mono uppercase">{current.code}</span>
                      {current.list ? ` · ${current.list.name}` : ""}
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
                        onClick={() => onEditTask(current)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Delete card"
                        title="Delete card"
                        className="size-8 cursor-pointer text-destructive hover:text-destructive"
                        onClick={() => setConfirmOpen(true)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge
                    color={TASK_PRIORITY_COLORS[current.priority]}
                    label={TASK_PRIORITY_LABELS[current.priority]}
                  />
                  {current.isCompleted && <StatusBadge color="green" label="Done" />}
                  {current.isOverdue && <StatusBadge color="red" label="Overdue" />}
                  {current.isDueSoon && !current.isOverdue && (
                    <StatusBadge color="amber" label="Due soon" />
                  )}
                  {current.isArchived && <StatusBadge color="zinc" label="Archived" />}
                  {current.labels.map((label) => (
                    <span
                      key={label._id}
                      className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ backgroundColor: `${label.color}26`, color: label.color }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>

                {canEdit && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer gap-1.5"
                      onClick={() =>
                        void patch(
                          { isCompleted: !current.isCompleted },
                          current.isCompleted ? "Card reopened" : "Card marked done"
                        )
                      }
                    >
                      {current.isCompleted ? (
                        <RotateCcw className="size-3.5" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      {current.isCompleted ? "Reopen" : "Mark done"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer gap-1.5"
                      onClick={() =>
                        void patch(
                          { isArchived: !current.isArchived },
                          current.isArchived ? "Card restored" : "Card archived"
                        )
                      }
                    >
                      {current.isArchived ? (
                        <ArchiveRestore className="size-3.5" />
                      ) : (
                        <Archive className="size-3.5" />
                      )}
                      {current.isArchived ? "Restore" : "Archive"}
                    </Button>
                  </div>
                )}
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <dl className="divide-y">
                  <DetailRow label="Board">{current.board?.name ?? "—"}</DetailRow>
                  <DetailRow label="List">{current.list?.name ?? "—"}</DetailRow>
                  <DetailRow label="In this list since">
                    {formatDateTime(current.enteredListAt)} ({current.daysInList}d)
                  </DetailRow>
                  <DetailRow label="Start date">{formatDate(current.startDate)}</DetailRow>
                  <DetailRow label="Due">
                    <span className={cn(current.isOverdue && "text-red-600 dark:text-red-400")}>
                      {formatDateTime(current.dueAt)}
                    </span>
                  </DetailRow>
                  <DetailRow label="Reminder">{formatDateTime(current.reminderAt)}</DetailRow>
                  {current.completedAt && (
                    <DetailRow label="Completed">{formatDateTime(current.completedAt)}</DetailRow>
                  )}
                </dl>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Assigned to</p>
                  {current.assignees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nobody yet</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {current.assignees.map((assignee) => (
                        <li
                          key={`${assignee.kind}:${assignee.refId}`}
                          className="flex items-center gap-2"
                        >
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                            {assignee.initials}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {assignee.name}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {assignee.subtitle}
                            </span>
                          </span>
                          <StatusBadge
                            color={TASK_ASSIGNEE_KIND_COLORS[assignee.kind]}
                            label={TASK_ASSIGNEE_KIND_LABELS[assignee.kind]}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {current.description && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm whitespace-pre-wrap">{current.description}</p>
                    </div>
                  </>
                )}

                {current.checklists.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <p className="text-sm font-semibold">
                        Checklists
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {current.checklistCheckedCount}/{current.checklistItemCount} ticked
                        </span>
                      </p>

                      {current.checklists.map((checklist) => (
                        <div key={checklist._id} className="space-y-2 rounded-lg border p-3">
                          <div className="flex items-center gap-2">
                            <p className="min-w-0 flex-1 truncate text-sm font-medium">
                              {checklist.title}
                            </p>
                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                              {checklist.checkedCount}/{checklist.itemCount}
                            </span>
                          </div>

                          {checklist.itemCount > 0 && (
                            <Progress value={checklist.progress} className="h-1.5" />
                          )}

                          <ul className="space-y-1">
                            {checklist.items.map((item) => (
                              <li key={item._id} className="flex items-start gap-2">
                                <Checkbox
                                  checked={item.isChecked}
                                  disabled={!canEdit}
                                  onCheckedChange={() =>
                                    void toggleChecklistItem(checklist, item._id)
                                  }
                                  aria-label={`Tick ${item.title}`}
                                  className="mt-0.5 shrink-0 cursor-pointer"
                                />
                                <span
                                  className={cn(
                                    "min-w-0 flex-1 text-sm",
                                    item.isChecked && "text-muted-foreground line-through"
                                  )}
                                >
                                  {item.title}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {current.attachments.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Attachments</p>
                      <ul className="space-y-1">
                        {current.attachments.map((attachment) => (
                          <li key={attachment._id}>
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:border-primary/40"
                            >
                              <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                              <span className="min-w-0 flex-1 truncate">{attachment.name}</span>
                              <Badge variant="outline" className="shrink-0 text-[11px]">
                                {formatDate(attachment.uploadedAt)}
                              </Badge>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                <div className="mb-3">
                  <p className="text-sm font-semibold">Comments and history</p>
                  <p className="text-xs text-muted-foreground">
                    Everything said and every move this card made.
                  </p>
                </div>

                <TaskCommentThread
                  taskId={current._id}
                  canCreate={canCreate}
                  canEdit={canEdit}
                  canDelete={canDelete}
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
        description="The card, its checklists and its comments stop showing. Archive it instead if you may want it back."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
