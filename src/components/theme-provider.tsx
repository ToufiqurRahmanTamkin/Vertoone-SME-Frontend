"use client";

import { ThemeProviderContext } from "@/contexts/theme-context";
import { setTheme as setReduxTheme, type Theme } from "@/redux/settingsSlice";
import type { RootState } from "@/redux/store";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const theme = useSelector((state: RootState) => state.settings.theme);
  const fontSize = useSelector((state: RootState) => state.settings.fontSize);
  const animationSpeed = useSelector((state: RootState) => state.settings.animationSpeed);

  React.useEffect(() => {
    const root = window.document.documentElement;
    const duration =
      animationSpeed === "fast" ? "100ms" : animationSpeed === "slow" ? "500ms" : "300ms";
    root.style.setProperty("--animation-duration", duration);
    root.style.setProperty("font-size", `${fontSize}px`);
  }, [animationSpeed, fontSize]);

  const dispatch = useDispatch();

  const setTheme = React.useCallback(
    (theme: Theme) => {
      dispatch(setReduxTheme(theme));
    },
    [dispatch]
  );

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
