"""
WebSocket Router for Tasks
WebSocket endpoints for real-time task updates
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import logging
import json
import asyncio

# Import the connection manager from blog team (shared manager)
from blog_team.api.websocket_manager import get_connection_manager

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/tasks", tags=["websocket"])


@router.websocket("/{task_id}")
async def task_websocket_endpoint(
    websocket: WebSocket,
    task_id: str,
    token: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for task updates
    
    Connect to this endpoint to receive real-time updates about a task.
    
    URL: ws://localhost:8001/api/tasks/{task_id}
    
    Query Parameters:
    - token: Authentication token (optional, for future use)
    
    Events sent to client:
    - connected: Connection established
    - task_update: Task progress update
    - task_completed: Task completed
    - task_error: Task error occurred
    """
    manager = get_connection_manager()
    
    try:
        # Connect the WebSocket
        await manager.connect(websocket, task_id)
        
        logger.info(f"WebSocket connection established for task {task_id}")
        
        # Import tasks from tasks_api to poll for updates
        from api.tasks_api import tasks
        
        # Track sent steps to avoid duplicates
        sent_steps = set()
        
        # Map MAF steps to frontend display names
        step_mapping = {
            "initial_planning": "Initial Planning",
            "destination_research": "Destination Research",
            "real_time_search": "Real-time Search",
            "final_compilation": "Final Compilation"
        }
        
        poll_count = 0
        
        # Keep connection alive and poll for task updates
        while True:
            poll_count += 1
            
            try:
                # Check if task exists and has updates
                if task_id in tasks:
                    task = tasks[task_id]
                    
                    if poll_count % 5 == 0:  # Log every 5 polls
                        logger.info(f"🔍 Poll #{poll_count}: Task {task_id} status={task.status}, has_result={bool(task.result)}")
                    
                    # Check for progressive results
                    if task.result and isinstance(task.result, dict) and "results" in task.result:
                        results = task.result["results"]
                        
                        # Check each step
                        for step_key, step_name in step_mapping.items():
                            if step_key in results and step_key not in sent_steps:
                                step_data = results[step_key]
                                
                                if step_data.get("status") == "completed":
                                    # Send completion update
                                    await websocket.send_json({
                                        "type": "progress",
                                        "agent_name": step_name,
                                        "step_id": step_key,
                                        "status": "completed",
                                        "message": f"{step_name} completed",
                                        "data": step_data,
                                        "progress": len(sent_steps) * 25 + 25
                                    })
                                    sent_steps.add(step_key)
                                    logger.info(f"📤 Sent WebSocket update for {step_name} (Task {task_id})")
                    
                    # Check if task is completed
                    if task.status == "completed":
                        # Send final completion message  
                        await websocket.send_json({
                            "type": "complete",
                            "message": "Workflow completed successfully!",
                            "task_id": task_id,
                            "result": task.result
                        })
                        logger.info(f"✅ Task workflow completed: {task_id}")
                        # Keep connection for a bit then break
                        await asyncio.sleep(2)
                        break
                    
                    # Check if task failed
                    if task.status == "failed":
                        await websocket.send_json({
                            "type": "error",
                            "message": f"Workflow failed: {getattr(task, 'error', 'Unknown error')}"
                        })
                        break
                else:
                    if poll_count % 10 == 0:  # Log every 10 polls
                        logger.warning(f"⚠️ Poll #{poll_count}: Task {task_id} not found")
                
                # Wait before next poll
                await asyncio.sleep(1)
                
                # Also handle any incoming client messages in non-blocking way
                try:
                    data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                    message = json.loads(data)
                    message_type = message.get("type")
                    
                    if message_type == "ping":
                        await websocket.send_json({"type": "pong", "task_id": task_id})
                except asyncio.TimeoutError:
                    # No message from client, continue polling
                    pass
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON received")
            
            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for task {task_id}")
                break
            
            except Exception as e:
                logger.error(f"Error in WebSocket loop: {e}", exc_info=True)
                break
    
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}", exc_info=True)
    
    finally:
        # Disconnect and cleanup
        await manager.disconnect(websocket, task_id)
        logger.info(f"WebSocket cleanup completed for task {task_id}")


@router.get("/{task_id}/stats")
async def websocket_stats(task_id: str):
    """
    Get WebSocket connection statistics for a specific task
    
    Returns information about active WebSocket connections for a task.
    """
    manager = get_connection_manager()
    
    return {
        "task_id": task_id,
        "connections": manager.get_connection_count(task_id) if hasattr(manager, 'get_connection_count') else 0,
        "timestamp": "2024-01-01T00:00:00Z"
    }