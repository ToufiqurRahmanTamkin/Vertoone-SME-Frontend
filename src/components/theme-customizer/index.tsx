"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tweakcnThemes } from "@/config/theme-data";
import { useSidebarConfig } from "@/contexts/sidebar-context";
import { useThemeManager } from "@/hooks/use-theme-manager";
import {
  resetSettings,
  setSelectedRadius as setReduxSelectedRadius,
  setSelectedTheme as setReduxSelectedTheme,
  setSelectedTweakcnTheme as setReduxSelectedTweakcnTheme,
} from "@/redux/settingsSlice";
import type { RootState } from "@/redux/store";
import { Layout, Palette, RotateCcw, Settings, X } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { LayoutTab } from "./layout-tab";
import { ThemeTab } from "./theme-tab";

interface ThemeCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemeCustomizer({ open, onOpenChange }: ThemeCustomizerProps) {
  const dispatch = useDispatch();
  const { applyTheme, applyTweakcnTheme, applyRadius, resetTheme, isDarkMode } = useThemeManager();
  const { config: sidebarConfig, updateConfig: updateSidebarConfig } = useSidebarConfig();

  const { selectedTheme, selectedTweakcnTheme, selectedRadius } = useSelector(
    (state: RootState) => state.settings
  );

  const [activeTab, setActiveTab] = React.useState("theme");

  const setSelectedTheme = (theme: string) => dispatch(setReduxSelectedTheme(theme));
  const setSelectedTweakcnTheme = (theme: string) => dispatch(setReduxSelectedTweakcnTheme(theme));
  const setSelectedRadius = (radius: string) => dispatch(setReduxSelectedRadius(radius));

  const handleReset = () => {
    // 1. Complete reset to application defaults (light theme + Starry Night).
    dispatch(resetSettings());

    // 2. Completely remove all custom CSS variables.
    resetTheme();

    // 3. Re-apply the default advanced preset (Starry Night) in light mode so a
    //    reset is deterministic regardless of the theme that was active before.
    const defaultPreset = tweakcnThemes.find((t) => t.value === "starry-night")?.preset;
    if (defaultPreset) {
      applyTweakcnTheme(defaultPreset, false);
    }

    // 4. Reset the radius to default (after the preset, which clears CSS vars).
    applyRadius("0.5rem");

    // 5. Reset sidebar to defaults.
    updateSidebarConfig({ collapsible: "icon", side: "left" });
  };

  // Re-apply themes when theme mode changes
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

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        <SheetContent
          side={sidebarConfig.side === "left" ? "right" : "left"}
          className="max-w-xl w-full p-0 gap-0 pointer-events-auto [&>button]:hidden overflow-hidden flex flex-col"
        >
          <SheetHeader className="space-y-0 p-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-4 w-4" />
              </div>
              <SheetTitle className="text-lg font-semibold">Customizer</SheetTitle>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  className="cursor-pointer h-8 w-8"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="cursor-pointer h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <SheetDescription className="text-sm text-muted-foreground sr-only">
              Customize the them and layout of your dashboard.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="py-2">
                <TabsList className="grid w-full grid-cols-2 rounded-none h-12 p-1.5">
                  <TabsTrigger
                    value="theme"
                    className="cursor-pointer data-[state=active]:bg-background"
                  >
                    <Palette className="h-4 w-4 mr-1" /> Theme
                  </TabsTrigger>
                  <TabsTrigger
                    value="layout"
                    className="cursor-pointer data-[state=active]:bg-background"
                  >
                    <Layout className="h-4 w-4 mr-1" /> Layout
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="theme" className="flex-1 mt-0">
                <ThemeTab
                  selectedTheme={selectedTheme}
                  setSelectedTheme={setSelectedTheme}
                  selectedTweakcnTheme={selectedTweakcnTheme}
                  setSelectedTweakcnTheme={setSelectedTweakcnTheme}
                  selectedRadius={selectedRadius}
                  setSelectedRadius={setSelectedRadius}
                />
              </TabsContent>

              <TabsContent value="layout" className="flex-1 mt-0">
                <LayoutTab />
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

// Floating trigger button - positioned dynamically based on sidebar side
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
      <Settings className="size-[1.05rem]" />
    </Button>
  );
}
