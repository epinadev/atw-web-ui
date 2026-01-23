/**
 * Kanban column component.
 * Queue column supports drag-and-drop for priority reordering.
 */

"use client";

import { useState, useMemo } from "react";
import { Eye, Trash2, ChevronRight } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { WORKFLOW_STATE_CONFIG } from "@/lib/constants";
import { useSetTaskPriority } from "@/hooks";
import { KanbanCard } from "./kanban-card";
import { SortableKanbanCard } from "./sortable-kanban-card";
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
  const setTaskPriority = useSetTaskPriority();

  const isQueueColumn = state === "queued";

  // Drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Task IDs for sortable context
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  // Handle drag end - update priority based on new position
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Calculate new priority based on position
    let newPriority: number;

    if (newIndex === 0) {
      // Moving to first - priority lower than current first
      const firstPriority = tasks[0]?.priority ?? 100;
      newPriority = Math.max(1, firstPriority - 10);
    } else if (newIndex >= tasks.length - 1) {
      // Moving to last - priority higher than current last
      const lastPriority = tasks[tasks.length - 1]?.priority ?? 100;
      newPriority = lastPriority + 10;
    } else {
      // Moving between two tasks - average their priorities
      const targetIndex = oldIndex < newIndex ? newIndex : newIndex - 1;
      const prevPriority = tasks[targetIndex]?.priority ?? 100;
      const nextPriority = tasks[targetIndex + 1]?.priority ?? prevPriority + 20;
      newPriority = Math.round((prevPriority + nextPriority) / 2);
    }

    // Clamp to valid range
    newPriority = Math.max(1, Math.min(200, newPriority));

    setTaskPriority.mutate({
      taskId: active.id as string,
      priority: newPriority,
    });
  };

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

  // Render task cards - with or without drag-and-drop
  const renderTasks = () => {
    if (tasks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-stone-400 dark:text-stone-500">
          {emptyMessages[state].icon}
          <p className="mt-2 text-sm">{emptyMessages[state].text}</p>
          {state === "review" && (
            <p className="text-xs mt-1">AI will review completed tasks</p>
          )}
        </div>
      );
    }

    if (isQueueColumn) {
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <SortableKanbanCard key={task.id} task={task} onSelect={onSelectTask} />
            ))}
          </SortableContext>
        </DndContext>
      );
    }

    return tasks.map((task) => (
      <KanbanCard key={task.id} task={task} onSelect={onSelectTask} />
    ));
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
            {renderTasks()}
          </div>
        </div>
      </div>
    </div>
  );
}
