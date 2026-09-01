import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  TASK_ASSIGNEE_KIND_LABELS,
  TASK_PRIORITY_BARS,
  TASK_PRIORITY_LABELS,
  type Task,
} from "@/types/domain/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlarmClock,
  Archive,
  CalendarClock,
  CheckSquare,
  GripVertical,
  ListChecks,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import * as React from "react";

const CLICK_SLOP = 5;

const AVATAR_TINTS: Record<Task["assignees"][number]["kind"], string> = {
  EMPLOYEE: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  USER: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  LEAD: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  CONTACT: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

const MAX_AVATARS = 4;

interface TaskCardContentProps {
  task: Task;
  isOverlay?: boolean;
  onOpen?: (event: React.MouseEvent) => void;
}

export function TaskCardContent({ task, isOverlay = false, onOpen }: TaskCardContentProps) {
  const visibleAssignees = task.assignees.slice(0, MAX_AVATARS);
  const hiddenAssignees = task.assignees.length - visibleAssignees.length;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition",
        isOverlay ? "rotate-2 shadow-lg ring-2 ring-primary/40" : "hover:border-primary/40",
        task.isOverdue && !isOverlay && "border-red-500/50",
        task.isCompleted && "opacity-75"
      )}
    >
      {task.coverColor && (
        <span
          className="block h-2 w-full"
          style={{ backgroundColor: task.coverColor }}
          aria-hidden
        />
      )}

      <span
        className={cn(
          "absolute left-0 w-1",
          task.coverColor ? "top-2 bottom-0" : "inset-y-0",
          TASK_PRIORITY_BARS[task.priority]
        )}
        aria-hidden
      />

      <div className="space-y-2.5 py-3 pr-3 pl-4">
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map((label) => (
              <span
                key={label._id}
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: `${label.color}26`, color: label.color }}
                title={label.name}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {onOpen ? (
              <button
                type="button"
                className={cn(
                  "block max-w-full cursor-pointer text-left text-sm font-semibold hover:underline",
                  task.isCompleted && "line-through"
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(event);
                }}
              >
                {task.title}
              </button>
            ) : (
              <p className={cn("text-sm font-semibold", task.isCompleted && "line-through")}>
                {task.title}
              </p>
            )}
            <p className="truncate font-mono text-xs uppercase text-muted-foreground">
              {task.code}
            </p>
          </div>
          <GripVertical className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-[11px]">
            {TASK_PRIORITY_LABELS[task.priority]}
          </Badge>
          {task.isCompleted && (
            <Badge variant="secondary" className="gap-1 text-[11px]">
              <CheckSquare className="size-3" aria-hidden />
              Done
            </Badge>
          )}
          {task.isArchived && (
            <Badge variant="outline" className="gap-1 text-[11px]">
              <Archive className="size-3" aria-hidden />
              Archived
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {task.dueAt && (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                task.isOverdue && "font-medium text-red-600 dark:text-red-400",
                task.isDueSoon && "font-medium text-amber-600 dark:text-amber-400"
              )}
              title={task.isOverdue ? "Overdue" : "Due date"}
            >
              {task.isOverdue ? (
                <AlarmClock className="size-3" aria-hidden />
              ) : (
                <CalendarClock className="size-3" aria-hidden />
              )}
              {formatDate(task.dueAt)}
            </span>
          )}

          {task.checklistItemCount > 0 && (
            <span className="inline-flex items-center gap-1" title="Checklist progress">
              <ListChecks className="size-3" aria-hidden />
              {task.checklistCheckedCount}/{task.checklistItemCount}
            </span>
          )}

          {task.commentCount > 0 && (
            <span className="inline-flex items-center gap-1" title="Comments">
              <MessageSquare className="size-3" aria-hidden />
              {task.commentCount}
            </span>
          )}

          {task.attachmentCount > 0 && (
            <span className="inline-flex items-center gap-1" title="Attachments">
              <Paperclip className="size-3" aria-hidden />
              {task.attachmentCount}
            </span>
          )}
        </div>

        {task.assignees.length > 0 && (
          <div className="flex items-center gap-1">
            {visibleAssignees.map((assignee) => (
              <span
                key={`${assignee.kind}:${assignee.refId}`}
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  AVATAR_TINTS[assignee.kind]
                )}
                title={`${assignee.name} · ${TASK_ASSIGNEE_KIND_LABELS[assignee.kind]}`}
              >
                {assignee.initials}
              </span>
            ))}
            {hiddenAssignees > 0 && (
              <span className="text-[11px] text-muted-foreground">+{hiddenAssignees}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  isDragDisabled?: boolean;
}

export function TaskCard({ task, onOpen, isDragDisabled = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
    data: { type: "TASK", listId: task.listId },
    disabled: isDragDisabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const pointerStart = React.useRef<{ x: number; y: number } | null>(null);

  const handleOpen = (event: React.MouseEvent) => {
    const start = pointerStart.current;
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > CLICK_SLOP) return;
    onOpen(task);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("cursor-grab touch-none active:cursor-grabbing", isDragging && "opacity-40")}
      {...attributes}
      {...listeners}
      onPointerDownCapture={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY };
      }}
      onClick={handleOpen}
    >
      <TaskCardContent task={task} onOpen={handleOpen} />
    </div>
  );
}
