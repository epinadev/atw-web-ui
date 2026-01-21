/**
 * Task type selection modal.
 */

"use client";

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
import { TYPE_CONFIG } from "@/lib/constants";
import type { TaskType } from "@/types";

interface TypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentType: TaskType;
  onSubmit: (type: string) => void;
  isPending?: boolean;
}

const TASK_TYPES: { value: TaskType; description: string }[] = [
  { value: "estimation", description: "Quick ticket review and time estimation" },
  { value: "feature-fix", description: "Full development workflow" },
  { value: "code-review", description: "Review pull request or changes" },
  { value: "installation", description: "Deploy or install module" },
  { value: "triage", description: "Initial assessment and categorization" },
  { value: "investigation", description: "Research and troubleshooting" },
];

export function TypeModal({
  open,
  onOpenChange,
  currentType,
  onSubmit,
  isPending,
}: TypeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>Set Task Type</DialogTitle>
        <DialogDescription>
          Choose the workflow type for this task
        </DialogDescription>
      </DialogHeader>

      <DialogContent>
        <div className="space-y-2">
          {TASK_TYPES.map((type) => {
            const config = TYPE_CONFIG[type.value];
            return (
              <button
                key={type.value}
                onClick={() => onSubmit(type.value)}
                disabled={isPending}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3 rounded-lg border text-left transition-colors",
                  currentType === type.value
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                    : "border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-700",
                  isPending && "opacity-50 cursor-not-allowed"
                )}
              >
                <div>
                  <span className={cn("font-medium", config.color)}>
                    {config.label}
                  </span>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                    {type.description}
                  </p>
                </div>
                {currentType === type.value && (
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
                )}
              </button>
            );
          })}
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
