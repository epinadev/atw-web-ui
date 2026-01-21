/**
 * Task table component.
 */

"use client";

import { ExternalLink } from "lucide-react";
import { cn, getTaskDisplayId, truncate } from "@/lib/utils";
import { STATUS_CONFIG, TYPE_CONFIG, getPriorityConfig } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { TaskActionsMenu } from "@/components/task-actions";
import type { Task } from "@/types";

interface TaskTableProps {
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
}

export function TaskTable({ tasks, onSelectTask }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-stone-500 dark:text-stone-400">
        No tasks found matching your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-700 text-left text-sm text-stone-500 dark:text-stone-400">
            <th className="pb-3 font-medium">ID</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Type</th>
            <th className="pb-3 font-medium">Project</th>
            <th className="pb-3 font-medium">Priority</th>
            <th className="pb-3 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => {
            const statusConfig = STATUS_CONFIG[task.status];
            const typeConfig = TYPE_CONFIG[task.type];
            const priorityConfig = getPriorityConfig(task.priority);

            return (
              <tr
                key={task.id}
                className={cn(
                  "border-b border-stone-100 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700 cursor-pointer transition-colors",
                  index % 2 === 0 && "bg-white dark:bg-stone-800",
                  index % 2 === 1 && "bg-stone-50 dark:bg-stone-900"
                )}
                onClick={() => onSelectTask?.(task)}
              >
                <td className="py-3 pr-4">
                  <span className="font-mono text-sm text-stone-600 dark:text-stone-400">
                    {getTaskDisplayId(task)}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <Badge className={cn("text-xs", statusConfig.bgColor, statusConfig.color)}>
                    <span className="mr-1">{statusConfig.icon}</span>
                    {statusConfig.label}
                  </Badge>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-900 dark:text-stone-100">
                      {truncate(task.name, 50)}
                    </span>
                    {task.source_url && (
                      <a
                        href={task.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {task.project && (
                    <span className="text-xs text-stone-500 dark:text-stone-400">{task.project.name}</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant="outline" className={cn("text-xs", typeConfig.bgColor, typeConfig.color)}>
                    {typeConfig.label}
                  </Badge>
                </td>
                <td className="py-3 pr-4 text-sm text-stone-600 dark:text-stone-400">
                  {task.project?.name || "-"}
                </td>
                <td className="py-3 pr-4">
                  <span className={cn("text-sm font-medium", priorityConfig.color)}>
                    {priorityConfig.indicator && <span className="mr-1">{priorityConfig.indicator}</span>}
                    {task.priority}
                  </span>
                </td>
                <td className="py-3" onClick={(e) => e.stopPropagation()}>
                  <TaskActionsMenu task={task} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
