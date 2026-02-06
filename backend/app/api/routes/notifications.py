"""WebSocket endpoint for real-time notifications."""

import asyncio
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.notifications import manager, notify

logger = logging.getLogger(__name__)

router = APIRouter(tags=["notifications"])

KEEPALIVE_INTERVAL = 30  # seconds


@router.get("/api/notifications/debug")
async def debug_notifications():
    """Show connected WebSocket clients for debugging."""
    clients_info = []
    for ws in manager._clients:
        client = ws.client
        clients_info.append(f"{client.host}:{client.port}" if client else "unknown")
    return {"connected_clients": len(manager._clients), "clients": clients_info}


@router.post("/api/notifications/test")
async def test_notification():
    """Broadcast a test notification to all connected WebSocket clients."""
    clients = len(manager._clients)
    await notify("test", detail="Test notification from ATW")
    return {"success": True, "message": "Test notification sent", "connected_clients": clients}


@router.websocket("/ws/notifications")
async def notifications_ws(websocket: WebSocket):
    """
    WebSocket endpoint for real-time push notifications.

    Protocol:
    - Server sends {"type": "connected"} on connect
    - Server sends {"type": "ping"} every 30s; client must reply {"type": "pong"}
    - Server broadcasts notification events to all connected clients
    """
    await websocket.accept()
    await manager.connect(websocket)

    try:
        await websocket.send_json({"type": "connected"})

        async def keepalive():
            while True:
                await asyncio.sleep(KEEPALIVE_INTERVAL)
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break

        async def receive_messages():
            while True:
                try:
                    data = await websocket.receive_json()
                    # Client pong or any other message - just keep connection alive
                    if data.get("type") == "pong":
                        continue
                except WebSocketDisconnect:
                    break
                except Exception:
                    break

        await asyncio.gather(keepalive(), receive_messages(), return_exceptions=True)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error("Notification WebSocket error: %s", e)
    finally:
        await manager.disconnect(websocket)
