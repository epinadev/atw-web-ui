/**
 * Kanban board component - main 4-column view.
 */

"use client";

import { useState } from "react";
import { RefreshCw, Loader2, Play } from "lucide-react";
import { useTasksDashboard, useRunWorkflow } from "@/hooks";
import { useToast } from "@/components/ui/toast";
import { WORKFLOW_STATE_ORDER } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { RunTaskModal } from "@/components/task-actions";
import { KanbanColumn } from "./kanban-column";
import type { Task, WorkflowState } from "@/types";

interface KanbanBoardProps {
  onSelectTask?: (task: Task) => void;
}

export function KanbanBoard({ onSelectTask }: KanbanBoardProps) {
  const { data, isLoading, isError, refetch, isFetching } = useTasksDashboard(true);
  const [runTaskModalOpen, setRunTaskModalOpen] = useState(false);
  const runWorkflow = useRunWorkflow();
  const { showToast, updateToast } = useToast();

  const handleRunTask = (taskId: string, restart: boolean) => {
    // Close modal immediately
    setRunTaskModalOpen(false);

    // Show loading toast
    const toastId = showToast(
      restart ? `Restarting workflow for #${taskId}...` : `Queueing workflow for #${taskId}...`,
      "loading"
    );

    runWorkflow.mutate(
      { taskId, options: { restart } },
      {
        onSuccess: () => {
          updateToast(toastId, restart ? "Workflow restarted" : "Workflow queued", "success");
          refetch();
        },
        onError: (error: any) => {
          const msg = error?.message || error?.data?.detail || "Unknown error";
          updateToast(toastId, `Failed: ${msg}`, "error");
        },
      }
    );
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

  const columns = (data as any)?.columns ?? {
    planning: [],
    queued: [],
    running: [],
    review: [],
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Kanban Board</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {(data as any)?.total_active ?? 0} active tasks
            {((data as any)?.needs_attention ?? 0) > 0 && (
              <span className="text-yellow-600 dark:text-yellow-400 ml-2">
                ({(data as any)?.needs_attention} need attention)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setRunTaskModalOpen(true)}
            className="!bg-green-600 hover:!bg-green-700 dark:!bg-green-700 dark:hover:!bg-green-600 !text-white"
          >
            <Play className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Run Task</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 sm:mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh Tasks</span>
          </Button>
        </div>
      </div>

      {/* Run Task Modal */}
      <RunTaskModal
        open={runTaskModalOpen}
        onOpenChange={setRunTaskModalOpen}
        onSubmit={handleRunTask}
      />

      {/* Kanban Columns - Stack on mobile, horizontal on desktop */}
      <div className="flex flex-col gap-4 lg:flex-row lg:overflow-x-auto lg:pb-4">
        {WORKFLOW_STATE_ORDER.map((state, index) => (
          <KanbanColumn
            key={state}
            state={state as WorkflowState}
            tasks={columns[state as WorkflowState] || []}
            onSelectTask={onSelectTask}
            defaultExpanded
          />
        ))}
      </div>
    </div>
  );
}
