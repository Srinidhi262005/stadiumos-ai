"""WebSocket Manager for real-time event broadcasting and connection management."""
import json
import asyncio
from typing import Dict, Set, Optional, Any, Callable
from datetime import datetime
from enum import Enum
import uuid

from fastapi import WebSocket, WebSocketDisconnect
from backend.core.logging import logger


class EventType(Enum):
    """Event types for WebSocket broadcasting."""
    # Dashboard events
    DASHBOARD_UPDATE = "dashboard:update"
    DASHBOARD_KPI = "dashboard:kpi"
    
    # Incident events
    INCIDENT_CREATED = "incident:created"
    INCIDENT_UPDATED = "incident:updated"
    INCIDENT_RESOLVED = "incident:resolved"
    INCIDENT_DELETED = "incident:deleted"
    
    # Crowd events
    CROWD_DENSITY_UPDATE = "crowd:density"
    CROWD_GATE_STATUS = "crowd:gate"
    CROWD_ZONE_UPDATE = "crowd:zone"
    
    # Volunteer events
    VOLUNTEER_ASSIGNED = "volunteer:assigned"
    VOLUNTEER_UNASSIGNED = "volunteer:unassigned"
    VOLUNTEER_STATUS_CHANGED = "volunteer:status"
    VOLUNTEER_UPDATED = "volunteer:updated"
    
    # Accessibility events
    ACCESSIBILITY_REQUEST = "accessibility:request"
    ACCESSIBILITY_RESOLVED = "accessibility:resolved"
    
    # Sustainability events
    SUSTAINABILITY_METRIC = "sustainability:metric"
    SUSTAINABILITY_UPDATE = "sustainability:update"
    
    # Notification events
    NOTIFICATION = "notification:new"
    NOTIFICATION_READ = "notification:read"
    
    # Report events
    REPORT_CREATED = "report:created"
    REPORT_DELETED = "report:deleted"
    
    # System events
    CONNECTION = "system:connection"
    DISCONNECTION = "system:disconnection"
    HEARTBEAT = "system:heartbeat"
    RECONNECT = "system:reconnect"


class WebSocketEvent:
    """Represents a WebSocket event message."""
    
    def __init__(
        self,
        event_type: EventType,
        data: Dict[str, Any],
        user_id: Optional[str] = None,
        timestamp: Optional[datetime] = None,
    ):
        self.id = str(uuid.uuid4())
        self.event_type = event_type
        self.data = data
        self.user_id = user_id
        self.timestamp = timestamp or datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "event": self.event_type.value,
            "data": self.data,
            "user_id": self.user_id,
            "timestamp": self.timestamp.isoformat(),
        }
    
    def to_json(self) -> str:
        """Convert event to JSON string."""
        return json.dumps(self.to_dict())


class ConnectionManager:
    """Manages active WebSocket connections."""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[str, Set[str]] = {}
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()
    
    async def connect(
        self,
        websocket: WebSocket,
        connection_id: str,
        user_id: Optional[str] = None,
    ):
        """Register a new WebSocket connection."""
        await websocket.accept()
        async with self._lock:
            self.active_connections[connection_id] = websocket
            self.connection_metadata[connection_id] = {
                "user_id": user_id,
                "connected_at": datetime.utcnow(),
                "last_heartbeat": datetime.utcnow(),
            }
            
            if user_id:
                if user_id not in self.user_connections:
                    self.user_connections[user_id] = set()
                self.user_connections[user_id].add(connection_id)
        
        logger.info(f"Client connected: {connection_id} (user: {user_id})")
    
    async def disconnect(self, connection_id: str):
        """Unregister a WebSocket connection."""
        async with self._lock:
            if connection_id in self.active_connections:
                websocket = self.active_connections.pop(connection_id)
                metadata = self.connection_metadata.pop(connection_id, {})
                user_id = metadata.get("user_id")
                
                if user_id and user_id in self.user_connections:
                    self.user_connections[user_id].discard(connection_id)
                    if not self.user_connections[user_id]:
                        del self.user_connections[user_id]
                
                await websocket.close()
        
        logger.info(f"Client disconnected: {connection_id}")
    
    async def send_personal(self, connection_id: str, event: WebSocketEvent):
        """Send event to a specific connection."""
        if connection_id in self.active_connections:
            try:
                websocket = self.active_connections[connection_id]
                await websocket.send_text(event.to_json())
                # Update heartbeat
                if connection_id in self.connection_metadata:
                    self.connection_metadata[connection_id]["last_heartbeat"] = datetime.utcnow()
            except Exception as e:
                logger.error(f"Error sending to {connection_id}: {e}")
                await self.disconnect(connection_id)
    
    async def broadcast(self, event: WebSocketEvent, exclude_connection: Optional[str] = None):
        """Broadcast event to all connected clients."""
        disconnected = []
        for connection_id, websocket in list(self.active_connections.items()):
            if exclude_connection and connection_id == exclude_connection:
                continue
            try:
                await websocket.send_text(event.to_json())
                if connection_id in self.connection_metadata:
                    self.connection_metadata[connection_id]["last_heartbeat"] = datetime.utcnow()
            except Exception as e:
                logger.error(f"Error broadcasting to {connection_id}: {e}")
                disconnected.append(connection_id)
        
        # Cleanup disconnected clients
        for connection_id in disconnected:
            await self.disconnect(connection_id)
    
    async def broadcast_to_user(self, user_id: str, event: WebSocketEvent):
        """Broadcast event to all connections of a specific user."""
        if user_id in self.user_connections:
            for connection_id in list(self.user_connections[user_id]):
                await self.send_personal(connection_id, event)
    
    def get_active_connections_count(self) -> int:
        """Get total number of active connections."""
        return len(self.active_connections)
    
    def get_user_connections_count(self, user_id: str) -> int:
        """Get number of connections for a specific user."""
        return len(self.user_connections.get(user_id, set()))
    
    async def heartbeat(self):
        """Send heartbeat to all connections."""
        event = WebSocketEvent(
            EventType.HEARTBEAT,
            {
                "status": "ping",
                "connections": self.get_active_connections_count(),
                "active_connections": self.get_active_connections_count()
            },
        )
        await self.broadcast(event)


class BroadcastService:
    """Service for broadcasting events across WebSocket connections."""
    
    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager
        self._event_queue: asyncio.Queue = asyncio.Queue()
        self._event_handlers: Dict[EventType, list[Callable]] = {}
    
    def register_handler(self, event_type: EventType, handler: Callable):
        """Register a handler for a specific event type."""
        if event_type not in self._event_handlers:
            self._event_handlers[event_type] = []
        self._event_handlers[event_type].append(handler)
    
    async def emit(
        self,
        event_type: EventType,
        data: Dict[str, Any],
        user_id: Optional[str] = None,
        broadcast: bool = True,
        target_connection: Optional[str] = None,
    ):
        """Emit an event to be broadcasted."""
        event = WebSocketEvent(event_type, data, user_id)
        
        # Call registered handlers
        if event_type in self._event_handlers:
            for handler in self._event_handlers[event_type]:
                try:
                    if asyncio.iscoroutinefunction(handler):
                        await handler(event)
                    else:
                        handler(event)
                except Exception as e:
                    logger.error(f"Error in event handler for {event_type}: {e}")
        
        # Broadcast or send to specific connection
        if target_connection:
            await self.connection_manager.send_personal(target_connection, event)
        elif user_id and not broadcast:
            await self.connection_manager.broadcast_to_user(user_id, event)
        elif broadcast:
            await self.connection_manager.broadcast(event)
    
    async def broadcast_update(
        self,
        resource_type: str,
        resource_id: str,
        action: str,
        data: Dict[str, Any],
    ):
        """Broadcast a resource update."""
        event_data = {
            "resource_type": resource_type,
            "resource_id": resource_id,
            "action": action,
            **data,
        }
        
        # Determine event type based on resource
        event_type_map = {
            "incident": EventType.INCIDENT_UPDATED,
            "volunteer": EventType.VOLUNTEER_UPDATED,
            "crowd": EventType.CROWD_ZONE_UPDATE,
            "accessibility": EventType.ACCESSIBILITY_REQUEST,
            "sustainability": EventType.SUSTAINABILITY_UPDATE,
            "notification": EventType.NOTIFICATION,
        }
        
        event_type = event_type_map.get(resource_type, EventType.DASHBOARD_UPDATE)
        await self.emit(event_type, event_data, broadcast=True)


# Global instances
connection_manager: Optional[ConnectionManager] = None
broadcast_service: Optional[BroadcastService] = None


def get_connection_manager() -> ConnectionManager:
    """Get or create the global connection manager."""
    global connection_manager
    if connection_manager is None:
        connection_manager = ConnectionManager()
    return connection_manager


def get_broadcast_service() -> BroadcastService:
    """Get or create the global broadcast service."""
    global broadcast_service
    if broadcast_service is None:
        manager = get_connection_manager()
        broadcast_service = BroadcastService(manager)
    return broadcast_service
