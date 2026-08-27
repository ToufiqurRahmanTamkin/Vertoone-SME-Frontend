import { cn } from "@/lib/utils";

interface ColorChipProps {
  color: string;
  label: string;
  className?: string;
}

export function ColorChip({ color, label, className }: ColorChipProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className
      )}
      style={{ backgroundColor: `${color}1a`, borderColor: `${color}59` }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="truncate">{label}</span>
    </span>
  );
}
