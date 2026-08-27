"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useCircularTransition } from "@/hooks/use-circular-transition";
import "./theme-customizer/circular-transition.css";

interface ModeToggleProps {
  variant?: "outline" | "ghost" | "default";
  className?: string;
}

export function ModeToggle({ variant = "outline", className }: ModeToggleProps) {
  const { theme } = useTheme();
  const { toggleTheme } = useCircularTransition();

  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    const updateMode = () => {
      if (theme === "dark") {
        setIsDarkMode(true);
      } else if (theme === "light") {
        setIsDarkMode(false);
      } else {
        setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    };

    updateMode();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateMode);

    return () => mediaQuery.removeEventListener("change", updateMode);
  }, [theme]);

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    toggleTheme(event);
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={handleToggle}
      className={cn("cursor-pointer mode-toggle-button relative overflow-hidden", className)}
    >
      {isDarkMode ? (
        <Sun className="size-[1.05rem] rotate-0 scale-100 transition-transform duration-300" />
      ) : (
        <Moon className="size-[1.05rem] rotate-0 scale-100 transition-transform duration-300" />
      )}
      <span className="sr-only">Switch to {isDarkMode ? "light" : "dark"} mode</span>
    </Button>
  );
}
