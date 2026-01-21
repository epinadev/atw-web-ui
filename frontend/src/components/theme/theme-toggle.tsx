/**
 * Theme toggle button - sun/moon icon to switch themes.
 */

"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Cycle through: system -> light -> dark -> system
  const cycleTheme = () => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        "p-2 rounded-lg transition-colors",
        "hover:bg-stone-100 dark:hover:bg-stone-800",
        "text-stone-600 dark:text-stone-400"
      )}
      title={`Current: ${theme} (${resolvedTheme}). Click to change.`}
    >
      {theme === "system" ? (
        <Monitor className="h-5 w-5" />
      ) : resolvedTheme === "dark" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  );
}
