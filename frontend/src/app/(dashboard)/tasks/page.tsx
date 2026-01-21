/**
 * Tasks list page - table view with filters.
 */

"use client";

import { useState, useMemo } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { useTasks } from "@/hooks";
import { Button } from "@/components/ui/button";
import { TaskFilters, TaskTable, TaskDetailPanel } from "@/components/tasks";
import type { Task, TaskStatus, TaskType, WorkflowState } from "@/types";

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null);
  const [typeFilter, setTypeFilter] = useState<TaskType | null>(null);
  const [workflowFilter, setWorkflowFilter] = useState<WorkflowState | null>(null);
  const [includeDone, setIncludeDone] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useTasks({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    include_done: includeDone,
    limit: 200,
  });

  // Filter tasks by search and workflow state (client-side)
  const filteredTasks = useMemo(() => {
    // Handle both array and { tasks: [] } response formats
    let tasks: Task[] = [];
    if (data) {
      tasks = Array.isArray(data) ? data : ((data as any).tasks || []);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.name.toLowerCase().includes(searchLower) ||
          task.source_id?.toLowerCase().includes(searchLower) ||
          task.project?.name.toLowerCase().includes(searchLower)
      );
    }

    // Workflow state filter
    if (workflowFilter) {
      tasks = tasks.filter((task) => task.workflow_state === workflowFilter);
    }

    return tasks;
  }, [data, search, workflowFilter]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-stone-500">Failed to load tasks</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Tasks</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {filteredTasks.length} tasks
            {!Array.isArray(data) && (data as any)?.total && filteredTasks.length !== (data as any).total && ` of ${(data as any).total}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        workflowFilter={workflowFilter}
        onWorkflowFilterChange={setWorkflowFilter}
        includeDone={includeDone}
        onIncludeDoneChange={setIncludeDone}
      />

      {/* Table */}
      <div className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-4">
        <TaskTable
          tasks={filteredTasks}
          onSelectTask={handleSelectTask}
        />
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel task={selectedTask} onClose={handleCloseDetail} />
      )}
    </div>
  );
}
