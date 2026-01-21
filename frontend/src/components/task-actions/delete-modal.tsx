/**
 * Delete confirmation modal.
 */

"use client";

import { AlertTriangle } from "lucide-react";
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

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function DeleteModal({
  open,
  onOpenChange,
  taskName,
  onConfirm,
  isPending,
}: DeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogClose onClose={() => onOpenChange(false)} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Delete Task
        </DialogTitle>
        <DialogDescription>
          This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <DialogContent>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            Are you sure you want to delete <strong>"{taskName}"</strong>?
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            This will permanently remove the task and all its resources.
          </p>
        </div>
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete Task"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
