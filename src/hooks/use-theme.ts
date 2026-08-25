import * as React from "react";
import { selectTheme, setTheme, type Theme } from "@/redux/settingsSlice";
import { useAppDispatch, useAppSelector } from "./redux";

const prefersDark = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

/**
 * The active theme plus a setter. `resolvedTheme` collapses "system" into the
 * concrete light/dark the user is actually seeing, and tracks OS changes.
 */
export function useTheme() {
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  const [systemIsDark, setSystemIsDark] = React.useState(prefersDark);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setSystemIsDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme: "light" | "dark" =
    theme === "system" ? (systemIsDark ? "dark" : "light") : theme;

  const applyTheme = React.useCallback(
    (next: Theme) => {
      dispatch(setTheme(next));
    },
    [dispatch]
  );

  const toggleTheme = React.useCallback(() => {
    applyTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [applyTheme, resolvedTheme]);

  return { theme, resolvedTheme, setTheme: applyTheme, toggleTheme };
}
