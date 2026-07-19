"""WebSocket router for real-time connections."""
import asyncio
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException, status
from typing import Optional

from core.logging import logger
from core.websocket import (
    get_connection_manager,
    get_broadcast_service,
    EventType,
    WebSocketEvent,
)

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, user_id: Optional[str] = None):
    """WebSocket endpoint for real-time connection."""
    connection_id = str(uuid.uuid4())
    connection_manager = get_connection_manager()
    broadcast_service = get_broadcast_service()
    
    try:
        logger.info(f"[WS] Connection attempt: {connection_id} (user_id={user_id})")
        
        # Accept the WebSocket connection
        await websocket.accept()
        logger.info(f"[WS] Connection accepted: {connection_id}")
        
        # Register connection
        connection_manager.active_connections[connection_id] = websocket
        connection_manager.connection_metadata[connection_id] = {
            "user_id": user_id,
            "connected_at": __import__('datetime').datetime.utcnow(),
            "last_heartbeat": __import__('datetime').datetime.utcnow(),
        }
        
        # Send connection confirmation
        confirmation_event = WebSocketEvent(
            EventType.CONNECTION,
            {
                "connection_id": connection_id,
                "message": "Connected to real-time service",
                "active_connections": len(connection_manager.active_connections),
            },
            user_id,
        )
        await websocket.send_text(confirmation_event.to_json())
        logger.info(f"[WS] Confirmation sent: {connection_id}")
        
        # Start heartbeat task
        heartbeat_task = asyncio.create_task(
            _heartbeat_loop(connection_manager, connection_id, websocket)
        )
        
        # Listen for incoming messages
        while True:
            try:
                data = await websocket.receive_text()
                logger.debug(f"[WS] Message from {connection_id}: {data}")
            except WebSocketDisconnect:
                logger.info(f"[WS] Client disconnected: {connection_id}")
                break
    
    except Exception as e:
        logger.error(f"[WS] Error for {connection_id}: {e}", exc_info=True)
    
    finally:
        # Cleanup
        if connection_id in connection_manager.active_connections:
            del connection_manager.active_connections[connection_id]
        if connection_id in connection_manager.connection_metadata:
            del connection_manager.connection_metadata[connection_id]
        
        logger.info(f"[WS] Connection closed: {connection_id}")


async def _heartbeat_loop(connection_manager, connection_id: str, websocket: WebSocket, interval: int = 30):
    """Send periodic heartbeats to keep connection alive."""
    try:
        while connection_id in connection_manager.active_connections:
            await asyncio.sleep(interval)
            if connection_id in connection_manager.active_connections:
                heartbeat_event = WebSocketEvent(
                    EventType.HEARTBEAT,
                    {
                        "active_connections": len(connection_manager.active_connections),
                    },
                )
                try:
                    await websocket.send_text(heartbeat_event.to_json())
                except Exception as e:
                    logger.error(f"[WS] Heartbeat error for {connection_id}: {e}")
                    break
    except Exception as e:
        logger.error(f"[WS] Heartbeat loop error for {connection_id}: {e}")


@router.get("/ws/status")
async def websocket_status():
    """Get WebSocket connection status."""
    connection_manager = get_connection_manager()
    return {
        "active_connections": len(connection_manager.active_connections),
        "connections": [
            {
                "id": conn_id,
                "user_id": metadata.get("user_id"),
                "connected_at": metadata.get("connected_at"),
            }
            for conn_id, metadata in connection_manager.connection_metadata.items()
        ],
    }
