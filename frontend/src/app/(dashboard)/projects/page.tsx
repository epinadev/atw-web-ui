/**
 * Projects page - list with detail panel.
 */

"use client";

import { useState, useMemo } from "react";
import { RefreshCw, Loader2, Search } from "lucide-react";
import { useProjects } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose } from "@/components/ui/dialog";
import { ProjectCard, ProjectDetail } from "@/components/projects";
import type { Project } from "@/types";

const DOMAINS = ["all", "much", "ridersdeal", "personal"] as const;

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useProjects(
    domainFilter === "all" ? undefined : domainFilter
  );

  const filteredProjects = useMemo(() => {
    // Handle both array and { projects: [] } response formats
    let projects: Project[] = [];
    if (data) {
      projects = Array.isArray(data) ? data : ((data as any).projects || []);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.domain.toLowerCase().includes(searchLower)
      );
    }

    return projects;
  }, [data, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-stone-500">Failed to load projects</p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Projects</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Domain Filter */}
        <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg">
          {DOMAINS.map((domain) => (
            <button
              key={domain}
              onClick={() => setDomainFilter(domain)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                domainFilter === domain
                  ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              {domain.charAt(0).toUpperCase() + domain.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-stone-500 dark:text-stone-400">
              No projects found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedProject?.id === project.id}
                  onSelect={setSelectedProject}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel - desktop only */}
        <div className="hidden lg:block lg:col-span-1">
          {selectedProject ? (
            <div className="sticky top-20">
              <ProjectDetail project={selectedProject} />
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 p-6 text-center text-stone-500 dark:text-stone-400">
              <p>Select a project to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog - mobile only */}
      <div className="lg:hidden">
        <Dialog open={selectedProject !== null} onOpenChange={(open) => { if (!open) setSelectedProject(null); }}>
          <DialogClose onClose={() => setSelectedProject(null)} />
          {selectedProject && <ProjectDetail project={selectedProject} />}
        </Dialog>
      </div>
    </div>
  );
}
