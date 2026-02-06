"""Real-time notification broadcasting via WebSocket."""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class NotificationManager:
    """In-memory WebSocket broadcast manager (singleton)."""

    def __init__(self):
        self._clients: set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket):
        async with self._lock:
            self._clients.add(ws)
        logger.info("Notification client connected (%d total)", len(self._clients))

    async def disconnect(self, ws: WebSocket):
        async with self._lock:
            self._clients.discard(ws)
        logger.info("Notification client disconnected (%d total)", len(self._clients))

    async def broadcast(self, event: dict[str, Any]):
        event["timestamp"] = datetime.now(timezone.utc).isoformat()

        async with self._lock:
            dead: list[WebSocket] = []
            for ws in self._clients:
                try:
                    await ws.send_json(event)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self._clients.discard(ws)
            if dead:
                logger.info("Removed %d dead notification clients", len(dead))


# Singleton instance
manager = NotificationManager()


async def notify(
    event_type: str,
    task_id: str = "",
    task_name: str = "",
    old_status: str = "",
    new_status: str = "",
    detail: str = "",
):
    """Convenience function for route handlers to broadcast a notification."""
    await manager.broadcast({
        "type": event_type,
        "task_id": task_id,
        "task_name": task_name,
        "old_status": old_status,
        "new_status": new_status,
        "detail": detail,
    })
