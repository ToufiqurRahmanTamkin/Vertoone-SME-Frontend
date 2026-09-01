import { ColorChip } from "@/components/shared/color-chip";
import { TagList } from "@/components/shared/tag-list";
import { Badge } from "@/components/ui/badge";
import { formatDate, safeDistanceToNow } from "@/lib/date";
import { cn } from "@/lib/utils";
import { DEAL_PRIORITY_LABELS, type Deal } from "@/types/domain/deal";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlarmClock,
  CalendarClock,
  GripVertical,
  History,
  MessageSquare,
  Percent,
} from "lucide-react";
import * as React from "react";
import { formatMoney } from "../deal.helpers";

const CLICK_SLOP = 5;

const PRIORITY_BAR: Record<Deal["priority"], string> = {
  LOW: "bg-zinc-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

interface DealCardContentProps {
  deal: Deal;
  isOverlay?: boolean;
  onOpen?: (event: React.MouseEvent) => void;
}

export function DealCardContent({ deal, isOverlay = false, onOpen }: DealCardContentProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition",
        isOverlay ? "rotate-2 shadow-lg ring-2 ring-primary/40" : "hover:border-primary/40",
        deal.isRotting && !isOverlay && "border-amber-500/50"
      )}
    >
      <span
        className={cn("absolute inset-y-0 left-0 w-1", PRIORITY_BAR[deal.priority])}
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
                {deal.title}
              </button>
            ) : (
              <p className="truncate text-sm font-semibold">{deal.title}</p>
            )}
            <p className="truncate text-xs text-muted-foreground">
              <span className="font-mono uppercase">{deal.code}</span>
              {deal.contact?.name ? ` · ${deal.contact.name}` : ""}
            </p>
          </div>
          <GripVertical className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {deal.value > 0 && (
            <Badge variant="secondary" className="font-semibold tabular-nums">
              {formatMoney(deal.value, deal.currency)}
            </Badge>
          )}
          <Badge variant="outline" className="gap-1 text-[11px] tabular-nums">
            <Percent className="size-3" aria-hidden />
            {deal.probability}
          </Badge>
          <Badge variant="outline" className="text-[11px]">
            {DEAL_PRIORITY_LABELS[deal.priority]}
          </Badge>
          {deal.leadSource && (
            <ColorChip color={deal.leadSource.color} label={deal.leadSource.name} />
          )}
        </div>

        {deal.tags.length > 0 && <TagList tags={deal.tags} emptyLabel="" />}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1" title="Days in this stage">
            <History className="size-3" aria-hidden />
            {deal.daysInStage}d in stage
          </span>

          {deal.activityCount > 0 && (
            <span className="inline-flex items-center gap-1" title="Logged activities">
              <MessageSquare className="size-3" aria-hidden />
              {deal.activityCount}
            </span>
          )}

          {deal.nextActivityAt && (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                deal.isOverdue && "font-medium text-red-600 dark:text-red-400"
              )}
              title={`Next activity ${safeDistanceToNow(deal.nextActivityAt)}`}
            >
              <AlarmClock className="size-3" aria-hidden />
              {formatDate(deal.nextActivityAt)}
            </span>
          )}

          {deal.expectedCloseDate && (
            <span className="inline-flex items-center gap-1" title="Expected close date">
              <CalendarClock className="size-3" aria-hidden />
              {formatDate(deal.expectedCloseDate)}
            </span>
          )}
        </div>

        {deal.owner && (
          <p className="truncate text-[11px] text-muted-foreground">
            Owned by <span className="font-medium">{deal.owner.name}</span>
          </p>
        )}
      </div>
    </div>
  );
}

interface DealCardProps {
  deal: Deal;
  onOpen: (deal: Deal) => void;
  isDragDisabled?: boolean;
}

export function DealCard({ deal, onOpen, isDragDisabled = false }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal._id,
    data: { type: "DEAL", stageId: deal.stageId },
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
    onOpen(deal);
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
      <DealCardContent deal={deal} onOpen={handleOpen} />
    </div>
  );
}
