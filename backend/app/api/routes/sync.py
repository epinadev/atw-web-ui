"""Sync endpoints."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.atw_client import atw_client

router = APIRouter(prefix="/sync", tags=["sync"])


class SyncOptions(BaseModel):
    dry_run: bool = False
    to_remote: bool = False
    from_remote: bool = False


@router.post("/data")
async def sync_data(options: SyncOptions = SyncOptions()):
    """Sync data folder."""
    result = atw_client.sync_data(
        dry_run=options.dry_run,
        to_remote=options.to_remote,
        from_remote=options.from_remote,
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "output": result.raw_output}


@router.post("/tasks")
async def sync_tasks():
    """Sync tasks from Odoo."""
    result = atw_client.sync_tasks()

    if not result.success:
        raise HTTPException(status_code=400, detail=result.error)

    return {"success": True, "output": result.raw_output}
