"""Workflow and executor endpoints."""

import asyncio
from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel

from app.services.atw_client import atw_client

router = APIRouter(tags=["workflow"])


class WorkflowRunOptions(BaseModel):
    restart: bool = False
    now: bool = False


class FailReason(BaseModel):
    reason: Optional[str] = None


class TimesheetRequest(BaseModel):
    prompt: str
    dry_run: bool = False


# ==================== Workflow ====================


@router.get("/workflow/queue")
async def get_queue():
    """Get workflow queue status."""
    result = atw_client.workflow_queue()

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return result.data


@router.delete("/workflow/queue")
async def clear_queue():
    """Clear the workflow queue."""
    result = atw_client.workflow_queue_clear()

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": "Queue cleared"}


@router.get("/workflow/types")
async def get_workflow_types():
    """Get workflow types with enabled/disabled status."""
    result = atw_client.workflow_types()

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return result.data


@router.get("/workflow/status/{task_id}")
async def get_workflow_status(task_id: str):
    """Get workflow status for a task."""
    result = atw_client.workflow_status(task_id)

    if not result.success:
        raise HTTPException(status_code=404, detail=result.error)

    return result.data


@router.post("/workflow/run/{task_id}")
async def run_workflow(task_id: str, options: WorkflowRunOptions = WorkflowRunOptions()):
    """Run workflow for a task."""
    result = atw_client.workflow_run(task_id, restart=options.restart, now=options.now)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Workflow started for {task_id}"}


@router.post("/workflow/stop/{task_id}")
async def stop_workflow(task_id: str):
    """Stop workflow execution."""
    result = atw_client.workflow_stop(task_id)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Workflow stopped for {task_id}"}


@router.post("/workflow/done/{task_id}")
async def workflow_done(task_id: str):
    """Mark task as done via workflow."""
    result = atw_client.workflow_done(task_id)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} marked as done"}


@router.post("/workflow/pass/{task_id}")
async def workflow_pass(task_id: str):
    """Mark testing as passed."""
    result = atw_client.workflow_pass(task_id)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} testing passed"}


@router.post("/workflow/fail/{task_id}")
async def workflow_fail(task_id: str, body: FailReason = FailReason()):
    """Mark testing as failed."""
    result = atw_client.workflow_fail(task_id, reason=body.reason)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} testing failed"}


@router.post("/workflow/fix/{task_id}")
async def workflow_fix(task_id: str):
    """AI-powered diagnosis and fix for stuck or broken tasks."""
    # Run in thread pool to avoid blocking the event loop (can take up to 120s)
    result = await asyncio.to_thread(atw_client.workflow_fix, task_id)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} fixed", "output": result.raw_output}


@router.post("/workflow/timesheet/{task_id}")
async def workflow_timesheet(task_id: str, body: TimesheetRequest):
    """Generate timesheets from work done on a task."""
    # Run in thread pool to avoid blocking the event loop (can take up to 120s)
    result = await asyncio.to_thread(
        atw_client.workflow_timesheet, task_id, body.prompt, body.dry_run
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {
        "success": True,
        "message": f"Timesheet created for task {task_id}" if not body.dry_run else "Dry run completed",
        "output": result.raw_output,
        "dry_run": body.dry_run,
    }


# ==================== Executor ====================


@router.get("/executor/status")
async def get_executor_status():
    """Get executor status with running tasks."""
    result = atw_client.executor_status()

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return result.data


@router.post("/executor/start")
async def start_executor():
    """Start the workflow executor."""
    result = atw_client.executor_start()

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": "Executor started"}


@router.post("/executor/stop-task/{task_id}")
async def stop_executor_task(task_id: str):
    """Stop a specific running task."""
    result = atw_client.executor_stop_task(task_id)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} stopped"}


@router.post("/executor/stop")
async def stop_executor():
    """Stop the workflow executor."""
    result = atw_client.executor_stop()

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": "Executor stopped"}


@router.post("/executor/run-all")
async def run_all_tasks():
    """Queue all pending tasks for execution."""
    # Run in thread pool to avoid blocking the event loop (can take up to 60s)
    result = await asyncio.to_thread(atw_client.executor_run_all)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": "All tasks queued", "output": result.raw_output}


# ==================== Logs ====================


@router.get("/workflow/logs")
async def get_workflow_logs(lines: int = 100):
    """Get workflow logs."""
    result = atw_client.workflow_logs(lines)

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    # Return raw output as logs are plain text
    return {"logs": result.raw_output}


@router.delete("/workflow/logs")
async def clear_workflow_logs():
    """Clear workflow logs."""
    result = atw_client.workflow_logs_clear()

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": "Logs cleared"}
