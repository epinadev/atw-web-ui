"""
ATW CLI Client - Communicates with ATW via subprocess calls.

Ported from atw-ui TUI for web API usage.
"""

import json
import subprocess
from dataclasses import dataclass
from typing import Optional

from app.config import settings


# Status display configuration
STATUS_DISPLAY = {
    "new": {"icon": "○", "color": "gray", "label": "New"},
    "ready": {"icon": "◎", "color": "cyan", "label": "Ready"},
    "running": {"icon": "▶", "color": "blue", "label": "Running"},
    "approve": {"icon": "?", "color": "purple", "label": "Approve"},
    "blocked": {"icon": "!", "color": "red", "label": "Blocked"},
    "redo": {"icon": "↻", "color": "yellow", "label": "Redo"},
    "review": {"icon": "R", "color": "amber", "label": "Review"},
    "conclude": {"icon": "C", "color": "teal", "label": "Conclude"},
    "done": {"icon": "✓", "color": "green", "label": "Done"},
}

WORKFLOW_STATE_ORDER = ["planning", "queued", "running", "review"]

WORKFLOW_STATE_STATUSES = {
    "planning": ["new", "blocked", "redo", "approve"],
    "queued": ["ready", "conclude"],
    "running": ["running"],
    "review": ["review"],
}


@dataclass
class ATWResult:
    """Result from an ATW command."""

    success: bool
    data: Optional[dict | list] = None
    error: Optional[str] = None
    raw_output: str = ""


class ATWClient:
    """Client for communicating with ATW CLI."""

    def __init__(self, atw_command: str | None = None):
        self.atw_command = atw_command or settings.atw_command

    def _run(self, *args, timeout: int = 30) -> ATWResult:
        """Run an ATW command and return the result."""
        cmd = [self.atw_command] + list(args)

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
            )

            output = result.stdout.strip()

            if output:
                try:
                    data = json.loads(output)
                    return ATWResult(
                        success=result.returncode == 0,
                        data=data,
                        raw_output=output,
                    )
                except json.JSONDecodeError:
                    return ATWResult(
                        success=result.returncode == 0,
                        raw_output=output,
                        error=result.stderr if result.returncode != 0 else None,
                    )

            return ATWResult(
                success=result.returncode == 0,
                raw_output=output,
                error=result.stderr if result.returncode != 0 else None,
            )

        except subprocess.TimeoutExpired:
            return ATWResult(success=False, error=f"Command timed out after {timeout}s")
        except FileNotFoundError:
            return ATWResult(
                success=False, error=f"ATW command not found: {self.atw_command}"
            )
        except Exception as e:
            return ATWResult(success=False, error=str(e))

    # ==================== Tasks ====================

    def tasks_list(
        self,
        project: Optional[str] = None,
        task_type: Optional[str] = None,
        status: Optional[str] = None,
        include_done: bool = False,
        limit: Optional[int] = None,
    ) -> ATWResult:
        """List tasks with optional filters."""
        args = ["tasks", "list", "--json"]

        if project:
            args.extend(["--project", project])
        if task_type:
            args.extend(["--type", task_type])
        if status:
            args.extend(["--status", status])
        if include_done:
            args.append("--all")
        if limit:
            args.extend(["--limit", str(limit)])

        return self._run(*args)

    def tasks_dashboard(self, show_progress: bool = False) -> ATWResult:
        """Get kanban-style dashboard data grouped by workflow_state."""
        args = ["tasks", "dashboard", "--json"]
        if show_progress:
            args.append("--progress")
        return self._run(*args)

    def tasks_summary(self) -> ATWResult:
        """Get detailed statistics for dashboards."""
        return self._run("tasks", "summary", "--json")

    def tasks_blocked(self) -> ATWResult:
        """List blocked tasks with their blockers."""
        return self._run("tasks", "blocked", "--json")

    def task_detail(self, task_id: str) -> ATWResult:
        """Get detailed task information."""
        return self._run("task", task_id, "--json")

    # ==================== Task State Actions ====================

    def task_approve(self, task_id: str) -> ATWResult:
        """Approve task and set to READY."""
        return self._run("tasks", "approve", task_id)

    def task_reset(self, task_id: str) -> ATWResult:
        """Set task to REDO state."""
        return self._run("tasks", "reset", task_id)

    def task_finish(self, task_id: str) -> ATWResult:
        """Set task to CONCLUDE."""
        return self._run("tasks", "finish", task_id)

    def task_unblock(self, task_id: str) -> ATWResult:
        """Unblock a task and set to READY."""
        return self._run("workflow", "unblock", task_id)

    def task_done(self, task_id: str) -> ATWResult:
        """Mark task as DONE."""
        return self._run("workflow", "done", task_id)

    def task_set_priority(self, task_id: str, priority: int) -> ATWResult:
        """Set task priority."""
        return self._run("tasks", "priority", task_id, str(priority))

    def task_set_type(self, task_id: str, task_type: str) -> ATWResult:
        """Set task workflow type."""
        return self._run("tasks", "set-type", task_id, task_type)

    def task_delete(self, task_id: str) -> ATWResult:
        """Delete a task."""
        return self._run("task", task_id, "--delete", "--skip-deletion-confirmation")

    def task_categorize(self, task_id: str) -> ATWResult:
        """Run AI categorization on task."""
        return self._run("categorize", task_id, timeout=60)

    # ==================== Projects ====================

    def projects_list(self, domain: Optional[str] = None) -> ATWResult:
        """List all projects."""
        args = ["projects", "list", "--json"]
        if domain:
            args.extend(["--domain", domain])
        return self._run(*args)

    def project_show(self, name: str) -> ATWResult:
        """Get project details."""
        return self._run("projects", "show", name, "--json")

    # ==================== Workflow ====================

    def workflow_queue(self) -> ATWResult:
        """Get workflow queue status."""
        return self._run("workflow", "queue", "--json")

    def workflow_queue_clear(self) -> ATWResult:
        """Clear the workflow queue."""
        return self._run("workflow", "queue", "clear", "--json")

    def workflow_types(self) -> ATWResult:
        """Get workflow types with enabled/disabled status."""
        return self._run("workflow", "types", "--json")

    def workflow_status(self, task_id: str) -> ATWResult:
        """Get workflow status for a task."""
        return self._run("workflow", "status", task_id, "--json")

    def workflow_run(
        self, task_id: str, restart: bool = False, now: bool = False
    ) -> ATWResult:
        """Run workflow for a task."""
        args = ["workflow", "run", task_id]
        if restart:
            args.append("--restart")
        if now:
            args.append("--now")
        return self._run(*args, timeout=10)

    def workflow_stop(self, task_id: str) -> ATWResult:
        """Stop workflow execution."""
        return self._run("workflow", "stop", task_id)

    def workflow_done(self, task_id: str) -> ATWResult:
        """Mark task as done via workflow."""
        return self._run("workflow", "done", task_id)

    def workflow_pass(self, task_id: str) -> ATWResult:
        """Mark testing as passed."""
        return self._run("workflow", "pass", task_id)

    def workflow_fail(self, task_id: str, reason: Optional[str] = None) -> ATWResult:
        """Mark testing as failed."""
        args = ["workflow", "fail", task_id]
        if reason:
            args.extend(["--reason", reason])
        return self._run(*args)

    def workflow_fix(self, task_id: str) -> ATWResult:
        """AI-powered diagnosis and fix for stuck or broken tasks."""
        return self._run("workflow", "fix", task_id, timeout=120)

    def workflow_timesheet(self, task_id: str, prompt: str, dry_run: bool = False) -> ATWResult:
        """Generate timesheets from work done on a task."""
        args = ["workflow", "timesheet", task_id, "--prompt", prompt]
        if dry_run:
            args.append("--dry-run")
        return self._run(*args, timeout=120)

    # ==================== Executor ====================

    def executor_status(self) -> ATWResult:
        """Get executor status with running tasks."""
        return self._run("workflow", "executor", "status", "--json")

    def executor_start(self) -> ATWResult:
        """Start the workflow executor as a background process."""
        cmd = [self.atw_command, "workflow", "executor", "start"]
        try:
            # Start as a detached background process
            subprocess.Popen(
                cmd,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            return ATWResult(success=True, raw_output="Executor started in background")
        except Exception as e:
            return ATWResult(success=False, error=str(e))

    def executor_stop_task(self, task_id: str) -> ATWResult:
        """Stop a specific running task."""
        return self._run("workflow", "executor", "stop-task", task_id)

    def executor_stop(self) -> ATWResult:
        """Stop the workflow executor."""
        return self._run("workflow", "executor", "stop")

    def executor_run_all(self) -> ATWResult:
        """Queue all pending tasks for execution."""
        return self._run("workflow", "executor", "run", "--all", timeout=60)

    # ==================== Logs ====================

    def workflow_logs(self, lines: int = 100) -> ATWResult:
        """Get workflow logs."""
        return self._run("workflow", "logs", "-n", str(lines))

    def workflow_logs_clear(self) -> ATWResult:
        """Clear workflow logs."""
        return self._run("workflow", "logs", "--clear")

    # ==================== Sync ====================

    def sync_data(
        self,
        dry_run: bool = False,
        to_remote: bool = False,
        from_remote: bool = False,
    ) -> ATWResult:
        """Sync data folder."""
        args = ["sync", "data"]
        if dry_run:
            args.append("--dry-run")
        if to_remote:
            args.append("--to-remote")
        if from_remote:
            args.append("--from-remote")
        return self._run(*args, timeout=120)

    def sync_tasks(self) -> ATWResult:
        """Sync tasks from Odoo."""
        return self._run("sync", "tasks", timeout=120)


# Singleton instance
atw_client = ATWClient()
