"use client";

import { colorThemes } from "@/config/theme-data";
import { useTheme } from "@/hooks/use-theme";
import type { ThemePreset } from "@/types/theme-customizer";
import React from "react";

export function useThemeManager() {
  const { theme, setTheme } = useTheme();

  // Simple, reliable theme detection - just follow the theme provider
  const isDarkMode = React.useMemo(() => {
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, [theme]);

  const resetTheme = React.useCallback(() => {
    // Comprehensive reset of ALL possible CSS variables that could be set by themes
    const root = document.documentElement;

    const propertiesToRemove: string[] = [];
    for (let i = 0; i < root.style.length; i++) {
      const property = root.style[i];
      if (property.startsWith("--") && property !== "--animation-duration") {
        propertiesToRemove.push(property);
      }
    }

    propertiesToRemove.forEach((prop) => root.style.removeProperty(prop));
  }, []);

  const applyTheme = React.useCallback(
    (themeValue: string, darkMode: boolean) => {
      const theme = colorThemes.find((t) => t.value === themeValue);
      if (!theme) return;

      // Reset and apply theme variables
      resetTheme();
      const styles = darkMode ? theme.preset.styles.dark : theme.preset.styles.light;
      const root = document.documentElement;

      Object.entries(styles).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    },
    [resetTheme]
  );

  const applyTweakcnTheme = React.useCallback(
    (themePreset: ThemePreset, darkMode: boolean) => {
      // Reset and apply theme variables
      resetTheme();
      const styles = darkMode ? themePreset.styles.dark : themePreset.styles.light;
      const root = document.documentElement;

      Object.entries(styles).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    },
    [resetTheme]
  );

  const applyRadius = React.useCallback((radius: string) => {
    document.documentElement.style.setProperty("--radius", radius);
  }, []);

  return {
    theme,
    setTheme,
    isDarkMode,
    resetTheme,
    applyTheme,
    applyTweakcnTheme,
    applyRadius,
  };
}
