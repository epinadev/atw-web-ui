/**
 * Sortable wrapper for KanbanCard - used for drag-and-drop in Queue column.
 */

"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./kanban-card";
import type { Task } from "@/types";

interface SortableKanbanCardProps {
  task: Task;
  onSelect?: (task: Task) => void;
}

export function SortableKanbanCard({ task, onSelect }: SortableKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "z-50 opacity-80 shadow-lg"
      )}
    >
      {/* Drag handle - visible on hover */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing",
          "opacity-0 group-hover:opacity-100 transition-opacity z-10",
          "hover:bg-stone-200/50 dark:hover:bg-stone-600/50 rounded-l-lg",
          isDragging && "opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-stone-400" />
      </div>

      {/* Card with left padding for handle */}
      <div className="pl-2">
        <KanbanCard task={task} onSelect={onSelect} />
      </div>
    </div>
  );
}
