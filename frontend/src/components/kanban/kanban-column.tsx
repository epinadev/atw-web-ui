/**
 * Kanban column component.
 */

"use client";

import { useState } from "react";
import { Eye, Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WORKFLOW_STATE_CONFIG } from "@/lib/constants";
import { KanbanCard } from "./kanban-card";
import type { Task, WorkflowState } from "@/types";

interface KanbanColumnProps {
  state: WorkflowState;
  tasks: Task[];
  onSelectTask?: (task: Task) => void;
  defaultExpanded?: boolean;
}

export function KanbanColumn({
  state,
  tasks,
  onSelectTask,
  defaultExpanded = true,
}: KanbanColumnProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const config = WORKFLOW_STATE_CONFIG[state];

  // Empty state messages
  const emptyMessages: Record<WorkflowState, { icon: React.ReactNode; text: string }> = {
    planning: {
      icon: <span className="text-2xl">📋</span>,
      text: "No tasks need planning",
    },
    queued: {
      icon: <Eye className="h-6 w-6 text-stone-300 dark:text-stone-600" />,
      text: "No tasks in queue",
    },
    running: {
      icon: <span className="text-2xl animate-pulse">▶</span>,
      text: "No tasks running",
    },
    review: {
      icon: <Eye className="h-6 w-6 text-stone-300 dark:text-stone-600" />,
      text: "No tasks in review",
    },
  };

  return (
    <div className="flex flex-col w-full lg:min-w-[280px] lg:max-w-[350px] lg:flex-1">
      {/* Column Header - Clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center justify-between px-4 py-3 w-full text-left transition-all",
          isExpanded ? "rounded-t-lg" : "rounded-lg",
          config.bgColor,
          "hover:brightness-95 dark:hover:brightness-110"
        )}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              isExpanded && "rotate-90",
              config.color
            )}
          />
          <h2 className={cn("font-semibold", config.color)}>{config.title}</h2>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              config.bgColor,
              config.color
            )}
          >
            {tasks.length}
          </span>
        </div>

        {/* Column actions */}
        {state === "review" && tasks.length > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 hover:bg-white/50 dark:hover:bg-black/20 rounded"
            title="Clear completed"
          >
            <Trash2 className="h-4 w-4 text-stone-400 dark:text-stone-500" />
          </div>
        )}
      </button>

      {/* Column Content - Collapsible with animation */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "p-2 space-y-2 rounded-b-lg overflow-y-auto",
              "lg:min-h-[200px] lg:max-h-[calc(100vh-280px)]",
              "bg-stone-50/50 dark:bg-stone-800/50"
            )}
          >
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-stone-400 dark:text-stone-500">
                {emptyMessages[state].icon}
                <p className="mt-2 text-sm">{emptyMessages[state].text}</p>
                {state === "review" && (
                  <p className="text-xs mt-1">AI will review completed tasks</p>
                )}
              </div>
            ) : (
              tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onSelect={onSelectTask}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
