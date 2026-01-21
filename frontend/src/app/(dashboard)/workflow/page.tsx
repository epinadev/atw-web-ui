/**
 * Workflow page - executor status and logs.
 */

"use client";

import { useState } from "react";
import { RefreshCw, Loader2, PlayCircle, AlertTriangle } from "lucide-react";
import {
  useExecutorStatus,
  useStartExecutor,
  useStopExecutor,
  useRunAllTasks,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ExecutorStatusPanel, LogsViewer } from "@/components/workflow";

export default function WorkflowPage() {
  const { data: executorStatus, isLoading: statusLoading, refetch: refetchStatus } = useExecutorStatus();
  const [runAllModalOpen, setRunAllModalOpen] = useState(false);

  const startExecutor = useStartExecutor();
  const stopExecutor = useStopExecutor();
  const runAllTasks = useRunAllTasks();

  const handleStartExecutor = () => {
    startExecutor.mutate();
  };

  const handleStopExecutor = () => {
    stopExecutor.mutate();
  };

  const handleRunAll = () => {
    runAllTasks.mutate(undefined, {
      onSuccess: () => {
        setRunAllModalOpen(false);
      },
    });
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Workflow</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Executor status and workflow logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRunAllModalOpen(true)}
            disabled={runAllTasks.isPending}
          >
            <PlayCircle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Run All</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetchStatus()}>
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Executor Status */}
      <div className="shrink-0">
        <ExecutorStatusPanel
          status={executorStatus as any}
          onStart={handleStartExecutor}
          onStop={handleStopExecutor}
          isStarting={startExecutor.isPending}
          isStopping={stopExecutor.isPending}
        />
      </div>

      {/* Logs - fills remaining space */}
      <Card className="flex flex-col flex-1 min-h-0">
        <CardHeader className="pb-2 shrink-0">
          <CardTitle className="text-lg">
            Workflow Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden min-h-0">
          <LogsViewer lines={500} />
        </CardContent>
      </Card>

      {/* Run All Confirmation Modal */}
      <Dialog open={runAllModalOpen} onOpenChange={setRunAllModalOpen}>
        <DialogClose onClose={() => setRunAllModalOpen(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Run All Tasks
          </DialogTitle>
          <DialogDescription>
            This will import and queue ALL pending tasks from Odoo for execution.
            This action may take a while and process a large number of tasks.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Are you sure you want to proceed?
          </p>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setRunAllModalOpen(false)}
            disabled={runAllTasks.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRunAll}
            disabled={runAllTasks.isPending}
          >
            {runAllTasks.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              "Run All Tasks"
            )}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
