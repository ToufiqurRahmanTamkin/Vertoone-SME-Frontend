import { ColorChip } from "@/components/shared/color-chip";
import { TagList } from "@/components/shared/tag-list";
import { Badge } from "@/components/ui/badge";
import { formatDate, safeDistanceToNow } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  PIPELINE_ENTRY_PRIORITY_LABELS,
  type PipelineEntry,
} from "@/types/domain/pipeline";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlarmClock, CalendarClock, GripVertical, History, MessageSquare } from "lucide-react";
import * as React from "react";
import { formatMoney } from "../pipeline.helpers";

const CLICK_SLOP = 5;

const PRIORITY_BAR: Record<PipelineEntry["priority"], string> = {
  LOW: "bg-zinc-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

interface PipelineCardContentProps {
  entry: PipelineEntry;
  isOverlay?: boolean;
  onOpen?: (event: React.MouseEvent) => void;
}

export function PipelineCardContent({
  entry,
  isOverlay = false,
  onOpen,
}: PipelineCardContentProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition",
        isOverlay ? "rotate-2 shadow-lg ring-2 ring-primary/40" : "hover:border-primary/40",
        entry.isRotting && !isOverlay && "border-amber-500/50"
      )}
    >
      <span
        className={cn("absolute inset-y-0 left-0 w-1", PRIORITY_BAR[entry.priority])}
        aria-hidden
      />

      <div className="space-y-2.5 py-3 pr-3 pl-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {onOpen ? (
              <button
                type="button"
                className="block max-w-full cursor-pointer truncate text-left text-sm font-semibold hover:underline"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(event);
                }}
              >
                {entry.title || "Untitled"}
              </button>
            ) : (
              <p className="truncate text-sm font-semibold">{entry.title || "Untitled"}</p>
            )}
            <p className="truncate text-xs text-muted-foreground">
              {entry.contact?.name || "No contact"}
            </p>
          </div>
          <GripVertical className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {entry.value > 0 && (
            <Badge variant="secondary" className="font-semibold tabular-nums">
              {formatMoney(entry.value, entry.currency)}
            </Badge>
          )}
          <Badge variant="outline" className="text-[11px]">
            {PIPELINE_ENTRY_PRIORITY_LABELS[entry.priority]}
          </Badge>
          {entry.leadSource && (
            <ColorChip color={entry.leadSource.color} label={entry.leadSource.name} />
          )}
        </div>

        {entry.tags.length > 0 && <TagList tags={entry.tags} emptyLabel="" />}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1" title="Days in this stage">
            <History className="size-3" aria-hidden />
            {entry.daysInStage}d in stage
          </span>

          {entry.activityCount > 0 && (
            <span className="inline-flex items-center gap-1" title="Logged activities">
              <MessageSquare className="size-3" aria-hidden />
              {entry.activityCount}
            </span>
          )}

          {entry.nextActivityAt && (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                entry.isOverdue && "font-medium text-red-600 dark:text-red-400"
              )}
              title={`Next activity ${safeDistanceToNow(entry.nextActivityAt)}`}
            >
              <AlarmClock className="size-3" aria-hidden />
              {formatDate(entry.nextActivityAt)}
            </span>
          )}

          {entry.expectedCloseDate && (
            <span className="inline-flex items-center gap-1" title="Expected close date">
              <CalendarClock className="size-3" aria-hidden />
              {formatDate(entry.expectedCloseDate)}
            </span>
          )}
        </div>

        {entry.owner && (
          <p className="truncate text-[11px] text-muted-foreground">
            Owned by <span className="font-medium">{entry.owner.name}</span>
          </p>
        )}
      </div>
    </div>
  );
}

interface PipelineCardProps {
  entry: PipelineEntry;
  onOpen: (entry: PipelineEntry) => void;
  isDragDisabled?: boolean;
}

export function PipelineCard({ entry, onOpen, isDragDisabled = false }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry._id,
    data: { type: "ENTRY", stageId: entry.stageId },
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
    onOpen(entry);
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
      <PipelineCardContent entry={entry} onOpen={handleOpen} />
    </div>
  );
}
