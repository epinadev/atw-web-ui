"""Task management endpoints."""

import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import PlainTextResponse
from typing import Optional, List
from pydantic import BaseModel

from app.services.atw_client import atw_client

router = APIRouter(prefix="/tasks", tags=["tasks"])


# ==================== File Explorer Models ====================

class FileInfo(BaseModel):
    name: str
    path: str  # Relative path from resources root
    type: str  # "file" or "directory"
    size: int
    extension: str
    modified: float  # Unix timestamp


class PriorityUpdate(BaseModel):
    priority: int


class TypeUpdate(BaseModel):
    type: str


@router.get("")
async def list_tasks(
    project: Optional[str] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
    include_done: bool = False,
    limit: int = Query(default=100, le=500),
):
    """List tasks with optional filters."""
    result = atw_client.tasks_list(
        project=project,
        status=status,
        task_type=type,
        include_done=include_done,
        limit=limit,
    )

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return result.data


@router.get("/dashboard")
async def get_dashboard(progress: bool = False):
    """Get kanban-style dashboard data grouped by workflow state."""
    result = atw_client.tasks_dashboard(show_progress=progress)

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return result.data


@router.get("/summary")
async def get_summary():
    """Get detailed statistics for dashboards."""
    result = atw_client.tasks_summary()

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return result.data


@router.get("/blocked")
async def get_blocked():
    """Get blocked tasks with their blockers."""
    result = atw_client.tasks_blocked()

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return result.data


@router.get("/{task_id}")
async def get_task_detail(task_id: str):
    """Get detailed task information."""
    result = atw_client.task_detail(task_id)

    if not result.success:
        raise HTTPException(status_code=404, detail=result.error or "Task not found")

    return result.data


@router.post("/{task_id}/approve")
async def approve_task(task_id: str):
    """Approve task and set to READY."""
    result = atw_client.task_approve(task_id)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} approved"}


@router.post("/{task_id}/reset")
async def reset_task(task_id: str):
    """Reset task to REDO status."""
    result = atw_client.task_reset(task_id)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} reset to REDO"}


@router.post("/{task_id}/finish")
async def finish_task(task_id: str):
    """Set task to CONCLUDE for cleanup."""
    result = atw_client.task_finish(task_id)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} set to CONCLUDE"}


@router.post("/{task_id}/unblock")
async def unblock_task(task_id: str):
    """Unblock task and set to READY."""
    result = atw_client.task_unblock(task_id)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} unblocked"}


@router.post("/{task_id}/done")
async def mark_done(task_id: str):
    """Mark task as DONE."""
    result = atw_client.task_done(task_id)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} marked as done"}


@router.post("/{task_id}/priority")
async def set_priority(task_id: str, body: PriorityUpdate):
    """Set task priority (lower = higher priority)."""
    result = atw_client.task_set_priority(task_id, body.priority)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} priority set to {body.priority}"}


@router.post("/{task_id}/type")
async def set_type(task_id: str, body: TypeUpdate):
    """Set task workflow type."""
    result = atw_client.task_set_type(task_id, body.type)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} type set to {body.type}"}


@router.post("/{task_id}/categorize")
async def categorize_task(task_id: str):
    """Run AI categorization on task."""
    result = atw_client.task_categorize(task_id)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} categorized", "output": result.raw_output}


@router.delete("/{task_id}")
async def delete_task(task_id: str):
    """Delete task and its resources."""
    result = atw_client.task_delete(task_id)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "message": f"Task {task_id} deleted"}


# ==================== File Explorer Endpoints ====================


def _get_task_resources_path(task_id: str) -> str:
    """Get the resources path for a task."""
    result = atw_client.task_detail(task_id)
    if not result.success or not result.data:
        raise HTTPException(status_code=404, detail="Task not found")

    resources_path = result.data.get("paths", {}).get("resources")
    if not resources_path:
        raise HTTPException(status_code=404, detail="Task has no resources path")

    return resources_path


def _list_directory(base_path: str, relative_path: str = "") -> List[FileInfo]:
    """List files in a directory, returning FileInfo objects."""
    full_path = os.path.join(base_path, relative_path) if relative_path else base_path

    if not os.path.exists(full_path):
        return []

    if not os.path.isdir(full_path):
        raise HTTPException(status_code=400, detail="Path is not a directory")

    files = []
    try:
        for entry in os.scandir(full_path):
            # Skip hidden files and __pycache__
            if entry.name.startswith('.') or entry.name == '__pycache__':
                continue

            stat = entry.stat()
            rel_path = os.path.join(relative_path, entry.name) if relative_path else entry.name

            files.append(FileInfo(
                name=entry.name,
                path=rel_path,
                type="directory" if entry.is_dir() else "file",
                size=stat.st_size if entry.is_file() else 0,
                extension=Path(entry.name).suffix.lower() if entry.is_file() else "",
                modified=stat.st_mtime,
            ))

        # Sort: directories first, then by name
        files.sort(key=lambda f: (f.type != "directory", f.name.lower()))

    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied")

    return files


@router.get("/{task_id}/files")
async def list_task_files(task_id: str, path: str = ""):
    """
    List files in task's resources folder.

    Args:
        task_id: The task identifier
        path: Relative path within resources folder (optional, defaults to root)

    Returns:
        List of files with metadata
    """
    resources_path = _get_task_resources_path(task_id)

    # Security: Ensure path doesn't escape resources folder
    if path:
        # Normalize and check for path traversal
        normalized = os.path.normpath(path)
        if normalized.startswith('..') or os.path.isabs(normalized):
            raise HTTPException(status_code=400, detail="Invalid path")

    files = _list_directory(resources_path, path)

    return {
        "task_id": task_id,
        "resources_path": resources_path,
        "current_path": path or "/",
        "files": [f.model_dump() for f in files],
    }


@router.get("/{task_id}/files/read")
async def read_task_file(task_id: str, path: str):
    """
    Read contents of a file in task's resources folder.

    Args:
        task_id: The task identifier
        path: Relative path to the file within resources folder

    Returns:
        File contents as plain text
    """
    if not path:
        raise HTTPException(status_code=400, detail="Path parameter is required")

    resources_path = _get_task_resources_path(task_id)

    # Security: Normalize and check for path traversal
    normalized = os.path.normpath(path)
    if normalized.startswith('..') or os.path.isabs(normalized):
        raise HTTPException(status_code=400, detail="Invalid path")

    full_path = os.path.join(resources_path, normalized)

    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")

    if not os.path.isfile(full_path):
        raise HTTPException(status_code=400, detail="Path is not a file")

    # Check file size (limit to 1MB)
    file_size = os.path.getsize(full_path)
    if file_size > 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 1MB)")

    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File is not a text file")
    except PermissionError:
        raise HTTPException(status_code=403, detail="Permission denied")

    # Determine content type based on extension
    ext = Path(full_path).suffix.lower()

    return {
        "task_id": task_id,
        "path": path,
        "name": os.path.basename(full_path),
        "extension": ext,
        "size": file_size,
        "content": content,
    }
