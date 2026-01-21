/**
 * Kanban card component - displays a task in the kanban board.
 * Styled to match the screenshot with cream backgrounds and green progress bars.
 */

"use client";

import { cn, truncate } from "@/lib/utils";
import { STATUS_CONFIG, TYPE_CONFIG, getPriorityConfig } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TaskActionsMenu } from "@/components/task-actions";
import type { Task } from "@/types";

interface KanbanCardProps {
  task: Task;
  onSelect?: (task: Task) => void;
}

export function KanbanCard({ task, onSelect }: KanbanCardProps) {
  const statusConfig = STATUS_CONFIG[task.status];
  const typeConfig = TYPE_CONFIG[task.type];
  const priorityConfig = getPriorityConfig(task.priority);
  const progress = task.workflow_progress?.progress_percent ?? 0;
  const hasProgress = task.status === "running" || progress > 0;

  return (
    <div
      className={cn(
        "rounded-lg border bg-white dark:bg-stone-800 p-4 shadow-sm transition-all hover:shadow-md cursor-pointer",
        task.status === "blocked" && "border-red-200 dark:border-red-800",
        task.status === "approve" && "border-purple-200 dark:border-purple-800",
        task.status === "review" && "border-amber-200 dark:border-amber-800",
        task.status !== "blocked" && task.status !== "approve" && task.status !== "review" && "border-stone-200 dark:border-stone-700"
      )}
      onClick={() => onSelect?.(task)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-stone-900 dark:text-stone-100 leading-tight">
          {truncate(task.name, 50)}
        </h3>
        <div onClick={(e) => e.stopPropagation()}>
          <TaskActionsMenu task={task} />
        </div>
      </div>

      {/* Summary/Description preview */}
      {task.summary && (
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-3 line-clamp-2">
          {task.summary}
        </p>
      )}

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-3">
        <Badge
          className={cn(
            "text-xs",
            statusConfig.bgColor,
            statusConfig.color
          )}
        >
          {statusConfig.label}
        </Badge>
        {priorityConfig.indicator && (
          <span className={cn("text-sm font-medium", priorityConfig.color)}>
            {priorityConfig.indicator}
          </span>
        )}
      </div>

      {/* Progress Bar (for running tasks) */}
      {hasProgress && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-500">Progress</span>
            <span className="font-medium text-stone-700">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* Workflow Step Indicator */}
      {task.workflow_progress && (
        <div className="flex items-center gap-2 mb-3 text-xs">
          {task.workflow_progress.current_step?.name ? (
            // Show current step name if available
            <span className={cn(
              "font-medium",
              task.status === "running" && "text-blue-600 dark:text-blue-400",
              task.status === "blocked" && "text-red-600 dark:text-red-400",
              task.status !== "running" && task.status !== "blocked" && "text-stone-600 dark:text-stone-400"
            )}>
              {task.status === "running" && "● "}
              {task.status === "blocked" && "⏸ "}
              {task.workflow_progress.current_step.name}
            </span>
          ) : (
            // Show step count if no step name
            <span className="text-stone-500 dark:text-stone-400">
              Step {task.workflow_progress.steps.completed}/{task.workflow_progress.steps.total}
              {task.workflow_progress.steps.failed > 0 && (
                <span className="text-red-500 ml-1">
                  ({task.workflow_progress.steps.failed} failed)
                </span>
              )}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-700">
        <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
          #{task.source_id}
        </span>

        {/* Type badge - small in footer */}
        <Badge
          variant="outline"
          className={cn("text-xs", typeConfig.bgColor, typeConfig.color)}
        >
          {typeConfig.label}
        </Badge>
      </div>
    </div>
  );
}
