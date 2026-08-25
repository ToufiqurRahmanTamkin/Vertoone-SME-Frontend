"use client";

import { routes, type RouteConfig } from "@/config/routes";
import { tweakcnThemes } from "@/config/theme-data";
import { useThemeManager } from "@/hooks/use-theme-manager";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { RootState } from "@/redux/store";
import { Suspense, useEffect } from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";

function renderRoutes(routeConfigs: RouteConfig[]) {
  return routeConfigs.map((route, index) => (
    <Route
      key={route.path + index}
      path={route.path}
      element={
        <Suspense
          fallback={
            // Fill the layout's content area so the spinner centres vertically
            // instead of sitting in the top 200px of the page.
            <div className="flex min-h-[70vh] flex-1 items-center justify-center">
              <LoadingSpinner />
            </div>
          }
        >
          {route.element}
        </Suspense>
      }
    >
      {route.children && renderRoutes(route.children)}
    </Route>
  ));
}

export function AppRouter() {
  const { isDarkMode, applyTheme, applyTweakcnTheme, applyRadius } = useThemeManager();

  const { selectedTheme, selectedTweakcnTheme, selectedRadius } = useSelector(
    (state: RootState) => state.settings
  );

  // Initialize and persist theme styles on app load/state change
  useEffect(() => {
    if (selectedTheme) {
      applyTheme(selectedTheme, isDarkMode);
    } else if (selectedTweakcnTheme) {
      const selectedPreset = tweakcnThemes.find((t) => t.value === selectedTweakcnTheme)?.preset;
      if (selectedPreset) {
        applyTweakcnTheme(selectedPreset, isDarkMode);
      }
    }

    if (selectedRadius) {
      applyRadius(selectedRadius);
    }
  }, [isDarkMode, selectedTheme, selectedTweakcnTheme, selectedRadius]);

  return <Routes>{renderRoutes(routes)}</Routes>;
}
