import { cn } from "@/lib/utils";

export type StatusColor =
  | "green"
  | "red"
  | "amber"
  | "blue"
  | "orange"
  | "violet"
  | "zinc"
  | "muted";

const COLOR_MAP: Record<StatusColor, { pill: string; dot: string }> = {
  green:  { pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  red:    { pill: "bg-red-500/10 text-red-600 dark:text-red-400",             dot: "bg-red-500" },
  amber:  { pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400",       dot: "bg-amber-500" },
  blue:   { pill: "bg-blue-500/10 text-blue-600 dark:text-blue-400",          dot: "bg-blue-500" },
  orange: { pill: "bg-orange-500/10 text-orange-600 dark:text-orange-400",    dot: "bg-orange-500" },
  violet: { pill: "bg-violet-500/10 text-violet-600 dark:text-violet-400",    dot: "bg-violet-500" },
  zinc:   { pill: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",          dot: "bg-zinc-500" },
  muted:  { pill: "bg-muted text-muted-foreground",                            dot: "bg-muted-foreground/50" },
};

interface StatusBadgeProps {
  color: StatusColor;
  label: string;
  className?: string;
}

export function StatusBadge({ color, label, className }: StatusBadgeProps) {
  const { pill, dot } = COLOR_MAP[color] ?? COLOR_MAP.muted;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        pill,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
