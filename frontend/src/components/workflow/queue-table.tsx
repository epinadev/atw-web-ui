/**
 * Workflow queue table component.
 */

"use client";

import { Play } from "lucide-react";
import { cn, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TYPE_CONFIG, STATUS_CONFIG, getPriorityConfig } from "@/lib/constants";
import type { QueueItem } from "@/types";

interface QueueTableProps {
  queue: QueueItem[];
  onRunTask?: (taskId: string) => void;
}

export function QueueTable({ queue, onRunTask }: QueueTableProps) {
  if (queue.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500 dark:text-stone-400">
        Queue is empty. Tasks in READY or CONCLUDE status will appear here.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-700 text-left text-sm text-stone-500 dark:text-stone-400">
            <th className="pb-2 font-medium">#</th>
            <th className="pb-2 font-medium">ID</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Priority</th>
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody>
          {queue.map((item, index) => {
            const typeConfig = TYPE_CONFIG[item.type] || TYPE_CONFIG.unclassified;
            const statusConfig = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.new;
            const priorityConfig = getPriorityConfig(item.priority);

            return (
              <tr
                key={item.id}
                className={cn(
                  "border-b border-stone-100 dark:border-stone-700",
                  index % 2 === 0 && "bg-white dark:bg-stone-800",
                  index % 2 === 1 && "bg-stone-50 dark:bg-stone-900"
                )}
              >
                <td className="py-2 pr-3 text-stone-400 dark:text-stone-500 text-sm">{index + 1}</td>
                <td className="py-2 pr-3">
                  <span className="font-mono text-sm text-stone-600 dark:text-stone-400">{item.source_id}</span>
                </td>
                <td className="py-2 pr-3">
                  <Badge className={cn("text-xs", statusConfig.bgColor, statusConfig.color)}>
                    {statusConfig.icon} {statusConfig.label}
                  </Badge>
                </td>
                <td className="py-2 pr-3">
                  <Badge variant="outline" className={cn("text-xs", typeConfig.bgColor, typeConfig.color)}>
                    {typeConfig.label}
                  </Badge>
                </td>
                <td className="py-2 pr-3">
                  <span className={cn("text-sm font-medium", priorityConfig.color)}>
                    {priorityConfig.indicator && <span className="mr-1">{priorityConfig.indicator}</span>}
                    {item.priority}
                  </span>
                </td>
                <td className="py-2 pr-3 text-sm text-stone-900 dark:text-stone-100">{truncate(item.name, 40)}</td>
                <td className="py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRunTask?.(item.source_id)}
                    className="h-7 w-7 p-0"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
