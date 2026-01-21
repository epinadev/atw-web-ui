/**
 * Task detail panel with file explorer.
 * Shows task details and allows browsing task files.
 */

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  ExternalLink,
  Clock,
  Folder,
  FileText,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { cn, truncate, getTaskDisplayId } from "@/lib/utils";
import { STATUS_CONFIG, TYPE_CONFIG, getPriorityConfig } from "@/lib/constants";
import { tasksApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TaskActionsMenu } from "@/components/task-actions";
import { FileExplorer } from "@/components/files";
import type { Task, TaskDetail } from "@/types";

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
}

type View = "details" | "files";

export function TaskDetailPanel({ task, onClose }: TaskDetailPanelProps) {
  const [view, setView] = useState<View>("details");
  const [selectedQuickFile, setSelectedQuickFile] = useState<string | null>(null);

  const handleQuickFileClick = (filename: string) => {
    setSelectedQuickFile(filename);
    setView("files");
  };

  // Fetch full task details
  const { data: taskDetail, isLoading } = useQuery<TaskDetail>({
    queryKey: ["task-detail", task.source_id || task.id],
    queryFn: () => tasksApi.detail(task.source_id || String(task.id)),
  });

  const statusConfig = STATUS_CONFIG[task.status];
  const typeConfig = TYPE_CONFIG[task.type];
  const priorityConfig = getPriorityConfig(task.priority);
  const progress = task.workflow_progress?.progress_percent ?? 0;
  const taskId = task.source_id || String(task.id);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-stone-900 shadow-2xl border-l border-stone-200 dark:border-stone-700 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-stone-900 dark:text-stone-100">
              {truncate(task.name, 40)}
            </h2>
            <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
              <span>{getTaskDisplayId(task)}</span>
              {task.project && (
                <>
                  <span className="text-stone-300 dark:text-stone-600">|</span>
                  <span>{task.project.name}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <TaskActionsMenu task={task} />
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-700">
        <button
          onClick={() => {
            setView("details");
            setSelectedQuickFile(null);
          }}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            view === "details"
              ? "text-amber-700 dark:text-amber-400 border-b-2 border-amber-500 bg-amber-50/50 dark:bg-amber-900/20"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
          )}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Details
        </button>
        <button
          onClick={() => {
            setView("files");
            setSelectedQuickFile(null);
          }}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors",
            view === "files"
              ? "text-amber-700 dark:text-amber-400 border-b-2 border-amber-500 bg-amber-50/50 dark:bg-amber-900/20"
              : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
          )}
        >
          <Folder className="h-4 w-4 inline mr-2" />
          Files
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {view === "details" ? (
          <div className="p-6 space-y-6">
            {/* Status & Type */}
            <div className="flex items-center gap-3">
              <Badge
                className={cn(
                  "text-sm",
                  statusConfig.bgColor,
                  statusConfig.color
                )}
              >
                {statusConfig.label}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-sm", typeConfig.bgColor, typeConfig.color)}
              >
                {typeConfig.label}
              </Badge>
              {priorityConfig.indicator && (
                <span className={cn("text-sm font-medium", priorityConfig.color)}>
                  Priority: {task.priority} {priorityConfig.indicator}
                </span>
              )}
            </div>

            {/* Progress */}
            {task.workflow_progress && (
              <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    Workflow Progress
                  </span>
                  <span className="text-stone-500 dark:text-stone-400">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className={
                    task.status === "running" ? "text-blue-600 dark:text-blue-400 font-medium" :
                    task.status === "blocked" ? "text-red-600 dark:text-red-400 font-medium" :
                    "text-stone-500 dark:text-stone-400"
                  }>
                    {task.status === "running" && "● "}
                    {task.status === "blocked" && "⏸ "}
                    {task.workflow_progress.current_step?.name || `Step ${task.workflow_progress.steps.completed + 1}`}
                  </span>
                  <span className="text-stone-500 dark:text-stone-400">
                    {task.workflow_progress.steps.completed}/
                    {task.workflow_progress.steps.total}
                  </span>
                </div>
              </div>
            )}

            {/* Summary */}
            {task.summary && (
              <div>
                <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Summary
                </h3>
                <p className="text-stone-600 dark:text-stone-400">{task.summary}</p>
              </div>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs dark:border-stone-600 dark:text-stone-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Time Tracking */}
            <div className="bg-stone-50 dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-700">
              <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
                Time Tracking
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
                    {task.allocated_hours || 0}h
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Allocated</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                    {task.spent_hours || 0}h
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Spent</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
                    {task.remaining_hours || 0}h
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">Remaining</div>
                </div>
              </div>
            </div>

            {/* Links */}
            {task.source_url && (
              <div>
                <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  External Link
                </h3>
                <a
                  href={task.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Odoo
                </a>
              </div>
            )}

            {/* Quick Files Access */}
            {taskDetail?.files_exist && (
              <div>
                <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Quick Files
                </h3>
                <div className="space-y-1">
                  {taskDetail.files_exist.ticket_revised && (
                    <button
                      onClick={() => handleQuickFileClick("TICKET_REVISED.md")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors"
                    >
                      <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      TICKET_REVISED.md
                      <ChevronRight className="h-4 w-4 ml-auto text-stone-400 dark:text-stone-500" />
                    </button>
                  )}
                  {taskDetail.files_exist.plan && (
                    <button
                      onClick={() => handleQuickFileClick("PLAN.md")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors"
                    >
                      <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      PLAN.md
                      <ChevronRight className="h-4 w-4 ml-auto text-stone-400 dark:text-stone-500" />
                    </button>
                  )}
                  {taskDetail.files_exist.blockers && (
                    <button
                      onClick={() => handleQuickFileClick("BLOCKERS.md")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-colors"
                    >
                      <FileText className="h-4 w-4 text-red-500 dark:text-red-400" />
                      BLOCKERS.md
                      <ChevronRight className="h-4 w-4 ml-auto text-stone-400 dark:text-stone-500" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <FileExplorer taskId={taskId} initialFile={selectedQuickFile || undefined} />
        )}
      </div>
      </div>
    </>
  );
}
