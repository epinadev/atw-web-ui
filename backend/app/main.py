"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import tasks, projects, workflow, sync, health, session
from app.api.routes.session import cleanup_all_sessions

app = FastAPI(
    title=settings.app_name,
    description="REST API for Atlas Work (ATW) task management",
    version="0.1.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.cors_allow_all else settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(tasks.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(workflow.router, prefix="/api")
app.include_router(sync.router, prefix="/api")
app.include_router(session.router)


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up all terminal sessions on server shutdown."""
    await cleanup_all_sessions()


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": settings.app_name, "version": "0.1.0"}
