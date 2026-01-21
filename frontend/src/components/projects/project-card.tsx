/**
 * Project card component.
 */

"use client";

import { FolderOpen, GitBranch, Server, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  isSelected?: boolean;
  onSelect?: (project: Project) => void;
}

export function ProjectCard({ project, isSelected, onSelect }: ProjectCardProps) {
  const domainColors: Record<string, string> = {
    much: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    ridersdeal: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
    personal: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border bg-white dark:bg-stone-800 cursor-pointer transition-all hover:shadow-md dark:hover:bg-stone-750",
        isSelected ? "border-green-500 ring-2 ring-green-100 dark:ring-green-900" : "border-stone-200 dark:border-stone-700"
      )}
      onClick={() => onSelect?.(project)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-100 dark:bg-stone-700 rounded-lg">
            <FolderOpen className="h-5 w-5 text-stone-600 dark:text-stone-400" />
          </div>
          <div>
            <h3 className="font-medium text-stone-900 dark:text-stone-100">{project.name}</h3>
            <Badge className={cn("mt-1 text-xs", domainColors[project.domain] || "bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300")}>
              {project.domain}
            </Badge>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-stone-400 dark:text-stone-500" />
      </div>

      <div className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-400">
        {project.repository && (
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-stone-400 dark:text-stone-500" />
            <span className="truncate">{project.repository}</span>
          </div>
        )}
        {project.environments.length > 0 && (
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-stone-400 dark:text-stone-500" />
            <span>{project.environments.length} environment{project.environments.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {project.task_counts && (
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700 flex items-center gap-4 text-sm">
          <span className="text-stone-500 dark:text-stone-400">
            Tasks: <span className="font-medium text-stone-900 dark:text-stone-100">{project.task_counts.active}</span>
            <span className="text-stone-400 dark:text-stone-500">/{project.task_counts.total}</span>
          </span>
        </div>
      )}
    </div>
  );
}
