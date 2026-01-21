/**
 * Task types for the 9-state workflow model.
 */

export type TaskStatus =
  | "new"
  | "ready"
  | "running"
  | "approve"
  | "blocked"
  | "redo"
  | "review"
  | "conclude"
  | "done";

export type WorkflowState = "planning" | "queued" | "running" | "review";

export type TaskType =
  | "estimation"
  | "feature-fix"
  | "investigation"
  | "installation"
  | "code-review"
  | "triage"
  | "unclassified";

export interface ProjectSummary {
  id: number;
  name: string;
  domain: string;
}

export interface WorkflowProgress {
  execution_phase: "idle" | "main" | "conclude";
  current_step: {
    id: string | null;
    name: string | null;
  };
  steps: {
    total: number;
    completed: number;
    failed: number;
    skipped: number;
    pending: number;
  };
  progress_percent: number;
}

export interface Task {
  id: number;
  source_id: string | null;
  name: string;
  summary: string | null;
  type: TaskType;
  status: TaskStatus;
  workflow_state: WorkflowState | null;
  priority: number;
  project: ProjectSummary | null;
  tags: string[];
  allocated_hours: number;
  spent_hours: number;
  remaining_hours: number;
  deadline: string | null;
  is_overdue: boolean;
  source_url: string | null;
  resources_path: string | null;
  workflow_progress?: WorkflowProgress | null;
}

export interface TaskPaths {
  resources: string | null;
  ticket_raw: string | null;
  ticket_revised: string | null;
  plan: string | null;
  blockers: string | null;
}

export interface TaskDetail extends Task {
  paths: TaskPaths;
  files_exist: Record<string, boolean>;
}

export interface DashboardColumn {
  state: WorkflowState;
  tasks: Task[];
  count: number;
}

export interface DashboardData {
  columns: Record<WorkflowState, Task[]>;
  counts: Record<WorkflowState, number>;
  needs_attention: number;
  total_active: number;
}

export interface TasksSummary {
  totals: {
    all: number;
    active: number;
    done: number;
    needs_attention: number;
    executor_pickable: number;
    overdue: number;
  };
  by_status: Record<TaskStatus, number>;
  by_workflow_state: Record<WorkflowState, number>;
  by_type: Record<string, number>;
  by_project: Record<string, number>;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

// ==================== File Explorer Types ====================

export interface FileInfo {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  extension: string;
  modified: number;
}

export interface FileListResponse {
  task_id: string;
  resources_path: string;
  current_path: string;
  files: FileInfo[];
}

export interface FileContentResponse {
  task_id: string;
  path: string;
  name: string;
  extension: string;
  size: number;
  content: string;
}
