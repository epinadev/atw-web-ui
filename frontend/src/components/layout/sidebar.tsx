/**
 * Sidebar navigation component.
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
  RefreshCw,
  Settings,
  HelpCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme";

const navigation = [
  { name: "Kanban Board", href: "/kanban", icon: LayoutGrid, shortcut: "K" },
  { name: "Tasks", href: "/tasks", icon: ListTodo, shortcut: "T" },
  { name: "Projects", href: "/projects", icon: FolderOpen, shortcut: "P" },
  { name: "Workflow", href: "/workflow", icon: Play, shortcut: "W" },
  { name: "Sync", href: "/sync", icon: RefreshCw, shortcut: "S" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">Auto Claude</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <div className="text-xs font-semibold text-stone-400 dark:text-stone-500 mb-2">PROJECT</div>
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-green-600 dark:text-green-400" : "text-stone-400 dark:text-stone-500 group-hover:text-stone-500 dark:group-hover:text-stone-400"
                      )}
                    />
                    {item.name}
                    <span
                      className={cn(
                        "ml-auto rounded px-1.5 py-0.5 text-xs",
                        isActive
                          ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                          : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                      )}
                    >
                      {item.shortcut}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Bottom section */}
          <div className="mt-auto space-y-1">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-stone-500 dark:text-stone-400">Theme</span>
              <ThemeToggle />
            </div>

            <Link
              href="/help"
              className={cn(
                "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/help"
                  ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
              )}
            >
              <HelpCircle className={cn(
                "h-5 w-5",
                pathname === "/help"
                  ? "text-green-600 dark:text-green-400"
                  : "text-stone-400 dark:text-stone-500 group-hover:text-stone-500 dark:group-hover:text-stone-400"
              )} />
              Help
              <span className={cn(
                "ml-auto rounded px-1.5 py-0.5 text-xs",
                pathname === "/help"
                  ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
              )}>
                ?
              </span>
            </Link>
            <Link
              href="/settings"
              className="group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
            >
              <Settings className="h-5 w-5 text-stone-400 dark:text-stone-500 group-hover:text-stone-500 dark:group-hover:text-stone-400" />
              Settings
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
}
