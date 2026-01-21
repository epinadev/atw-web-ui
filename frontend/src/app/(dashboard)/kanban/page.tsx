/**
 * Kanban board page - main view of the application.
 */

"use client";

import { useState } from "react";
import { KanbanBoard } from "@/components/kanban";
import { TaskDetailPanel } from "@/components/tasks";
import type { Task } from "@/types";

export default function KanbanPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  return (
    <>
      <KanbanBoard onSelectTask={handleSelectTask} />
      {selectedTask && (
        <TaskDetailPanel task={selectedTask} onClose={handleCloseDetail} />
      )}
    </>
  );
}
