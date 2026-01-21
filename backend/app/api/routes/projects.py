"""Project management endpoints."""

from fastapi import APIRouter, HTTPException
from typing import Optional

from app.services.atw_client import atw_client

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("")
async def list_projects(domain: Optional[str] = None):
    """List all projects."""
    result = atw_client.projects_list(domain=domain)

    if not result.success:
        raise HTTPException(status_code=500, detail=result.error)

    return result.data


@router.get("/{name}")
async def get_project(name: str):
    """Get project details."""
    result = atw_client.project_show(name)

    if not result.success:
        raise HTTPException(status_code=404, detail=result.error or "Project not found")

    return result.data
