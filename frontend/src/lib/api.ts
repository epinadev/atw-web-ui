/**
 * API client for communicating with the FastAPI backend.
 */

// Dynamic API URL: computed per-request to use same hostname as frontend
// This allows access from other devices via Tailscale
const getApiBaseUrl = (): string => {
  // If env var is set, always use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Client-side: use current hostname with port 8000
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8001`;
  }
  // Server-side fallback (won't be used for actual API calls)
  return "http://localhost:8001";
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, timeout = 30000, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${getApiBaseUrl()}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let data;
      try {
        data = await response.json();
      } catch {
        // Response is not JSON
      }
      throw new ApiError(response.status, response.statusText, data);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(408, "Request Timeout");
    }
    throw error;
  }
}

// ==================== Tasks API ====================

export const tasksApi = {
  list: (params?: {
    project?: string;
    status?: string;
    type?: string;
    include_done?: boolean;
    limit?: number;
  }): Promise<any> => request("/api/tasks", { params }),

  dashboard: (progress = false): Promise<any> =>
    request("/api/tasks/dashboard", { params: { progress } }),

  summary: (): Promise<any> => request("/api/tasks/summary"),

  blocked: (): Promise<any> => request("/api/tasks/blocked"),

  detail: (taskId: string): Promise<any> => request(`/api/tasks/${taskId}`),

  // File explorer
  listFiles: (taskId: string, path?: string): Promise<any> =>
    request(`/api/tasks/${taskId}/files`, { params: path ? { path } : undefined }),

  readFile: (taskId: string, path: string): Promise<any> =>
    request(`/api/tasks/${taskId}/files/read`, { params: { path } }),

  approve: (taskId: string): Promise<any> =>
    request(`/api/tasks/${taskId}/approve`, { method: "POST" }),

  reset: (taskId: string): Promise<any> =>
    request(`/api/tasks/${taskId}/reset`, { method: "POST" }),

  workflowApprove: (taskId: string): Promise<any> =>
    request(`/api/tasks/${taskId}/workflow-approve`, { method: "POST" }),

  done: (taskId: string): Promise<any> =>
    request(`/api/tasks/${taskId}/done`, { method: "POST" }),

  setPriority: (taskId: string, priority: number): Promise<any> =>
    request(`/api/tasks/${taskId}/priority`, {
      method: "POST",
      body: JSON.stringify({ priority }),
    }),

  setType: (taskId: string, type: string): Promise<any> =>
    request(`/api/tasks/${taskId}/type`, {
      method: "POST",
      body: JSON.stringify({ type }),
    }),

  categorize: (taskId: string): Promise<any> =>
    request(`/api/tasks/${taskId}/categorize`, { method: "POST" }),

  delete: (taskId: string): Promise<any> =>
    request(`/api/tasks/${taskId}`, { method: "DELETE" }),
};

// ==================== Projects API ====================

export const projectsApi = {
  list: (domain?: string): Promise<any> =>
    request("/api/projects", { params: domain ? { domain } : undefined }),

  detail: (name: string): Promise<any> => request(`/api/projects/${encodeURIComponent(name)}`),
};

// ==================== Workflow API ====================

export const workflowApi = {
  queue: (): Promise<any> => request("/api/workflow/queue"),

  clearQueue: (): Promise<any> => request("/api/workflow/queue", { method: "DELETE" }),

  types: (): Promise<any> => request("/api/workflow/types"),

  status: (taskId: string): Promise<any> => request(`/api/workflow/status/${taskId}`),

  run: (taskId: string, options?: { restart?: boolean; now?: boolean }): Promise<any> =>
    request(`/api/workflow/run/${taskId}`, {
      method: "POST",
      body: JSON.stringify(options || {}),
    }),

  stop: (taskId: string): Promise<any> =>
    request(`/api/workflow/stop/${taskId}`, { method: "POST" }),

  done: (taskId: string): Promise<any> =>
    request(`/api/workflow/done/${taskId}`, { method: "POST" }),

  pass: (taskId: string): Promise<any> =>
    request(`/api/workflow/pass/${taskId}`, { method: "POST" }),

  fail: (taskId: string, reason?: string): Promise<any> =>
    request(`/api/workflow/fail/${taskId}`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  fix: (taskId: string): Promise<any> =>
    request(`/api/workflow/fix/${taskId}`, { method: "POST", timeout: 180000 }), // 3 min

  timesheet: (taskId: string, prompt: string, dryRun: boolean = false): Promise<any> =>
    request(`/api/workflow/timesheet/${taskId}`, {
      method: "POST",
      body: JSON.stringify({ prompt, dry_run: dryRun }),
      timeout: 180000, // 3 min
    }),
};

// ==================== Executor API ====================

export const executorApi = {
  status: (): Promise<any> => request("/api/executor/status"),

  start: (): Promise<any> => request("/api/executor/start", { method: "POST" }),

  stop: (): Promise<any> => request("/api/executor/stop", { method: "POST" }),

  stopTask: (taskId: string): Promise<any> =>
    request(`/api/executor/stop-task/${taskId}`, { method: "POST" }),

  runAll: (): Promise<any> => request("/api/executor/run-all", { method: "POST" }),
};

// ==================== Logs API ====================

export const logsApi = {
  get: (lines = 100): Promise<any> =>
    request("/api/workflow/logs", { params: { lines } }),

  clear: (): Promise<any> => request("/api/workflow/logs", { method: "DELETE" }),
};

// ==================== Sync API ====================

export const syncApi = {
  data: (options?: {
    dry_run?: boolean;
    to_remote?: boolean;
    from_remote?: boolean;
  }): Promise<any> =>
    request("/api/sync/data", {
      method: "POST",
      body: JSON.stringify(options || {}),
    }),

  tasks: (): Promise<any> => request("/api/sync/tasks", { method: "POST" }),
};

// ==================== Health API ====================

export const healthApi = {
  check: (): Promise<any> => request("/health"),
  atw: (): Promise<any> => request("/health/atw"),
};

export { ApiError };
