/**
 * Project detail panel component.
 */

"use client";

import { FolderOpen, GitBranch, Server, ExternalLink, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const domainColors: Record<string, string> = {
    much: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    ridersdeal: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300",
    personal: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
  };

  return (
    <div className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-stone-100 dark:bg-stone-700 rounded-lg">
          <FolderOpen className="h-8 w-8 text-stone-600 dark:text-stone-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">{project.name}</h2>
          <Badge className={cn("mt-1", domainColors[project.domain] || "bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300")}>
            {project.domain}
          </Badge>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        {/* Repository */}
        {project.repository && (
          <div>
            <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Repository</h3>
            <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100">
              <GitBranch className="h-4 w-4 text-stone-400 dark:text-stone-500" />
              <span className="font-mono text-sm">{project.repository}</span>
            </div>
          </div>
        )}

        {/* Resources Path */}
        {project.resources && (
          <div>
            <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Resources</h3>
            <span className="font-mono text-sm text-stone-900 dark:text-stone-100">{project.resources}</span>
          </div>
        )}

        {/* Remote */}
        {project.remote_type && (
          <div>
            <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Remote Type</h3>
            <span className="text-stone-900 dark:text-stone-100">{project.remote_type}</span>
            {project.remote_host && (
              <span className="text-stone-500 dark:text-stone-400 ml-2">({project.remote_host})</span>
            )}
          </div>
        )}

        {/* SSH Key */}
        {project.ssh_key && (
          <div>
            <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">SSH Key</h3>
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-stone-400 dark:text-stone-500" />
              <span className="font-mono text-sm text-stone-900 dark:text-stone-100">{project.ssh_key}</span>
            </div>
          </div>
        )}

        {/* Environments */}
        {project.environments.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">Environments</h3>
            <div className="space-y-2">
              {project.environments.map((env) => (
                <div
                  key={env.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    env.is_default ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30" : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-stone-400 dark:text-stone-500" />
                    <span className="font-medium text-stone-900 dark:text-stone-100">{env.name}</span>
                    {env.is_default && (
                      <Badge variant="success" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <span className="font-mono text-sm text-stone-600 dark:text-stone-400">{env.host}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Counts */}
        {project.task_counts && (
          <div className="pt-4 border-t border-stone-200 dark:border-stone-700">
            <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">Tasks</h3>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{project.task_counts.active}</div>
                <div className="text-xs text-stone-500 dark:text-stone-400">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-stone-400 dark:text-stone-500">{project.task_counts.total}</div>
                <div className="text-xs text-stone-500 dark:text-stone-400">Total</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
