"use client";

import { cn } from "@/lib/utils";
import type * as React from "react";

interface PanelSectionProps {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function PanelSection({ title, hint, action, className, children }: PanelSectionProps) {
  return (
    <section className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {title}
          </h3>
          {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground/80">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

interface OptionCardProps {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

export function OptionCard({ label, isSelected, onSelect, children }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        "flex cursor-pointer flex-col gap-2 rounded-lg border p-2 transition-all",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border hover:border-primary/40 hover:bg-muted/40"
      )}
    >
      <span className="block h-11 overflow-hidden rounded-md border border-border/70 bg-background">
        {children}
      </span>
      <span
        className={cn(
          "text-center text-[11px] font-medium",
          isSelected ? "text-primary" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </button>
  );
}
