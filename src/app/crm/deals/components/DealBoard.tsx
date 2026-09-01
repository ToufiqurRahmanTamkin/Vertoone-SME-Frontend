import type { Deal, DealBoard as Board, DealBoardColumn } from "@/types/domain/deal";
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
import { DealCardContent } from "./DealCard";
import { DealColumn } from "./DealColumn";

export interface DealMove {
  dealId: string;
  stageId: string;
  position: number;
  stageName: string;
  stageType: Deal["status"];
}

interface DealBoardProps {
  board: Board;
  canCreate: boolean;
  canEdit: boolean;
  onOpenDeal: (deal: Deal) => void;
  onAddToStage: (stageId: string) => void;
  onMove: (move: DealMove) => void;
}

const STAGE_PREFIX = "stage:";

const cloneColumns = (columns: DealBoardColumn[]): DealBoardColumn[] =>
  columns.map((column) => ({ ...column, deals: [...column.deals] }));

const stageIdOfDeal = (source: DealBoardColumn[], dealId: string): string | null =>
  source.find((column) => column.deals.some((deal) => deal._id === dealId))?.stage._id ?? null;

const stageIdOfTarget = (source: DealBoardColumn[], targetId: string): string | null =>
  targetId.startsWith(STAGE_PREFIX)
    ? targetId.slice(STAGE_PREFIX.length)
    : stageIdOfDeal(source, targetId);

export function DealBoard({
  board,
  canCreate,
  canEdit,
  onOpenDeal,
  onAddToStage,
  onMove,
}: DealBoardProps) {
  const [columns, setColumns] = React.useState<DealBoardColumn[]>(() =>
    cloneColumns(board.columns)
  );
  const columnsRef = React.useRef<DealBoardColumn[]>(columns);
  const [activeDeal, setActiveDeal] = React.useState<Deal | null>(null);
  const isDragging = React.useRef(false);
  const origin = React.useRef<{ stageId: string; index: number } | null>(null);

  const applyColumns = React.useCallback((next: DealBoardColumn[]) => {
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
    const dealId = String(event.active.id);
    const current = columnsRef.current;
    const stageId = stageIdOfDeal(current, dealId);
    const column = current.find((row) => row.stage._id === stageId);
    const index = column?.deals.findIndex((deal) => deal._id === dealId) ?? -1;

    isDragging.current = true;
    origin.current = stageId && index >= 0 ? { stageId, index } : null;
    setActiveDeal(index >= 0 ? (column?.deals[index] ?? null) : null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const dealId = String(active.id);
    const targetId = String(over.id);
    if (dealId === targetId) return;

    const current = columnsRef.current;
    const fromStageId = stageIdOfDeal(current, dealId);
    const toStageId = stageIdOfTarget(current, targetId);
    if (!fromStageId || !toStageId || fromStageId === toStageId) return;

    const next = cloneColumns(current);
    const from = next.find((column) => column.stage._id === fromStageId);
    const to = next.find((column) => column.stage._id === toStageId);
    if (!from || !to) return;

    const movingIndex = from.deals.findIndex((deal) => deal._id === dealId);
    if (movingIndex < 0) return;

    const [moving] = from.deals.splice(movingIndex, 1);
    const overIndex = to.deals.findIndex((deal) => deal._id === targetId);
    const insertAt = overIndex >= 0 ? overIndex : to.deals.length;

    to.deals.splice(insertAt, 0, { ...moving, stageId: toStageId });

    applyColumns(next);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const dealId = String(active.id);
    const start = origin.current;

    isDragging.current = false;
    origin.current = null;
    setActiveDeal(null);

    if (!over) {
      applyColumns(cloneColumns(board.columns));
      return;
    }

    const targetId = String(over.id);
    const current = columnsRef.current;
    const stageId = stageIdOfDeal(current, dealId);
    const overStageId = stageIdOfTarget(current, targetId);
    if (!stageId || !overStageId) return;

    let next = current;

    if (stageId === overStageId && dealId !== targetId) {
      next = cloneColumns(current);
      const column = next.find((row) => row.stage._id === stageId);
      if (column) {
        const oldIndex = column.deals.findIndex((deal) => deal._id === dealId);
        const newIndex = column.deals.findIndex((deal) => deal._id === targetId);
        if (oldIndex >= 0 && newIndex >= 0) {
          column.deals = arrayMove(column.deals, oldIndex, newIndex);
        }
      }
      applyColumns(next);
    }

    const settled = next.find((row) => row.stage._id === overStageId);
    const position = settled?.deals.findIndex((deal) => deal._id === dealId) ?? -1;
    if (!settled || position < 0) return;
    if (start?.stageId === overStageId && start.index === position) return;

    onMove({
      dealId,
      stageId: overStageId,
      position,
      stageName: settled.stage.name,
      stageType: settled.stage.type,
    });
  };

  const handleDragCancel = () => {
    isDragging.current = false;
    origin.current = null;
    setActiveDeal(null);
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
          <DealColumn
            key={column.stage._id}
            column={column}
            currency={board.pipeline.currency}
            onOpenDeal={onOpenDeal}
            onAddToStage={onAddToStage}
            canCreate={canCreate}
            canEdit={canEdit}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
        {activeDeal && (
          <div className="w-72 sm:w-80">
            <DealCardContent deal={activeDeal} isOverlay />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
