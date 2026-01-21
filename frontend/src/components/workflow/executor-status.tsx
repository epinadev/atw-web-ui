/**
 * Executor status panel component.
 */

"use client";

import { Play, Square, Clock, CheckCircle, XCircle, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutorStatus } from "@/types";

interface ExecutorStatusPanelProps {
  status: ExecutorStatus | undefined;
  onStart?: () => void;
  onStop?: () => void;
  isStarting?: boolean;
  isStopping?: boolean;
}

export function ExecutorStatusPanel({
  status,
  onStart,
  onStop,
  isStarting,
  isStopping,
}: ExecutorStatusPanelProps) {
  // Handle both "is_running" (when running) and "running" (when stopped) response formats
  const isRunning = (status as any)?.is_running ?? (status as any)?.running ?? false;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Executor Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Status */}
          <div className="space-y-1">
            <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">Status</p>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-3 w-3 rounded-full",
                  isRunning ? "bg-green-500 animate-pulse" : "bg-stone-300 dark:bg-stone-600"
                )}
              />
              <span className={cn("font-medium", isRunning ? "text-green-700 dark:text-green-400" : "text-stone-500 dark:text-stone-400")}>
                {isRunning ? "Running" : "Stopped"}
              </span>
            </div>
          </div>

          {/* Uptime */}
          <div className="space-y-1">
            <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">Uptime</p>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-stone-400 dark:text-stone-500" />
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {status?.uptime || "—"}
              </span>
            </div>
          </div>

          {/* Processed */}
          <div className="space-y-1">
            <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">Processed</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                {status?.tasks_completed ?? 0}
              </span>
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                {status?.tasks_failed ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 flex gap-2">
          {!isRunning ? (
            <Button onClick={onStart} disabled={isStarting} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              {isStarting ? "Starting..." : "Start Executor"}
            </Button>
          ) : (
            <Button onClick={onStop} disabled={isStopping} variant="destructive" className="flex-1">
              <Square className="h-4 w-4 mr-2" />
              {isStopping ? "Stopping..." : "Stop Executor"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
