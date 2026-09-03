import { cn } from "@/lib/utils";
import type * as React from "react";

export interface ReviewItem {
  label: string;
  value: React.ReactNode;
  wide?: boolean;
}

export interface ReviewSection {
  title: string;
  description?: string;
  items: ReviewItem[];
}

interface ReviewSummaryProps {
  sections: ReviewSection[];
  note?: React.ReactNode;
  className?: string;
}

const isEmpty = (value: React.ReactNode): boolean =>
  value === null || value === undefined || value === "";

export function ReviewSummary({ sections, note, className }: ReviewSummaryProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {sections.map((section) => (
        <section key={section.title} className="rounded-lg border bg-muted/30 p-3">
          <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="text-sm font-semibold">{section.title}</h3>
            {section.description && (
              <p className="text-xs text-muted-foreground">{section.description}</p>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-4">
            {section.items.map((item) => (
              <div
                key={item.label}
                className={cn("min-w-0", item.wide && "col-span-2 sm:col-span-4")}
              >
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd
                  className={cn(
                    "text-sm font-medium",
                    item.wide ? "break-words" : "truncate",
                    isEmpty(item.value) && "text-muted-foreground"
                  )}
                >
                  {isEmpty(item.value) ? "—" : item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {note && (
        <p className="rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
          {note}
        </p>
      )}
    </div>
  );
}
