import { shareOf } from "@/app/dashboard/dashboard-format";
import { Skeleton } from "@/components/ui/skeleton";
import type { StatusColor } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";

const BAR_COLORS: Record<StatusColor, string> = {
  green: "bg-emerald-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
  violet: "bg-violet-500",
  zinc: "bg-zinc-500",
  muted: "bg-muted-foreground/50",
};

export interface BreakdownRow {
  key: string;
  label: string;
  count: number;
  color: StatusColor;
  valueLabel?: string;
}

interface BreakdownBarsProps {
  rows: BreakdownRow[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowCount?: number;
}

export function BreakdownBars({
  rows,
  isLoading = false,
  emptyMessage = "Nothing to show yet.",
  rowCount = 5,
}: BreakdownBarsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: rowCount }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const max = Math.max(...rows.map((row) => row.count), 1);

  return (
    <ul className="space-y-3">
      {rows.map((row) => {
        const share = shareOf(row.count, total);
        return (
          <li key={row.key}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-medium">{row.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {row.valueLabel ?? row.count.toLocaleString()}
                <span className="ml-1.5 text-xs">({share}%)</span>
              </span>
            </div>
            <div
              className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`${row.label}: ${row.count} of ${total} (${share}%)`}
            >
              <div
                className={cn("h-full rounded-full transition-[width]", BAR_COLORS[row.color])}
                style={{ width: `${Math.max(2, (row.count / max) * 100)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
