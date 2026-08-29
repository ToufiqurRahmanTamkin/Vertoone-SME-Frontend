"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ThemePreset } from "@/types/theme-customizer";
import { Check, Search } from "lucide-react";
import * as React from "react";

export type PresetKind = "standard" | "advanced";

export interface PresetEntry {
  value: string;
  name: string;
  kind: PresetKind;
  preset: ThemePreset;
}

interface PresetGridProps {
  presets: PresetEntry[];
  selected: string;
  isDarkMode: boolean;
  onSelect: (entry: PresetEntry) => void;
  onPreview?: (entry: PresetEntry | null) => void;
}

const FILTERS: { label: string; value: PresetKind | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Standard", value: "standard" },
  { label: "Advanced", value: "advanced" },
];

const SWATCH_KEYS = ["primary", "accent", "secondary", "background"] as const;

export function PresetGrid({
  presets,
  selected,
  isDarkMode,
  onSelect,
  onPreview,
}: PresetGridProps) {
  const [query, setQuery] = React.useState("");
  const [kind, setKind] = React.useState<PresetKind | "all">("all");

  const visible = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return presets.filter((entry) => {
      if (kind !== "all" && entry.kind !== kind) return false;
      if (!needle) return true;
      return entry.name.toLowerCase().includes(needle);
    });
  }, [presets, query, kind]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search themes"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-lg border bg-muted/40 p-0.5">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setKind(filter.value)}
              className={cn(
                "cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                kind === filter.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1"
        onMouseLeave={() => onPreview?.(null)}
      >
        {visible.map((entry) => {
          const palette = isDarkMode ? entry.preset.styles.dark : entry.preset.styles.light;
          const isSelected = entry.value === selected;

          return (
            <button
              key={`${entry.kind}-${entry.value}`}
              type="button"
              onClick={() => onSelect(entry)}
              onMouseEnter={() => onPreview?.(entry)}
              onFocus={() => onPreview?.(entry)}
              onBlur={() => onPreview?.(null)}
              className={cn(
                "group relative flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:border-primary/40 hover:bg-muted/40"
              )}
            >
              <span className="grid size-8 shrink-0 grid-cols-2 overflow-hidden rounded-md border border-border/60">
                {SWATCH_KEYS.map((key) => (
                  <span
                    key={key}
                    className="block h-full w-full"
                    style={{ backgroundColor: palette?.[key] ?? "transparent" }}
                  />
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">{entry.name}</span>
                <span className="block text-[10px] text-muted-foreground capitalize">
                  {entry.kind}
                </span>
              </span>
              {isSelected && (
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
            </button>
          );
        })}

        {visible.length === 0 && (
          <p className="col-span-2 rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
            No theme matches “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}
