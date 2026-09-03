import { cn } from "@/lib/utils";
import type * as React from "react";

export interface InfoRow {
  label: string;
  value: React.ReactNode;
  hint?: string;
}

export function InfoRows({ rows, className }: { rows: InfoRow[]; className?: string }) {
  return (
    <dl className={cn("divide-y text-sm", className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0"
        >
          <dt className="shrink-0 text-muted-foreground">
            {row.label}
            {row.hint && <span className="block text-xs opacity-70">{row.hint}</span>}
          </dt>
          <dd className="min-w-0 text-right font-medium break-words">{row.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
