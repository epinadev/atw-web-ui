/**
 * React Query hooks for project operations.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api";
import type { Project, ProjectListResponse } from "@/types";

export function useProjects(domain?: string) {
  return useQuery({
    queryKey: ["projects", domain],
    queryFn: () => projectsApi.list(domain),
    staleTime: 60000,
  });
}

export function useProjectDetail(name: string | null) {
  return useQuery<Project>({
    queryKey: ["project", name],
    queryFn: () => projectsApi.detail(name!),
    enabled: !!name,
  });
}
