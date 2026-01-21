"""Health check endpoints."""

from fastapi import APIRouter

from app.services.atw_client import atw_client

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check():
    """Basic health check."""
    return {"status": "healthy"}


@router.get("/atw")
async def atw_health():
    """Check ATW CLI connectivity."""
    result = atw_client.tasks_summary()
    if result.success:
        return {"status": "connected", "data": result.data}
    return {"status": "error", "error": result.error}
