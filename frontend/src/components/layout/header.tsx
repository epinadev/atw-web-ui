/**
 * Header component with project selector and status bar.
 */

"use client";

import { useTasksSummary, useExecutorStatus } from "@/hooks";
import { RefreshCw, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const { data: summary } = useTasksSummary();
  const { data: executor } = useExecutorStatus();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 sm:px-6 lg:px-8">
      {/* Project Selector */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800">
          <span className="text-stone-900 dark:text-stone-100">All Projects</span>
          <ChevronDown className="h-4 w-4 text-stone-500 dark:text-stone-400" />
        </button>
        <button className="p-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800">
          <Settings className="h-4 w-4 text-stone-500 dark:text-stone-400" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status Bar */}
      <div className="hidden md:flex items-center gap-4 text-sm">
        {/* Executor Status */}
        {(() => {
          const isRunning = (executor as any)?.is_running ?? (executor as any)?.running ?? false;
          return (
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  isRunning ? "bg-green-500" : "bg-stone-300 dark:bg-stone-600"
                }`}
              />
              <span className="text-stone-600 dark:text-stone-400">
                {isRunning ? "Running" : "Stopped"}
              </span>
              {isRunning && (
                <span className="text-stone-400 dark:text-stone-500">
                  {(executor as any).slots_used}/{(executor as any).max_parallel}
                </span>
              )}
            </div>
          );
        })()}

        {/* Divider */}
        <div className="h-4 w-px bg-stone-200 dark:bg-stone-700" />

        {/* Task Stats */}
        {summary && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 dark:text-stone-400">Tasks:</span>
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {(summary as any).totals?.active}/{(summary as any).totals?.all}
              </span>
            </div>

            {(summary as any).totals?.needs_attention > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-600 dark:text-yellow-500">Attention:</span>
                <span className="font-medium text-yellow-700 dark:text-yellow-400">
                  {(summary as any).totals.needs_attention}
                </span>
              </div>
            )}

            {(summary as any).totals?.overdue > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-red-600 dark:text-red-500">Overdue:</span>
                <span className="font-medium text-red-700 dark:text-red-400">
                  {(summary as any).totals.overdue}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Refresh Button */}
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <RefreshCw className="h-4 w-4" />
      </Button>
    </header>
  );
}
