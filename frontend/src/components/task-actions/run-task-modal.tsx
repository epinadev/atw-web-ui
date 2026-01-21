/**
 * Run task modal - enter a task ID to trigger workflow.
 */

"use client";

import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface RunTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (taskId: string, restart: boolean) => void;
  isPending?: boolean;
}

export function RunTaskModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: RunTaskModalProps) {
  const [taskId, setTaskId] = useState("");

  const handleSubmit = (restart: boolean) => {
    if (!taskId.trim()) return;
    onSubmit(taskId.trim(), restart);
  };

  const handleClose = () => {
    setTaskId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogClose onClose={handleClose} />
      <DialogHeader>
        <DialogTitle>Run Workflow</DialogTitle>
        <DialogDescription>
          Enter a task ID to trigger its workflow execution
        </DialogDescription>
      </DialogHeader>

      <DialogContent>
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
              className={cn(
                "w-full px-3 py-2 rounded-lg border text-sm",
                "border-stone-300 dark:border-stone-600",
                "bg-white dark:bg-stone-900",
                "text-stone-900 dark:text-stone-100",
                "placeholder:text-stone-400 dark:placeholder:text-stone-500",
                "focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent"
              )}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && taskId.trim()) {
                  handleSubmit(false);
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleSubmit(false)}
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
              onClick={() => handleSubmit(true)}
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
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
