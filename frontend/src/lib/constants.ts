/**
 * Constants for status display and workflow configuration.
 */

import type { TaskStatus, WorkflowState, TaskType } from "@/types";

export interface StatusConfig {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}

export const STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  new: {
    icon: "○",
    color: "text-gray-500 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    borderColor: "border-gray-300 dark:border-gray-600",
    label: "New",
  },
  ready: {
    icon: "◎",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/40",
    borderColor: "border-cyan-300 dark:border-cyan-700",
    label: "Ready",
  },
  running: {
    icon: "▶",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/40",
    borderColor: "border-blue-300 dark:border-blue-700",
    label: "Running",
  },
  approve: {
    icon: "?",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/40",
    borderColor: "border-purple-300 dark:border-purple-700",
    label: "Needs Approval",
  },
  blocked: {
    icon: "!",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/40",
    borderColor: "border-red-300 dark:border-red-700",
    label: "Blocked",
  },
  redo: {
    icon: "↻",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/40",
    borderColor: "border-yellow-300 dark:border-yellow-700",
    label: "Redo",
  },
  review: {
    icon: "R",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/40",
    borderColor: "border-amber-300 dark:border-amber-700",
    label: "Needs Review",
  },
  conclude: {
    icon: "C",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-900/40",
    borderColor: "border-teal-300 dark:border-teal-700",
    label: "Conclude",
  },
  done: {
    icon: "✓",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/40",
    borderColor: "border-green-300 dark:border-green-700",
    label: "Complete",
  },
};

export interface WorkflowStateConfig {
  title: string;
  color: string;
  bgColor: string;
  statuses: TaskStatus[];
}

export const WORKFLOW_STATE_CONFIG: Record<WorkflowState, WorkflowStateConfig> =
  {
    planning: {
      title: "Planning",
      color: "text-purple-700 dark:text-purple-300",
      bgColor: "bg-purple-50/80 dark:bg-purple-900/30",
      statuses: ["new", "blocked", "redo", "approve"],
    },
    queued: {
      title: "Queued",
      color: "text-cyan-700 dark:text-cyan-300",
      bgColor: "bg-cyan-50/80 dark:bg-cyan-900/30",
      statuses: ["ready", "conclude"],
    },
    running: {
      title: "Running",
      color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-50/80 dark:bg-green-900/30",
      statuses: ["running"],
    },
    review: {
      title: "Review",
      color: "text-amber-700 dark:text-amber-300",
      bgColor: "bg-amber-50/80 dark:bg-amber-900/30",
      statuses: ["review"],
    },
  };

export const WORKFLOW_STATE_ORDER: WorkflowState[] = [
  "planning",
  "queued",
  "running",
  "review",
];

export const TYPE_CONFIG: Record<
  TaskType,
  { label: string; color: string; bgColor: string }
> = {
  estimation: {
    label: "Estimation",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
  },
  "feature-fix": {
    label: "Feature/Fix",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-100 dark:bg-green-900/50",
  },
  investigation: {
    label: "Investigation",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-100 dark:bg-orange-900/50",
  },
  installation: {
    label: "Installation",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-100 dark:bg-purple-900/50",
  },
  "code-review": {
    label: "Code Review",
    color: "text-pink-700 dark:text-pink-300",
    bgColor: "bg-pink-100 dark:bg-pink-900/50",
  },
  triage: {
    label: "Triage",
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-100 dark:bg-gray-800",
  },
  unclassified: {
    label: "Unclassified",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-900/50",
  },
};

export const PRIORITY_LEVELS = [
  { value: 10, label: "Urgent", color: "text-red-600 dark:text-red-400" },
  { value: 30, label: "Critical", color: "text-orange-600 dark:text-orange-400" },
  { value: 50, label: "High", color: "text-yellow-600 dark:text-yellow-400" },
  { value: 100, label: "Normal", color: "text-gray-600 dark:text-gray-400" },
  { value: 120, label: "Low", color: "text-blue-600 dark:text-blue-400" },
  { value: 150, label: "Backlog", color: "text-gray-400 dark:text-gray-500" },
];

export function getPriorityConfig(priority: number) {
  if (priority < 50) return { label: "Urgent", color: "text-red-600 dark:text-red-400", indicator: "!" };
  if (priority < 100) return { label: "High", color: "text-yellow-600 dark:text-yellow-400", indicator: "*" };
  if (priority === 100) return { label: "Normal", color: "text-gray-600 dark:text-gray-400", indicator: "" };
  if (priority <= 150) return { label: "Low", color: "text-blue-600 dark:text-blue-400", indicator: "" };
  return { label: "Backlog", color: "text-gray-400 dark:text-gray-500", indicator: "" };
}
