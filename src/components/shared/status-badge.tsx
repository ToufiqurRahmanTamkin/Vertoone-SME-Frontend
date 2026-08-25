import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { humanizeEnum } from "@/lib/format";

/**
 * Colour per domain state. Kept as explicit Tailwind class strings (not
 * interpolated) so the JIT compiler can see every class it must emit.
 */
const TONE: Record<string, string> = {
  ACTIVE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  PAID: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  UNPAID: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  EXPIRED: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  FAILED: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  CANCELLED: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  SUSPENDED: "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  REFUNDED: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", TONE[value], className)}>
      {humanizeEnum(value)}
    </Badge>
  );
}
