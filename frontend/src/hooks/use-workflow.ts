/**
 * React Query hooks for workflow operations.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workflowApi, executorApi, syncApi, logsApi, tasksApi } from "@/lib/api";
import type { ExecutorStatus, QueueStatus, WorkflowType } from "@/types";

export function useExecutorStatus() {
  return useQuery<ExecutorStatus>({
    queryKey: ["executor", "status"],
    queryFn: () => executorApi.status(),
    refetchInterval: 3000, // Poll every 3 seconds
  });
}

export function useWorkflowQueue() {
  return useQuery<QueueStatus>({
    queryKey: ["workflow", "queue"],
    queryFn: () => workflowApi.queue(),
    staleTime: 5000,
  });
}

export function useWorkflowTypes() {
  return useQuery<WorkflowType[]>({
    queryKey: ["workflow", "types"],
    queryFn: () => workflowApi.types(),
    staleTime: 60000,
  });
}

export function useStartExecutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => executorApi.start(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executor"] });
    },
  });
}

export function useStopExecutorTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => executorApi.stopTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executor"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useStopExecutor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => executorApi.stop(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executor"] });
    },
  });
}

export function useRunAllTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => executorApi.runAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executor"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["workflow", "queue"] });
    },
  });
}

export function useRunWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      options,
    }: {
      taskId: string;
      options?: { restart?: boolean; now?: boolean };
    }) => workflowApi.run(taskId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["workflow"] });
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      project: string;
      name: string;
      task_id?: string;
      task_type?: string;
      description?: string;
    }) => tasksApi.register(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useStopWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => workflowApi.stop(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["executor"] });
    },
  });
}

export function useFixWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => workflowApi.fix(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["workflow"] });
    },
  });
}

export function useCreateTimesheet() {
  return useMutation({
    mutationFn: ({ taskId, prompt, dryRun }: { taskId: string; prompt: string; dryRun?: boolean }) =>
      workflowApi.timesheet(taskId, prompt, dryRun),
  });
}

export function useClearQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => workflowApi.clearQueue(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow", "queue"] });
    },
  });
}

export function useSyncData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options?: {
      dry_run?: boolean;
      to_remote?: boolean;
      from_remote?: boolean;
    }) => syncApi.data(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useSyncTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncApi.tasks(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useWorkflowLogs(lines = 100) {
  return useQuery<{ logs: string }>({
    queryKey: ["workflow", "logs", lines],
    queryFn: () => logsApi.get(lines),
    refetchInterval: 5000, // Refresh every 5 seconds
    retry: 1, // Only retry once to avoid long loading states
    retryDelay: 1000,
  });
}

export function useClearLogs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logsApi.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow", "logs"] });
    },
  });
}
