"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { radiusOptions } from "@/config/theme-customizer-constants";
import { colorThemes, tweakcnThemes } from "@/config/theme-data";
import { useCircularTransition } from "@/hooks/use-circular-transition";
import { useThemeManager } from "@/hooks/use-theme-manager";
import { setAnimationSpeed, setFontSize, setHeaderTransparency } from "@/redux/settingsSlice";
import type { RootState } from "@/redux/store";
import { Dices, Moon, Sun, Type, Zap } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import "./circular-transition.css";

interface ThemeTabProps {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  selectedTweakcnTheme: string;
  setSelectedTweakcnTheme: (theme: string) => void;
  selectedRadius: string;
  setSelectedRadius: (radius: string) => void;
}

export function ThemeTab({
  selectedTheme,
  setSelectedTheme,
  selectedTweakcnTheme,
  setSelectedTweakcnTheme,
  selectedRadius,
  setSelectedRadius,
}: ThemeTabProps) {
  const dispatch = useDispatch();
  const { fontSize, animationSpeed, headerTransparency } = useSelector(
    (state: RootState) => state.settings
  );

  const { isDarkMode, applyTheme, applyTweakcnTheme, applyRadius } = useThemeManager();

  const { toggleTheme } = useCircularTransition();

  const handleRandomShadcn = () => {
    const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
    setSelectedTheme(randomTheme.value);
    setSelectedTweakcnTheme("");
    applyTheme(randomTheme.value, isDarkMode);
  };

  const handleRandomTweakcn = () => {
    const randomTheme = tweakcnThemes[Math.floor(Math.random() * tweakcnThemes.length)];
    setSelectedTweakcnTheme(randomTheme.value);
    setSelectedTheme("");
    applyTweakcnTheme(randomTheme.preset, isDarkMode);
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
    <div className="p-4 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Standard Presets</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomShadcn}
            className="cursor-pointer"
          >
            <Dices className="h-3.5 w-3.5 mr-1.5" />
            Random
          </Button>
        </div>

        <Select
          value={selectedTheme}
          onValueChange={(value) => {
            setSelectedTheme(value);
            setSelectedTweakcnTheme("");
            applyTheme(value, isDarkMode);
          }}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Choose Standard Theme" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <div className="p-2">
              {colorThemes.map((theme) => (
                <SelectItem key={theme.value} value={theme.value} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-3 h-3 rounded-full border border-border/20"
                        style={{ backgroundColor: theme.preset.styles.light.primary }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border border-border/20"
                        style={{ backgroundColor: theme.preset.styles.light.secondary }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border border-border/20"
                        style={{ backgroundColor: theme.preset.styles.light.accent }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border border-border/20"
                        style={{ backgroundColor: theme.preset.styles.light.muted }}
                      />
                    </div>
                    <span>{theme.name}</span>
                  </div>
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Advanced Presets</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRandomTweakcn}
            className="cursor-pointer"
          >
            <Dices className="h-3.5 w-3.5 mr-1.5" />
            Random
          </Button>
        </div>

        <Select
          value={selectedTweakcnTheme}
          onValueChange={(value) => {
            setSelectedTweakcnTheme(value);
            setSelectedTheme("");
            const selectedPreset = tweakcnThemes.find((t) => t.value === value)?.preset;
            if (selectedPreset) {
              applyTweakcnTheme(selectedPreset, isDarkMode);
            }
          }}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Choose Advanced Theme" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <div className="p-2">
              {tweakcnThemes.map((theme) => (
                <SelectItem key={theme.value} value={theme.value} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-3 h-3 rounded-full border border-border/20"
                        style={{ backgroundColor: theme.preset.styles.light.primary }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border border-border/20"
                        style={{ backgroundColor: theme.preset.styles.light.secondary }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border border-border/20"
                        style={{ backgroundColor: theme.preset.styles.light.accent }}
                      />
                      <div
                        className="w-3 h-3 rounded-full border border-border/20"
                        style={{ backgroundColor: theme.preset.styles.light.muted }}
                      />
                    </div>
                    <span>{theme.name}</span>
                  </div>
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Corner Style</Label>
        <div className="grid grid-cols-5 gap-2">
          {radiusOptions.map((option) => (
            <div
              key={option.value}
              className={`relative cursor-pointer rounded-md p-3 border transition-colors ${
                selectedRadius === option.value
                  ? "border-primary"
                  : "border-border hover:border-border/60"
              }`}
              onClick={() => handleRadiusSelect(option.value)}
            >
              <div className="text-center">
                <div className="text-xs font-medium">{option.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-medium">Appearance</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={!isDarkMode ? "secondary" : "outline"}
            size="sm"
            onClick={handleLightMode}
            className="cursor-pointer mode-toggle-button relative overflow-hidden"
          >
            <Sun className="h-4 w-4 mr-1 transition-transform duration-300" />
            Light
          </Button>
          <Button
            variant={isDarkMode ? "secondary" : "outline"}
            size="sm"
            onClick={handleDarkMode}
            className="cursor-pointer mode-toggle-button relative overflow-hidden"
          >
            <Moon className="h-4 w-4 mr-1 transition-transform duration-300" />
            Dark
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <Type className="h-4 w-4" /> Typography & Interactivity
        </Label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Default Font Size</Label>
            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{fontSize}px</span>
          </div>
          <Slider
            value={[fontSize]}
            min={14}
            max={20}
            step={1}
            onValueChange={(val) => dispatch(setFontSize(val[0]))}
            className="cursor-pointer"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Zap className="h-3 w-3" /> Smoothness
          </Label>
          <Tabs
            value={animationSpeed}
            onValueChange={(v) => dispatch(setAnimationSpeed(v as "fast" | "normal" | "slow"))}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full h-8 p-1">
              <TabsTrigger value="slow" className="text-[10px] py-0">
                Slow
              </TabsTrigger>
              <TabsTrigger value="normal" className="text-[10px] py-0">
                Default
              </TabsTrigger>
              <TabsTrigger value="fast" className="text-[10px] py-0">
                Fast
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center justify-between py-1">
          <div className="space-y-0.5">
            <Label className="text-xs text-muted-foreground">Glassmorphism Header</Label>
            <p className="text-[10px] text-muted-foreground/60">Translucent top navigation bar</p>
          </div>
          <Switch
            checked={headerTransparency}
            onCheckedChange={(checked) => dispatch(setHeaderTransparency(checked))}
          />
        </div>
      </div>
    </div>
  );
}
