/**
 * Priority selection modal.
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
import { PRIORITY_LEVELS } from "@/lib/constants";

interface PriorityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPriority: number;
  onSubmit: (priority: number) => void;
  isPending?: boolean;
}

export function PriorityModal({
  open,
  onOpenChange,
  currentPriority,
  onSubmit,
  isPending,
}: PriorityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle>Set Priority</DialogTitle>
        <DialogDescription>
          Lower values = higher priority. Current: {currentPriority}
        </DialogDescription>
      </DialogHeader>

      <DialogContent>
        <div className="grid grid-cols-2 gap-2">
          {PRIORITY_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => onSubmit(level.value)}
              disabled={isPending}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors",
                currentPriority === level.value
                  ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                  : "border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-700",
                isPending && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="font-medium text-stone-900 dark:text-stone-100">{level.label}</span>
              <span className={cn("text-sm", level.color)}>{level.value}</span>
            </button>
          ))}
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
