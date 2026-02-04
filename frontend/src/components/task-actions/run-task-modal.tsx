/**
 * Run task / Create task modal - tabbed wizard for workflow execution and task creation.
 */

"use client";

import { useState } from "react";
import { Play, RotateCcw, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks";
import { TYPE_CONFIG } from "@/lib/constants";
import type { Project, TaskType } from "@/types";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CREATE_TASK_TYPES: { value: TaskType; description: string }[] = [
  { value: "estimation", description: "Quick ticket review and time estimation" },
  { value: "feature-fix", description: "Full development workflow" },
  { value: "code-review", description: "Review pull request or changes" },
  { value: "installation", description: "Deploy or install module" },
  { value: "investigation", description: "Research and troubleshooting" },
];

interface RunTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRunWorkflow: (taskId: string, restart: boolean) => void;
  onCreateTask: (params: {
    project: string;
    name: string;
    task_id?: string;
    task_type?: string;
    description?: string;
  }) => void;
  isPending?: boolean;
}

export function RunTaskModal({
  open,
  onOpenChange,
  onRunWorkflow,
  onCreateTask,
  isPending,
}: RunTaskModalProps) {
  const [activeTab, setActiveTab] = useState<"run" | "create">("run");

  // Run Workflow state
  const [taskId, setTaskId] = useState("");

  // Create Task state
  const [project, setProject] = useState("");
  const [taskName, setTaskName] = useState("");
  const [customId, setCustomId] = useState("");
  const [taskType, setTaskType] = useState("");
  const [description, setDescription] = useState("");

  const { data: projectsData } = useProjects();

  const handleRunSubmit = (restart: boolean) => {
    if (!taskId.trim()) return;
    onRunWorkflow(taskId.trim(), restart);
  };

  const handleCreateSubmit = () => {
    if (!project || !taskName.trim()) return;
    onCreateTask({
      project,
      name: taskName.trim(),
      task_id: customId.trim() || undefined,
      task_type: taskType || undefined,
      description: description.trim() || undefined,
    });
  };

  const handleClose = () => {
    setTaskId("");
    setProject("");
    setTaskName("");
    setCustomId("");
    setTaskType("");
    setDescription("");
    setActiveTab("run");
    onOpenChange(false);
  };

  const inputClasses = cn(
    "w-full px-3 py-2 rounded-lg border text-sm",
    "border-stone-300 dark:border-stone-600",
    "bg-white dark:bg-stone-900",
    "text-stone-900 dark:text-stone-100",
    "placeholder:text-stone-400 dark:placeholder:text-stone-500",
    "focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogClose onClose={handleClose} />
      <DialogHeader>
        <DialogTitle>
          {activeTab === "run" ? "Run Workflow" : "Create Task"}
        </DialogTitle>
        <DialogDescription>
          {activeTab === "run"
            ? "Enter a task ID to trigger its workflow execution"
            : "Register a new task in a project"}
        </DialogDescription>

        {/* Tab selector */}
        <div className="flex gap-1 mt-3 p-1 rounded-lg bg-stone-100 dark:bg-stone-700/50">
          <button
            onClick={() => setActiveTab("run")}
            className={cn(
              "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              activeTab === "run"
                ? "bg-white dark:bg-stone-600 text-stone-900 dark:text-stone-100 shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
            )}
          >
            Run Workflow
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={cn(
              "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              activeTab === "create"
                ? "bg-white dark:bg-stone-600 text-stone-900 dark:text-stone-100 shadow-sm"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
            )}
          >
            Create Task
          </button>
        </div>
      </DialogHeader>

      <DialogContent>
        {activeTab === "run" ? (
          <div className="space-y-4">
            {/* Task ID Input */}
            <div>
              <label
                htmlFor="task-id"
                className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
              >
                Task ID
              </label>
              <input
                id="task-id"
                type="text"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                placeholder="e.g., 12345 or task-slug"
                className={inputClasses}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && taskId.trim()) {
                    handleRunSubmit(false);
                  }
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleRunSubmit(false)}
                disabled={isPending || !taskId.trim()}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-4 rounded-lg border text-left transition-colors",
                  "border-stone-200 dark:border-stone-600",
                  "hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/30",
                  (isPending || !taskId.trim()) && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                  <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <span className="font-medium text-stone-900 dark:text-stone-100">Resume</span>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                    Continue from where the workflow left off
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleRunSubmit(true)}
                disabled={isPending || !taskId.trim()}
                className={cn(
                  "flex items-center gap-4 w-full px-4 py-4 rounded-lg border text-left transition-colors",
                  "border-stone-200 dark:border-stone-600",
                  "hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30",
                  (isPending || !taskId.trim()) && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
                  <RotateCcw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <span className="font-medium text-stone-900 dark:text-stone-100">Restart</span>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                    Start the workflow from the beginning
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Project Selector */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className={inputClasses}
              >
                <option value="">Select a project...</option>
                {(projectsData?.projects || []).map((p: Project) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.domain})
                  </option>
                ))}
              </select>
            </div>

            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="e.g., Fix login page redirect issue"
                className={inputClasses}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && project && taskName.trim()) {
                    handleCreateSubmit();
                  }
                }}
              />
            </div>

            {/* Description (optional) */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Description
                <span className="text-stone-400 dark:text-stone-500 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the task in detail..."
                rows={5}
                className={inputClasses}
                style={{ resize: "vertical" }}
              />
            </div>

            {/* Custom Task ID (optional) */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Task ID
                <span className="text-stone-400 dark:text-stone-500 font-normal ml-1">
                  (optional, auto-generated)
                </span>
              </label>
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="e.g., 12345 or custom-slug"
                className={inputClasses}
              />
            </div>

            {/* Workflow Type Selector */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Workflow Type
                <span className="text-stone-400 dark:text-stone-500 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className={inputClasses}
              >
                <option value="">Select a type...</option>
                {CREATE_TASK_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {TYPE_CONFIG[type.value].label} — {type.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        {activeTab === "create" && (
          <Button
            onClick={handleCreateSubmit}
            disabled={isPending || !project || !taskName.trim()}
            className="!bg-green-600 hover:!bg-green-700 dark:!bg-green-700 dark:hover:!bg-green-600 !text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Task
          </Button>
        )}
      </DialogFooter>
    </Dialog>
  );
}
