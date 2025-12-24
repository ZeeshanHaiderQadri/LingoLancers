"""
WebSocket Router for Blog Workflow
WebSocket endpoints for real-time workflow updates
Requirements: 10.1, 10.2, 10.3, 1.5
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import logging
import json

from .websocket_manager import get_connection_manager

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/ws/blog", tags=["websocket"])


@router.websocket("/{workflow_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    workflow_id: str,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for workflow updates
    
    Connect to this endpoint to receive real-time updates about a workflow.
    
    URL: ws://localhost:8000/ws/blog/{workflow_id}
    
    Query Parameters:
    - token: Authentication token (optional, for future use)
    
    Events sent to client:
    - connected: Connection established
    - agent_started: Agent execution started
    - agent_progress: Agent progress update
    - agent_completed: Agent execution completed
    - agent_failed: Agent execution failed
    - workflow_completed: Workflow completed
    - workflow_error: Workflow error occurred
    
    Example event:
    {
        "type": "agent_progress",
        "workflow_id": "abc-123",
        "agent_name": "research",
        "progress_percentage": 50,
        "message": "Analyzing sources...",
        "status": "running",
        "timestamp": "2025-10-14T10:00:00"
    }
    """
    manager = get_connection_manager()
    
    try:
        # TODO: Validate token for authentication
        # For now, accept all connections
        
        # Connect the WebSocket
        await manager.connect(websocket, workflow_id)
        
        logger.info(f"WebSocket connection established for workflow {workflow_id}")
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                # Receive messages from client (for heartbeat/ping)
                data = await websocket.receive_text()
                
                # Handle client messages
                try:
                    message = json.loads(data)
                    message_type = message.get("type")
                    
                    if message_type == "ping":
                        # Respond to ping with pong
                        await websocket.send_json({
                            "type": "pong",
                            "workflow_id": workflow_id
                        })
                    
                    elif message_type == "subscribe":
                        # Client wants to subscribe (already subscribed on connect)
                        await websocket.send_json({
                            "type": "subscribed",
                            "workflow_id": workflow_id,
                            "message": "Already subscribed to workflow updates"
                        })
                    
                    else:
                        logger.warning(f"Unknown message type: {message_type}")
                
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON received: {data}")
            
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for workflow {workflow_id}")
                break
            
            except Exception as e:
                logger.error(f"Error in WebSocket loop: {e}", exc_info=True)
                break
    
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}", exc_info=True)
    
    finally:
        # Disconnect and cleanup
        await manager.disconnect(websocket, workflow_id)
        logger.info(f"WebSocket cleanup completed for workflow {workflow_id}")


@router.get("/stats")
async def websocket_stats():
    """
    Get WebSocket connection statistics
    
    Returns information about active WebSocket connections.
    """
    manager = get_connection_manager()
    
    return {
        "total_connections": manager.get_total_connections(),
        "active_workflows": len(manager.active_connections),
        "workflows": {
            workflow_id: manager.get_connection_count(workflow_id)
            for workflow_id in manager.active_connections.keys()
        }
    }
