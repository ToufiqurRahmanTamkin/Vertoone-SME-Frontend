import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date";
import {
  WORK_HISTORY_TYPE_COLORS,
  type WorkHistoryEntry,
} from "@/types/domain/workHistory";
import { ArrowRight } from "lucide-react";

interface WorkHistoryTimelineProps {
  entries: WorkHistoryEntry[];
  isLoading?: boolean;
  showEmployee?: boolean;
  emptyMessage?: string;
}

export function WorkHistoryTimeline({
  entries,
  isLoading,
  showEmployee = false,
  emptyMessage = "Nothing recorded yet.",
}: WorkHistoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <ol className="relative space-y-4 border-l pl-5">
      {entries.map((entry) => (
        <li key={entry._id} className="relative">
          <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background" />
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <div className="min-w-0">
              <p className="font-medium">{entry.title || entry.typeLabel}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(entry.effectiveDate)}
                {entry.endDate && ` — ${formatDate(entry.endDate)}`}
                {showEmployee && entry.employee && ` · ${entry.employee.name}`}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              <StatusBadge
                color={WORK_HISTORY_TYPE_COLORS[entry.type] ?? "muted"}
                label={entry.typeLabel}
              />
              {entry.isSystem && (
                <Badge variant="outline" className="text-[10px]">
                  Automatic
                </Badge>
              )}
            </div>
          </div>

          {(entry.fromLabel || entry.toLabel) && (
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm">
              {entry.fromLabel && (
                <span className="text-muted-foreground line-through">{entry.fromLabel}</span>
              )}
              {entry.fromLabel && entry.toLabel && (
                <ArrowRight className="size-3.5 text-muted-foreground" />
              )}
              {entry.toLabel && <span className="font-medium">{entry.toLabel}</span>}
            </p>
          )}

          {entry.note && <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>}
        </li>
      ))}
    </ol>
  );
}
