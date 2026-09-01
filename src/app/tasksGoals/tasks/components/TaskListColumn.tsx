import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Task, TaskBoardColumn } from "@/types/domain/task";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CheckCircle2, Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";

const columnDroppableId = (listId: string): string => `list:${listId}`;

interface TaskListColumnProps {
  column: TaskBoardColumn;
  onOpenTask: (task: Task) => void;
  onAddToList: (listId: string) => void;
  canCreate: boolean;
  canEdit: boolean;
}

export function TaskListColumn({
  column,
  onOpenTask,
  onAddToList,
  canCreate,
  canEdit,
}: TaskListColumnProps) {
  const { list, tasks } = column;
  const { setNodeRef, isOver } = useDroppable({
    id: columnDroppableId(list._id),
    data: { type: "LIST", listId: list._id },
  });

  const taskIds = tasks.map((task) => task._id);

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 transition sm:w-80",
        isOver && "border-primary/60 bg-primary/5 ring-2 ring-primary/20",
        list.isArchived && "opacity-60"
      )}
      aria-label={`${list.name} list`}
    >
      <header className="space-y-2 border-b px-3 py-3">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: list.color }}
            aria-hidden
          />
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">{list.name}</h3>
          <Badge
            variant={column.isOverWipLimit ? "destructive" : "secondary"}
            className="shrink-0 tabular-nums"
            title={
              list.wipLimit > 0
                ? `${tasks.length} of a ${list.wipLimit} card limit`
                : `${tasks.length} cards`
            }
          >
            {list.wipLimit > 0 ? `${tasks.length}/${list.wipLimit}` : tasks.length}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">
            {column.completedCount} of {column.taskCount} done
          </span>
          {list.isDoneList && (
            <span
              className="inline-flex shrink-0 items-center gap-1 uppercase tracking-wide"
              title="Cards dropped here are marked done"
            >
              <CheckCircle2 className="size-3" aria-hidden />
              Done
            </span>
          )}
        </div>

        {column.isOverWipLimit && (
          <p className="rounded bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
            Over the {list.wipLimit} card limit. Finish something before pulling more in.
          </p>
        )}

        {canCreate && !list.isArchived && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-full cursor-pointer justify-start gap-1.5 text-xs"
            onClick={() => onAddToList(list._id)}
          >
            <Plus className="size-3.5" />
            Add card
          </Button>
        )}
      </header>

      <ScrollArea className="flex-1">
        <div className="flex min-h-32 flex-col gap-2 p-2">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onOpen={onOpenTask}
                isDragDisabled={!canEdit}
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
              Drop a card here
            </p>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}
