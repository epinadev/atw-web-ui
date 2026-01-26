/**
 * React Query hooks for task operations.
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api";
import type { Task, TaskDetail, DashboardData, TasksSummary, TaskListResponse } from "@/types";

export function useTasks(filters?: {
  project?: string;
  status?: string;
  type?: string;
  include_done?: boolean;
  limit?: number;
}) {
  return useQuery<TaskListResponse>({
    queryKey: ["tasks", filters],
    queryFn: () => tasksApi.list(filters),
    staleTime: 10000,
  });
}

export function useTasksDashboard(showProgress = false) {
  return useQuery<DashboardData>({
    queryKey: ["tasks", "dashboard", showProgress],
    queryFn: () => tasksApi.dashboard(showProgress),
    refetchInterval: 5000,
  });
}

export function useTasksSummary() {
  return useQuery<TasksSummary>({
    queryKey: ["tasks", "summary"],
    queryFn: () => tasksApi.summary(),
    staleTime: 30000,
  });
}

export function useTaskDetail(taskId: string | null) {
  return useQuery<TaskDetail>({
    queryKey: ["task", taskId],
    queryFn: () => tasksApi.detail(taskId!),
    enabled: !!taskId,
  });
}

export function useApproveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.approve(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useResetTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.reset(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useWorkflowApprove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.workflowApprove(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useMarkTaskDone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.done(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useSetTaskPriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, priority }: { taskId: string; priority: number }) =>
      tasksApi.setPriority(taskId, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useSetTaskType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, type }: { taskId: string; type: string }) =>
      tasksApi.setType(taskId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCategorizeTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.categorize(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
