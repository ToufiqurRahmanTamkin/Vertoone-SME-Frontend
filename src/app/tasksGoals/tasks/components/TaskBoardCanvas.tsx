import type { Task, TaskBoardColumn, TaskBoardView } from "@/types/domain/task";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import * as React from "react";
import { TaskCardContent } from "./TaskCard";
import { TaskListColumn } from "./TaskListColumn";

export interface TaskMove {
  taskId: string;
  listId: string;
  position: number;
  listName: string;
  isDoneList: boolean;
}

interface TaskBoardCanvasProps {
  view: TaskBoardView;
  canCreate: boolean;
  canEdit: boolean;
  onOpenTask: (task: Task) => void;
  onAddToList: (listId: string) => void;
  onMove: (move: TaskMove) => void;
}

const LIST_PREFIX = "list:";

const cloneColumns = (columns: TaskBoardColumn[]): TaskBoardColumn[] =>
  columns.map((column) => ({ ...column, tasks: [...column.tasks] }));

const listIdOfTask = (source: TaskBoardColumn[], taskId: string): string | null =>
  source.find((column) => column.tasks.some((task) => task._id === taskId))?.list._id ?? null;

const listIdOfTarget = (source: TaskBoardColumn[], targetId: string): string | null =>
  targetId.startsWith(LIST_PREFIX)
    ? targetId.slice(LIST_PREFIX.length)
    : listIdOfTask(source, targetId);

export function TaskBoardCanvas({
  view,
  canCreate,
  canEdit,
  onOpenTask,
  onAddToList,
  onMove,
}: TaskBoardCanvasProps) {
  const [columns, setColumns] = React.useState<TaskBoardColumn[]>(() =>
    cloneColumns(view.columns)
  );
  const columnsRef = React.useRef<TaskBoardColumn[]>(columns);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const isDragging = React.useRef(false);
  const origin = React.useRef<{ listId: string; index: number } | null>(null);

  const applyColumns = React.useCallback((next: TaskBoardColumn[]) => {
    columnsRef.current = next;
    setColumns(next);
  }, []);

  React.useEffect(() => {
    if (isDragging.current) return;
    applyColumns(cloneColumns(view.columns));
  }, [view, applyColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = String(event.active.id);
    const current = columnsRef.current;
    const listId = listIdOfTask(current, taskId);
    const column = current.find((row) => row.list._id === listId);
    const index = column?.tasks.findIndex((task) => task._id === taskId) ?? -1;

    isDragging.current = true;
    origin.current = listId && index >= 0 ? { listId, index } : null;
    setActiveTask(index >= 0 ? (column?.tasks[index] ?? null) : null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const targetId = String(over.id);
    if (taskId === targetId) return;

    const current = columnsRef.current;
    const fromListId = listIdOfTask(current, taskId);
    const toListId = listIdOfTarget(current, targetId);
    if (!fromListId || !toListId || fromListId === toListId) return;

    const next = cloneColumns(current);
    const from = next.find((column) => column.list._id === fromListId);
    const to = next.find((column) => column.list._id === toListId);
    if (!from || !to) return;

    const movingIndex = from.tasks.findIndex((task) => task._id === taskId);
    if (movingIndex < 0) return;

    const [moving] = from.tasks.splice(movingIndex, 1);
    const overIndex = to.tasks.findIndex((task) => task._id === targetId);
    const insertAt = overIndex >= 0 ? overIndex : to.tasks.length;

    to.tasks.splice(insertAt, 0, { ...moving, listId: toListId });

    applyColumns(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const taskId = String(active.id);
    const start = origin.current;

    isDragging.current = false;
    origin.current = null;
    setActiveTask(null);

    if (!over) {
      applyColumns(cloneColumns(view.columns));
      return;
    }

    const targetId = String(over.id);
    const current = columnsRef.current;
    const listId = listIdOfTask(current, taskId);
    const overListId = listIdOfTarget(current, targetId);
    if (!listId || !overListId) return;

    let next = current;

    if (listId === overListId && taskId !== targetId) {
      next = cloneColumns(current);
      const column = next.find((row) => row.list._id === listId);
      if (column) {
        const oldIndex = column.tasks.findIndex((task) => task._id === taskId);
        const newIndex = column.tasks.findIndex((task) => task._id === targetId);
        if (oldIndex >= 0 && newIndex >= 0) {
          column.tasks = arrayMove(column.tasks, oldIndex, newIndex);
        }
      }
      applyColumns(next);
    }

    const settled = next.find((row) => row.list._id === overListId);
    const position = settled?.tasks.findIndex((task) => task._id === taskId) ?? -1;
    if (!settled || position < 0) return;
    if (start?.listId === overListId && start.index === position) return;

    onMove({
      taskId,
      listId: overListId,
      position,
      listName: settled.list.name,
      isDoneList: settled.list.isDoneList,
    });
  };

  const handleDragCancel = () => {
    isDragging.current = false;
    origin.current = null;
    setActiveTask(null);
    applyColumns(cloneColumns(view.columns));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-3 overflow-x-auto pb-3">
        {columns.map((column) => (
          <TaskListColumn
            key={column.list._id}
            column={column}
            onOpenTask={onOpenTask}
            onAddToList={onAddToList}
            canCreate={canCreate}
            canEdit={canEdit}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeTask && (
          <div className="w-72 sm:w-80">
            <TaskCardContent task={activeTask} isOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
