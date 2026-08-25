import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ModeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="cursor-pointer"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
    </Button>
  );
}
