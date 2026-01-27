/**
 * Task actions dropdown menu - provides all available actions for a task.
 * Actions are contextual based on task status.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Check,
  RotateCcw,
  Play,
  Square,
  CheckCircle2,
  Sparkles,
  Gauge,
  Tag,
  ExternalLink,
  Trash2,
  Wrench,
  Clock,
  Terminal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { PriorityModal } from "./priority-modal";
import { TypeModal } from "./type-modal";
import { WorkflowModal } from "./workflow-modal";
import { DeleteModal } from "./delete-modal";
import { TimesheetModal } from "./timesheet-modal";
import {
  useApproveTask,
  useResetTask,
  useMarkTaskDone,
  useSetTaskPriority,
  useSetTaskType,
  useCategorizeTask,
  useDeleteTask,
} from "@/hooks";
import { useRunWorkflow, useStopWorkflow, useStopExecutorTask, useFixWorkflow, useCreateTimesheet } from "@/hooks";
import type { Task } from "@/types";

interface TaskActionsMenuProps {
  task: Task;
  onSuccess?: () => void;
}

export function TaskActionsMenu({ task, onSuccess }: TaskActionsMenuProps) {
  const router = useRouter();
  const { showToast, updateToast } = useToast();
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [timesheetModalOpen, setTimesheetModalOpen] = useState(false);

  // Mutations
  const approveTask = useApproveTask();
  const resetTask = useResetTask();
  const markDone = useMarkTaskDone();
  const setPriority = useSetTaskPriority();
  const setType = useSetTaskType();
  const categorize = useCategorizeTask();
  const deleteTask = useDeleteTask();
  const runWorkflow = useRunWorkflow();
  const stopWorkflow = useStopWorkflow();
  const stopExecutorTask = useStopExecutorTask();
  const fixWorkflow = useFixWorkflow();
  const createTimesheet = useCreateTimesheet();

  const isPending =
    approveTask.isPending ||
    resetTask.isPending ||
    markDone.isPending ||
    setPriority.isPending ||
    setType.isPending ||
    categorize.isPending ||
    deleteTask.isPending ||
    runWorkflow.isPending ||
    stopWorkflow.isPending ||
    stopExecutorTask.isPending ||
    fixWorkflow.isPending ||
    createTimesheet.isPending;

  // Action availability based on status
  // 'atw tasks approve' handles all human review states: approve, blocked, review -> conclude
  const canApprove = task.status === "approve" || task.status === "blocked" || task.status === "review";
  const canStop = task.status === "running";
  const canRunWorkflow = task.status !== "running" && task.status !== "done";

  // Get task ID (prefer source_id, fallback to id as string)
  const taskId = task.source_id || String(task.id);

  // Handlers
  const handleApprove = () => {
    approveTask.mutate(taskId, { onSuccess });
  };

  const handleReset = () => {
    resetTask.mutate(taskId, { onSuccess });
  };

  const handleDone = () => {
    markDone.mutate(taskId, { onSuccess });
  };

  const handleStop = () => {
    stopExecutorTask.mutate(taskId, { onSuccess });
  };

  const handleCategorize = () => {
    const toastId = showToast("Categorizing task...", "loading");
    categorize.mutate(taskId, {
      onSuccess: () => {
        updateToast(toastId, "Task categorized", "success");
        onSuccess?.();
      },
      onError: (error) => {
        updateToast(toastId, `Failed: ${error.message}`, "error");
      },
    });
  };

  const handleFixWorkflow = () => {
    const toastId = showToast("Running AI fix (this may take a while)...", "loading");
    fixWorkflow.mutate(taskId, {
      onSuccess: () => {
        updateToast(toastId, "Workflow fixed", "success");
        onSuccess?.();
      },
      onError: (error) => {
        updateToast(toastId, `Fix failed: ${error.message}`, "error");
      },
    });
  };

  const handleCreateTimesheet = (prompt: string) => {
    setTimesheetModalOpen(false);
    const toastId = showToast("Creating timesheet...", "loading");
    createTimesheet.mutate(
      { taskId, prompt },
      {
        onSuccess: () => {
          updateToast(toastId, "Timesheet created", "success");
          onSuccess?.();
        },
        onError: (error) => {
          updateToast(toastId, `Failed: ${error.message}`, "error");
        },
      }
    );
  };

  const handlePriorityChange = (priority: number) => {
    setPriorityModalOpen(false);
    setPriority.mutate({ taskId, priority }, { onSuccess });
  };

  const handleTypeChange = (type: string) => {
    setTypeModalOpen(false);
    setType.mutate({ taskId, type }, { onSuccess });
  };

  const handleWorkflowRun = (restart: boolean) => {
    setWorkflowModalOpen(false);
    const toastId = showToast(
      restart ? "Restarting workflow..." : "Queueing workflow...",
      "loading"
    );
    runWorkflow.mutate(
      { taskId, options: { restart } },
      {
        onSuccess: () => {
          updateToast(
            toastId,
            restart ? "Workflow restarted" : "Workflow queued",
            "success"
          );
          onSuccess?.();
        },
        onError: (error) => {
          updateToast(toastId, `Failed: ${error.message}`, "error");
        },
      }
    );
  };

  const handleDelete = () => {
    deleteTask.mutate(taskId, { onSuccess });
    setDeleteModalOpen(false);
  };

  // Open URL in new tab
  const handleOpenUrl = () => {
    if (task.source_url) {
      window.open(task.source_url, "_blank");
    }
  };

  return (
    <>
      <DropdownMenu
        trigger={
          <button
            className="p-1 hover:bg-stone-100 rounded shrink-0"
            disabled={isPending}
          >
            <MoreVertical className="h-4 w-4 text-stone-400" />
          </button>
        }
      >
        {/* State Transitions */}
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        {canApprove && (
          <DropdownMenuItem
            onClick={handleApprove}
            icon={<Check className="h-4 w-4" />}
          >
            Approve
          </DropdownMenuItem>
        )}

        {canStop && (
          <DropdownMenuItem
            onClick={handleStop}
            icon={<Square className="h-4 w-4" />}
          >
            Stop
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={handleReset}
          icon={<RotateCcw className="h-4 w-4" />}
        >
          Reset (to Redo)
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleDone}
          icon={<CheckCircle2 className="h-4 w-4" />}
        >
          Mark Done
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Workflow */}
        <DropdownMenuLabel>Workflow</DropdownMenuLabel>

        {canRunWorkflow && (
          <DropdownMenuItem
            onClick={() => setWorkflowModalOpen(true)}
            icon={<Play className="h-4 w-4" />}
          >
            Run Workflow
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={handleCategorize}
          icon={<Sparkles className="h-4 w-4" />}
        >
          AI Categorize
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleFixWorkflow}
          icon={<Wrench className="h-4 w-4" />}
        >
          Fix Workflow
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTimesheetModalOpen(true)}
          icon={<Clock className="h-4 w-4" />}
        >
          Create Timesheet
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push(`/session/${taskId}`)}
          icon={<Terminal className="h-4 w-4" />}
        >
          Interactive Session
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Settings */}
        <DropdownMenuLabel>Settings</DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => setPriorityModalOpen(true)}
          icon={<Gauge className="h-4 w-4" />}
        >
          Set Priority
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTypeModalOpen(true)}
          icon={<Tag className="h-4 w-4" />}
        >
          Set Type
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Open */}
        <DropdownMenuLabel>Open</DropdownMenuLabel>

        {task.source_url && (
          <DropdownMenuItem
            onClick={handleOpenUrl}
            icon={<ExternalLink className="h-4 w-4" />}
          >
            Open URL
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Danger Zone */}
        <DropdownMenuItem
          onClick={() => setDeleteModalOpen(true)}
          icon={<Trash2 className="h-4 w-4" />}
          destructive
        >
          Delete Task
        </DropdownMenuItem>
      </DropdownMenu>

      {/* Modals */}
      <PriorityModal
        open={priorityModalOpen}
        onOpenChange={setPriorityModalOpen}
        currentPriority={task.priority}
        onSubmit={handlePriorityChange}
        isPending={setPriority.isPending}
      />

      <TypeModal
        open={typeModalOpen}
        onOpenChange={setTypeModalOpen}
        currentType={task.type}
        onSubmit={handleTypeChange}
        isPending={setType.isPending}
      />

      <WorkflowModal
        open={workflowModalOpen}
        onOpenChange={setWorkflowModalOpen}
        taskName={task.name}
        onSubmit={handleWorkflowRun}
      />

      <DeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        taskName={task.name}
        onConfirm={handleDelete}
        isPending={deleteTask.isPending}
      />

      <TimesheetModal
        open={timesheetModalOpen}
        onOpenChange={setTimesheetModalOpen}
        taskName={task.name}
        onSubmit={handleCreateTimesheet}
      />
    </>
  );
}
