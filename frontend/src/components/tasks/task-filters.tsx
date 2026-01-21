/**
 * Task filters component.
 */

"use client";

import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG, TYPE_CONFIG, WORKFLOW_STATE_CONFIG } from "@/lib/constants";
import type { TaskStatus, TaskType, WorkflowState } from "@/types";

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: TaskStatus | null;
  onStatusFilterChange: (value: TaskStatus | null) => void;
  typeFilter: TaskType | null;
  onTypeFilterChange: (value: TaskType | null) => void;
  workflowFilter: WorkflowState | null;
  onWorkflowFilterChange: (value: WorkflowState | null) => void;
  includeDone: boolean;
  onIncludeDoneChange: (value: boolean) => void;
}

export function TaskFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  workflowFilter,
  onWorkflowFilterChange,
  includeDone,
  onIncludeDoneChange,
}: TaskFiltersProps) {
  const hasFilters = statusFilter || typeFilter || workflowFilter || includeDone;

  const clearFilters = () => {
    onStatusFilterChange(null);
    onTypeFilterChange(null);
    onWorkflowFilterChange(null);
    onIncludeDoneChange(false);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {/* Workflow State */}
        <select
          value={workflowFilter || ""}
          onChange={(e) => onWorkflowFilterChange(e.target.value as WorkflowState || null)}
          className="px-3 py-1.5 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All States</option>
          {Object.entries(WORKFLOW_STATE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.title}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={statusFilter || ""}
          onChange={(e) => onStatusFilterChange(e.target.value as TaskStatus || null)}
          className="px-3 py-1.5 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        {/* Type */}
        <select
          value={typeFilter || ""}
          onChange={(e) => onTypeFilterChange(e.target.value as TaskType || null)}
          className="px-3 py-1.5 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Types</option>
          {Object.entries(TYPE_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        {/* Include Done */}
        <label className="flex items-center gap-2 px-3 py-1.5 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700">
          <input
            type="checkbox"
            checked={includeDone}
            onChange={(e) => onIncludeDoneChange(e.target.checked)}
            className="rounded border-stone-300 dark:border-stone-600 text-green-600 focus:ring-green-500"
          />
          Include Done
        </label>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-stone-500 dark:text-stone-400">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
