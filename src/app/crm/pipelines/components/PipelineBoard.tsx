import type {
  PipelineBoard as Board,
  PipelineBoardColumn,
  PipelineEntry,
} from "@/types/domain/pipeline";
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
import { PipelineCardContent } from "./PipelineCard";
import { PipelineColumn } from "./PipelineColumn";

export interface EntryMove {
  entryId: string;
  stageId: string;
  position: number;
  stageName: string;
  stageType: PipelineEntry["status"];
}

interface PipelineBoardProps {
  board: Board;
  canCreate: boolean;
  canEdit: boolean;
  onOpenEntry: (entry: PipelineEntry) => void;
  onAddToStage: (stageId: string) => void;
  onMove: (move: EntryMove) => void;
}

const STAGE_PREFIX = "stage:";

const cloneColumns = (columns: PipelineBoardColumn[]): PipelineBoardColumn[] =>
  columns.map((column) => ({ ...column, entries: [...column.entries] }));

const stageIdOfEntry = (source: PipelineBoardColumn[], entryId: string): string | null =>
  source.find((column) => column.entries.some((entry) => entry._id === entryId))?.stage._id ?? null;

const stageIdOfTarget = (source: PipelineBoardColumn[], targetId: string): string | null =>
  targetId.startsWith(STAGE_PREFIX)
    ? targetId.slice(STAGE_PREFIX.length)
    : stageIdOfEntry(source, targetId);

export function PipelineBoard({
  board,
  canCreate,
  canEdit,
  onOpenEntry,
  onAddToStage,
  onMove,
}: PipelineBoardProps) {
  const [columns, setColumns] = React.useState<PipelineBoardColumn[]>(() =>
    cloneColumns(board.columns)
  );
  const columnsRef = React.useRef<PipelineBoardColumn[]>(columns);
  const [activeEntry, setActiveEntry] = React.useState<PipelineEntry | null>(null);
  const isDragging = React.useRef(false);
  const origin = React.useRef<{ stageId: string; index: number } | null>(null);

  const applyColumns = React.useCallback((next: PipelineBoardColumn[]) => {
    columnsRef.current = next;
    setColumns(next);
  }, []);

  React.useEffect(() => {
    if (isDragging.current) return;
    applyColumns(cloneColumns(board.columns));
  }, [board, applyColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const entryId = String(event.active.id);
    const current = columnsRef.current;
    const stageId = stageIdOfEntry(current, entryId);
    const column = current.find((row) => row.stage._id === stageId);
    const index = column?.entries.findIndex((entry) => entry._id === entryId) ?? -1;

    isDragging.current = true;
    origin.current = stageId && index >= 0 ? { stageId, index } : null;
    setActiveEntry(index >= 0 ? (column?.entries[index] ?? null) : null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const entryId = String(active.id);
    const targetId = String(over.id);
    if (entryId === targetId) return;

    const current = columnsRef.current;
    const fromStageId = stageIdOfEntry(current, entryId);
    const toStageId = stageIdOfTarget(current, targetId);
    if (!fromStageId || !toStageId || fromStageId === toStageId) return;

    const next = cloneColumns(current);
    const from = next.find((column) => column.stage._id === fromStageId);
    const to = next.find((column) => column.stage._id === toStageId);
    if (!from || !to) return;

    const movingIndex = from.entries.findIndex((entry) => entry._id === entryId);
    if (movingIndex < 0) return;

    const [moving] = from.entries.splice(movingIndex, 1);
    const overIndex = to.entries.findIndex((entry) => entry._id === targetId);
    const insertAt = overIndex >= 0 ? overIndex : to.entries.length;

    to.entries.splice(insertAt, 0, { ...moving, stageId: toStageId });

    applyColumns(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const entryId = String(active.id);
    const start = origin.current;

    isDragging.current = false;
    origin.current = null;
    setActiveEntry(null);

    if (!over) {
      applyColumns(cloneColumns(board.columns));
      return;
    }

    const targetId = String(over.id);
    const current = columnsRef.current;
    const stageId = stageIdOfEntry(current, entryId);
    const overStageId = stageIdOfTarget(current, targetId);
    if (!stageId || !overStageId) return;

    let next = current;

    if (stageId === overStageId && entryId !== targetId) {
      next = cloneColumns(current);
      const column = next.find((row) => row.stage._id === stageId);
      if (column) {
        const oldIndex = column.entries.findIndex((entry) => entry._id === entryId);
        const newIndex = column.entries.findIndex((entry) => entry._id === targetId);
        if (oldIndex >= 0 && newIndex >= 0) {
          column.entries = arrayMove(column.entries, oldIndex, newIndex);
        }
      }
      applyColumns(next);
    }

    const settled = next.find((row) => row.stage._id === overStageId);
    const position = settled?.entries.findIndex((entry) => entry._id === entryId) ?? -1;
    if (!settled || position < 0) return;
    if (start?.stageId === overStageId && start.index === position) return;

    onMove({
      entryId,
      stageId: overStageId,
      position,
      stageName: settled.stage.name,
      stageType: settled.stage.type,
    });
  };

  const handleDragCancel = () => {
    isDragging.current = false;
    origin.current = null;
    setActiveEntry(null);
    applyColumns(cloneColumns(board.columns));
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
          <PipelineColumn
            key={column.stage._id}
            column={column}
            currency={board.pipeline.currency}
            onOpenEntry={onOpenEntry}
            onAddToStage={onAddToStage}
            canCreate={canCreate}
            canEdit={canEdit}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeEntry && (
          <div className="w-72 sm:w-80">
            <PipelineCardContent entry={activeEntry} isOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
