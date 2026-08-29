"use client";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { setAnimationSpeed, setFontSize, setHeaderTransparency } from "@/redux/settingsSlice";
import type { RootState } from "@/redux/store";
import { Layers, Minus, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { PanelSection } from "./panel-section";

const SPEEDS: { label: string; value: "slow" | "normal" | "fast"; hint: string }[] = [
  { label: "Slow", value: "slow", hint: "500ms" },
  { label: "Default", value: "normal", hint: "300ms" },
  { label: "Fast", value: "fast", hint: "100ms" },
];

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 20;

export function TypographyTab() {
  const dispatch = useDispatch();
  const { fontSize, animationSpeed, headerTransparency } = useSelector(
    (state: RootState) => state.settings
  );

  const nudgeFontSize = (delta: number) =>
    dispatch(setFontSize(Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, fontSize + delta))));

  return (
    <div className="space-y-6">
      <PanelSection
        title="Text size"
        hint="Sets the root size — every rem in the app scales with it."
        action={
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px]">
            {fontSize}px
          </span>
        }
      >
        <div className="rounded-lg border p-3">
          <p className="truncate font-semibold" style={{ fontSize: fontSize }}>
            The quick brown fox
          </p>
          <p
            className="mt-0.5 truncate text-muted-foreground"
            style={{ fontSize: Math.round(fontSize * 0.8) }}
          >
            jumps over the lazy dog — 0123456789
          </p>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => nudgeFontSize(-1)}
              disabled={fontSize <= MIN_FONT_SIZE}
              aria-label="Smaller text"
              className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <Minus className="size-3" />
            </button>
            <Slider
              value={[fontSize]}
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              step={1}
              onValueChange={(value) => dispatch(setFontSize(value[0]))}
              className="cursor-pointer"
              aria-label="Text size"
            />
            <button
              type="button"
              onClick={() => nudgeFontSize(1)}
              disabled={fontSize >= MAX_FONT_SIZE}
              aria-label="Larger text"
              className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus className="size-3" />
            </button>
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Motion" hint="How quickly panels, menus and the sidebar animate.">
        <div className="grid grid-cols-3 gap-2">
          {SPEEDS.map((speed) => {
            const isSelected = animationSpeed === speed.value;

            return (
              <button
                key={speed.value}
                type="button"
                onClick={() => dispatch(setAnimationSpeed(speed.value))}
                aria-pressed={isSelected}
                className={cn(
                  "cursor-pointer rounded-lg border px-2 py-2 transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                <span
                  className={cn(
                    "block text-xs font-medium",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {speed.label}
                </span>
                <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                  {speed.hint}
                </span>
              </button>
            );
          })}
        </div>
      </PanelSection>

      <PanelSection title="Surfaces" hint="Extra polish on the app chrome.">
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
            <Layers className="size-4 text-muted-foreground" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium">Glass header</span>
            <span className="block text-[11px] text-muted-foreground">
              Blurs the page behind the top bar instead of a solid fill.
            </span>
          </span>
          <Switch
            checked={headerTransparency}
            onCheckedChange={(checked) => dispatch(setHeaderTransparency(checked))}
            className="cursor-pointer"
          />
        </div>
      </PanelSection>
    </div>
  );
}
