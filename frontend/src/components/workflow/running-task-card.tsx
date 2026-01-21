/**
 * Running task card component.
 */

"use client";

import { Square, Clock } from "lucide-react";
import { cn, formatDuration, truncate } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TYPE_CONFIG } from "@/lib/constants";
import type { RunningTask } from "@/types";

interface RunningTaskCardProps {
  task: RunningTask;
  onStop?: (taskId: string) => void;
}

export function RunningTaskCard({ task, onStop }: RunningTaskCardProps) {
  const typeConfig = TYPE_CONFIG[task.type] || TYPE_CONFIG.unclassified;
  const progress = task.workflow_progress?.progress_percent ?? 0;
  const currentStep = task.workflow_progress?.current_step?.name || "Processing...";

  return (
    <div className="bg-white dark:bg-stone-800 rounded-lg border border-green-200 dark:border-green-800 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-stone-600 dark:text-stone-400">{task.source_id}</span>
            <Badge className={cn("text-xs", typeConfig.bgColor, typeConfig.color)}>
              {typeConfig.label}
            </Badge>
          </div>
          <h4 className="font-medium text-stone-900 dark:text-stone-100">{truncate(task.task_name, 40)}</h4>
        </div>
        <button
          onClick={() => onStop?.(task.source_id)}
          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          title="Stop task"
        >
          <Square className="h-4 w-4" />
        </button>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-stone-500 dark:text-stone-400">{currentStep}</span>
          <span className="font-medium text-stone-700 dark:text-stone-300">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Runtime */}
      <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
        <Clock className="h-3 w-3" />
        <span>Running for {formatDuration(task.runtime_seconds)}</span>
      </div>
    </div>
  );
}
