import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { PipelineBoardColumn, PipelineEntry } from "@/types/domain/pipeline";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { formatMoney } from "../pipeline.helpers";
import { PipelineCard } from "./PipelineCard";

const columnDroppableId = (stageId: string): string => `stage:${stageId}`;

interface PipelineColumnProps {
  column: PipelineBoardColumn;
  currency: string;
  onOpenEntry: (entry: PipelineEntry) => void;
  onAddToStage: (stageId: string) => void;
  canCreate: boolean;
  canEdit: boolean;
}

export function PipelineColumn({
  column,
  currency,
  onOpenEntry,
  onAddToStage,
  canCreate,
  canEdit,
}: PipelineColumnProps) {
  const { stage, entries } = column;
  const { setNodeRef, isOver } = useDroppable({
    id: columnDroppableId(stage._id),
    data: { type: "STAGE", stageId: stage._id },
  });

  const entryIds = entries.map((entry) => entry._id);
  const totalValue = entries.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 transition sm:w-80",
        isOver && "border-primary/60 bg-primary/5 ring-2 ring-primary/20"
      )}
      aria-label={`${stage.name} stage`}
    >
      <header className="space-y-2 border-b px-3 py-3">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: stage.color }}
            aria-hidden
          />
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">{stage.name}</h3>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {entries.length}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate font-medium tabular-nums">
            {formatMoney(totalValue, currency)}
          </span>
          {stage.type === "OPEN" && stage.probability > 0 && (
            <span className="shrink-0">{stage.probability}% likely</span>
          )}
          {stage.type !== "OPEN" && (
            <span className="shrink-0 uppercase tracking-wide">{stage.type}</span>
          )}
        </div>

        {canCreate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-full cursor-pointer justify-start gap-1.5 text-xs"
            onClick={() => onAddToStage(stage._id)}
          >
            <Plus className="size-3.5" />
            Add contact
          </Button>
        )}
      </header>

      <ScrollArea className="flex-1">
        <div className="flex min-h-32 flex-col gap-2 p-2">
          <SortableContext items={entryIds} strategy={verticalListSortingStrategy}>
            {entries.map((entry) => (
              <PipelineCard
                key={entry._id}
                entry={entry}
                onOpen={onOpenEntry}
                isDragDisabled={!canEdit}
              />
            ))}
          </SortableContext>

          {entries.length === 0 && (
            <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
              Drop a contact here
            </p>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}
