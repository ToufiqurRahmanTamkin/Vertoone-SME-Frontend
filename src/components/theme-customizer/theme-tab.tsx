"use client";

import { Button } from "@/components/ui/button";
import { radiusOptions } from "@/config/theme-customizer-constants";
import { colorThemes, tweakcnThemes } from "@/config/theme-data";
import { useCircularTransition } from "@/hooks/use-circular-transition";
import { useThemeManager } from "@/hooks/use-theme-manager";
import { cn } from "@/lib/utils";
import { Dices, Moon, Sun } from "lucide-react";
import React from "react";
import { PanelSection } from "./panel-section";
import { PresetGrid, type PresetEntry } from "./preset-grid";
import "./circular-transition.css";

interface ThemeTabProps {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  selectedTweakcnTheme: string;
  setSelectedTweakcnTheme: (theme: string) => void;
  selectedRadius: string;
  setSelectedRadius: (radius: string) => void;
  onPreview?: (entry: PresetEntry | null) => void;
}

export function ThemeTab({
  selectedTheme,
  setSelectedTheme,
  selectedTweakcnTheme,
  setSelectedTweakcnTheme,
  selectedRadius,
  setSelectedRadius,
  onPreview,
}: ThemeTabProps) {
  const { isDarkMode, applyTheme, applyTweakcnTheme, applyRadius } = useThemeManager();
  const { toggleTheme } = useCircularTransition();

  const presets = React.useMemo<PresetEntry[]>(
    () => [
      ...colorThemes.map((theme) => ({
        value: theme.value,
        name: theme.name,
        kind: "standard" as const,
        preset: theme.preset,
      })),
      ...tweakcnThemes.map((theme) => ({
        value: theme.value,
        name: theme.name,
        kind: "advanced" as const,
        preset: theme.preset,
      })),
    ],
    []
  );

  const handleSelect = (entry: PresetEntry) => {
    onPreview?.(null);

    if (entry.kind === "standard") {
      setSelectedTheme(entry.value);
      setSelectedTweakcnTheme("");
      applyTheme(entry.value, isDarkMode);
      return;
    }

    setSelectedTweakcnTheme(entry.value);
    setSelectedTheme("");
    applyTweakcnTheme(entry.preset, isDarkMode);
  };

  const handleRandom = () => {
    const entry = presets[Math.floor(Math.random() * presets.length)];
    if (entry) handleSelect(entry);
  };

  const handleRadiusSelect = (radius: string) => {
    setSelectedRadius(radius);
    applyRadius(radius);
  };

  const handleLightMode = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDarkMode === false) return;
    toggleTheme(event);
  };

  const handleDarkMode = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDarkMode === true) return;
    toggleTheme(event);
  };

  return (
    <div className="space-y-6">
      <PanelSection title="Mode" hint="Switches every surface between light and dark.">
        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLightMode}
            className={cn(
              "mode-toggle-button relative h-8 cursor-pointer overflow-hidden",
              !isDarkMode && "bg-background text-foreground shadow-sm hover:bg-background"
            )}
          >
            <Sun className="mr-1.5 size-4 transition-transform duration-300" />
            Light
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDarkMode}
            className={cn(
              "mode-toggle-button relative h-8 cursor-pointer overflow-hidden",
              isDarkMode && "bg-background text-foreground shadow-sm hover:bg-background"
            )}
          >
            <Moon className="mr-1.5 size-4 transition-transform duration-300" />
            Dark
          </Button>
        </div>
      </PanelSection>

      <PanelSection
        title="Palette"
        hint="Hover a theme to try it in the preview above."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandom}
            className="h-7 shrink-0 cursor-pointer text-xs"
          >
            <Dices className="mr-1.5 size-3.5" />
            Surprise me
          </Button>
        }
      >
        <PresetGrid
          presets={presets}
          selected={selectedTheme || selectedTweakcnTheme}
          isDarkMode={isDarkMode}
          onSelect={handleSelect}
          onPreview={onPreview}
        />
      </PanelSection>

      <PanelSection title="Corners" hint="How round every card, button and input is.">
        <div className="grid grid-cols-5 gap-2">
          {radiusOptions.map((option) => {
            const isSelected = selectedRadius === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleRadiusSelect(option.value)}
                aria-pressed={isSelected}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-2 transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                <span
                  className="block size-6 border-2 border-b-0 border-l-0 border-foreground/40"
                  style={{ borderTopRightRadius: option.value }}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {option.name}
                </span>
              </button>
            );
          })}
        </div>
      </PanelSection>
    </div>
  );
}
