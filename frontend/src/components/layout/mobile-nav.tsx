/**
 * Mobile navigation component.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  ListTodo,
  FolderOpen,
  Play,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "@/components/theme";

const navigation = [
  { name: "Kanban", href: "/kanban", icon: LayoutGrid },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
  { name: "Projects", href: "/projects", icon: FolderOpen },
  { name: "Workflow", href: "/workflow", icon: Play },
];

export function MobileNav() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  const ThemeIcon = theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 lg:hidden">
      <div className="flex justify-around">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium",
                isActive ? "text-green-600 dark:text-green-400" : "text-stone-500 dark:text-stone-400"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium text-stone-500 dark:text-stone-400"
        >
          <ThemeIcon className="h-5 w-5" />
          <span>Theme</span>
        </button>
      </div>
    </nav>
  );
}
