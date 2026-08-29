"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { radiusOptions } from "@/config/theme-customizer-constants";
import { colorThemes, tweakcnThemes } from "@/config/theme-data";
import { useSidebarConfig } from "@/contexts/sidebar-context";
import { useThemeManager } from "@/hooks/use-theme-manager";
import { cn } from "@/lib/utils";
import {
  resetSettings,
  setSelectedRadius as setReduxSelectedRadius,
  setSelectedTheme as setReduxSelectedTheme,
  setSelectedTweakcnTheme as setReduxSelectedTweakcnTheme,
} from "@/redux/settingsSlice";
import type { RootState } from "@/redux/store";
import { Layout, Palette, RotateCcw, Sparkles, Type, X } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { LayoutTab } from "./layout-tab";
import type { PresetEntry } from "./preset-grid";
import { PreviewCanvas } from "./preview-canvas";
import { ThemeTab } from "./theme-tab";
import { TypographyTab } from "./typography-tab";

interface ThemeCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TABS = [
  { id: "theme", label: "Theme", icon: Palette },
  { id: "layout", label: "Layout", icon: Layout },
  { id: "type", label: "Type", icon: Type },
] as const;

export function ThemeCustomizer({ open, onOpenChange }: ThemeCustomizerProps) {
  const dispatch = useDispatch();
  const { applyTheme, applyTweakcnTheme, applyRadius, resetTheme, isDarkMode } = useThemeManager();
  const { config: sidebarConfig, updateConfig: updateSidebarConfig } = useSidebarConfig();

  const { selectedTheme, selectedTweakcnTheme, selectedRadius, fontSize, headerTransparency } =
    useSelector((state: RootState) => state.settings);

  const [activeTab, setActiveTab] = React.useState<(typeof TABS)[number]["id"]>("theme");
  const [preview, setPreview] = React.useState<PresetEntry | null>(null);

  const setSelectedTheme = (theme: string) => dispatch(setReduxSelectedTheme(theme));
  const setSelectedTweakcnTheme = (theme: string) => dispatch(setReduxSelectedTweakcnTheme(theme));
  const setSelectedRadius = (radius: string) => dispatch(setReduxSelectedRadius(radius));

  const handleReset = () => {
    setPreview(null);
    dispatch(resetSettings());

    resetTheme();

    const defaultPreset = tweakcnThemes.find((t) => t.value === "starry-night")?.preset;
    if (defaultPreset) {
      applyTweakcnTheme(defaultPreset, false);
    }

    applyRadius("0.5rem");

    updateSidebarConfig({ collapsible: "icon", side: "left" });
  };

  React.useEffect(() => {
    if (selectedTheme) {
      applyTheme(selectedTheme, isDarkMode);
    } else if (selectedTweakcnTheme) {
      const selectedPreset = tweakcnThemes.find((t) => t.value === selectedTweakcnTheme)?.preset;
      if (selectedPreset) {
        applyTweakcnTheme(selectedPreset, isDarkMode);
      }
    }
  }, [isDarkMode, selectedTheme, selectedTweakcnTheme, applyTheme, applyTweakcnTheme]);

  const activePreset = React.useMemo(() => {
    if (selectedTheme) return colorThemes.find((theme) => theme.value === selectedTheme) ?? null;
    return tweakcnThemes.find((theme) => theme.value === selectedTweakcnTheme) ?? null;
  }, [selectedTheme, selectedTweakcnTheme]);

  const shown = preview ?? activePreset;
  const previewStyles = shown?.preset.styles[isDarkMode ? "dark" : "light"] ?? null;
  const radiusLabel =
    radiusOptions.find((option) => option.value === selectedRadius)?.name ?? selectedRadius;

  const closePanel = () => {
    setPreview(null);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) setPreview(null);
        onOpenChange(next);
      }}
      modal={false}
    >
      <SheetContent
        side={sidebarConfig.side === "left" ? "right" : "left"}
        className="pointer-events-auto flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg [&>button]:hidden"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b p-4 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-base leading-tight font-semibold">Appearance</SheetTitle>
              <p className="truncate text-xs text-muted-foreground">
                {shown?.name ?? "Custom"} · {isDarkMode ? "Dark" : "Light"} · Corners {radiusLabel}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleReset}
                    className="size-8 cursor-pointer"
                    aria-label="Reset appearance"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset to defaults</TooltipContent>
              </Tooltip>
              <Button
                variant="outline"
                size="icon"
                onClick={closePanel}
                className="size-8 cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
          <SheetDescription className="sr-only">
            Customize the theme and layout of your dashboard.
          </SheetDescription>
        </SheetHeader>

        <div className="shrink-0 border-b bg-muted/30 p-4">
          <PreviewCanvas
            styles={previewStyles}
            radius={selectedRadius}
            fontSize={fontSize}
            isDarkMode={isDarkMode}
            glassHeader={headerTransparency}
            sidebar={sidebarConfig}
            presetName={shown?.name}
            isPreviewing={Boolean(preview)}
          />
        </div>

        <div className="shrink-0 px-4 pt-3">
          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setPreview(null);
                  setActiveTab(tab.id);
                }}
                aria-pressed={activeTab === tab.id}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {activeTab === "theme" && (
            <ThemeTab
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
              selectedTweakcnTheme={selectedTweakcnTheme}
              setSelectedTweakcnTheme={setSelectedTweakcnTheme}
              selectedRadius={selectedRadius}
              setSelectedRadius={setSelectedRadius}
              onPreview={setPreview}
            />
          )}
          {activeTab === "layout" && <LayoutTab />}
          {activeTab === "type" && <TypographyTab />}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t bg-background px-4 py-3">
          <p className="min-w-0 truncate text-[11px] text-muted-foreground">
            Saved to this browser as you change it.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 shrink-0 cursor-pointer text-xs"
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Reset all
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ThemeCustomizerTrigger({
  onClick,
  variant = "outline",
  className,
}: {
  onClick: () => void;
  variant?: "outline" | "ghost";
  className?: string;
}) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      size="icon"
      className={className}
      aria-label="Customize theme"
    >
      <Sparkles className="size-[1.05rem]" />
    </Button>
  );
}
