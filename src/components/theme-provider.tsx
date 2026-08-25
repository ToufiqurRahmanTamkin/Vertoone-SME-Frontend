import * as React from "react";
import { useTheme } from "@/hooks/use-theme";

/**
 * Mirrors the resolved theme onto `<html class="light|dark">`, which is what
 * every Tailwind `dark:` variant and the CSS token block key off.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return <>{children}</>;
}
