/**
 * Timesheet creation modal - enter time allocation details.
 */

"use client";

import { useState } from "react";
import { Clock, Loader2 } from "lucide-react";
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

interface TimesheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  onSubmit: (prompt: string) => void;
  isPending?: boolean;
}

export function TimesheetModal({
  open,
  onOpenChange,
  taskName,
  onSubmit,
  isPending,
}: TimesheetModalProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const handleClose = () => {
    setPrompt("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogClose onClose={handleClose} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Create Timesheet
        </DialogTitle>
        <DialogDescription>
          Describe how to distribute time for "{taskName}"
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="timesheet-prompt"
                className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"
              >
                Time allocation
              </label>
              <textarea
                id="timesheet-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 3h for today, divide in 1.5h each"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                disabled={isPending}
                autoFocus
              />
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                Examples: "2h yesterday, 1.5h today" or "4h last Friday"
              </p>
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !prompt.trim()}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>Create Timesheet</>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
