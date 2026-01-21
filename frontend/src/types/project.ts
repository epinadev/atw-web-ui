/**
 * Project types.
 */

export interface Environment {
  id: number;
  name: string;
  host: string;
  ssh_key: string | null;
  is_default: boolean;
}

export interface Project {
  id: number;
  name: string;
  domain: string;
  repository: string | null;
  resources: string | null;
  remote_type: string | null;
  remote_host: string | null;
  ssh_key: string | null;
  environments: Environment[];
  task_counts?: {
    total: number;
    active: number;
  };
}

export interface ProjectListResponse {
  projects: Project[];
}
