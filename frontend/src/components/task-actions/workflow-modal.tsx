/**
 * Workflow run modal - choose to resume or restart.
 */

"use client";

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

interface WorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  onSubmit: (restart: boolean) => void;
  isPending?: boolean;
}

export function WorkflowModal({
  open,
  onOpenChange,
  taskName,
  onSubmit,
  isPending,
}: WorkflowModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>Run Workflow</DialogTitle>
        <DialogDescription>
          Choose how to run the workflow for "{taskName}"
        </DialogDescription>
      </DialogHeader>

      <DialogContent>
        <div className="space-y-3">
          <button
            onClick={() => onSubmit(false)}
            disabled={isPending}
            className={cn(
              "flex items-center gap-4 w-full px-4 py-4 rounded-lg border border-stone-200 dark:border-stone-600 text-left transition-colors hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/30",
              isPending && "opacity-50 cursor-not-allowed"
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
            onClick={() => onSubmit(true)}
            disabled={isPending}
            className={cn(
              "flex items-center gap-4 w-full px-4 py-4 rounded-lg border border-stone-200 dark:border-stone-600 text-left transition-colors hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30",
              isPending && "opacity-50 cursor-not-allowed"
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
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
