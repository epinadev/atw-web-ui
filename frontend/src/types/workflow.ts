/**
 * Workflow and executor types.
 */

import type { TaskType, WorkflowProgress } from "./task";

export interface RunningTask {
  source_id: string;
  task_name: string;
  type: TaskType;
  pid: number;
  runtime_seconds: number;
  workflow_progress?: WorkflowProgress;
}

export interface ExecutorStatus {
  is_running: boolean;
  running_tasks: RunningTask[];
  max_parallel: number;
  slots_used: number;
  uptime: string;
  uptime_seconds: number;
  tasks_processed: number;
  tasks_completed: number;
  tasks_failed: number;
}

export interface QueueItem {
  id: number;
  source_id: string;
  name: string;
  type: TaskType;
  priority: number;
  status: string;
  project: string;
}

export interface QueueStatus {
  queue: QueueItem[];
  total: number;
}

export interface WorkflowType {
  name: string;
  enabled: boolean;
  description: string;
}
