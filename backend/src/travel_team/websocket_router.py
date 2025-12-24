"""
WebSocket router for Travel Team real-time updates
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import logging
from typing import Dict, Any

# Import tasks from tasks_api to access real workflow status
try:
    from api.tasks_api import tasks
except ImportError:
    # Fallback if import fails (e.g. running tests)
    tasks = {}

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/travel/{workflow_id}")
async def travel_workflow_websocket(websocket: WebSocket, workflow_id: str):
    """
    WebSocket endpoint for real-time travel workflow updates
    Connects to the real MAF workflow via tasks_api
    """
    await websocket.accept()
    logger.info(f"✅ Travel workflow WebSocket connected: {workflow_id}")
    logger.info(f"🔍 DEBUG: tasks dict ID: {id(tasks)}")
    logger.info(f"🔍 DEBUG: tasks keys: {list(tasks.keys())}")
    
    try:
        # Send initial status
        await websocket.send_json({
            "type": "status",
            "message": "Travel workflow started",
            "workflow_id": workflow_id
        })
        
        # Track sent steps to avoid duplicates
        sent_steps = set()
        
        # Map MAF steps to frontend display names if needed
        # The frontend likely expects specific agent names or step IDs
        step_mapping = {
            "initial_planning": "Initial Planning",
            "destination_research": "Destination Research",
            "real_time_search": "Real-time Search",
            "final_compilation": "Final Compilation"
        }
        
        # Keep connection alive and poll for updates
        poll_count = 0
        while True:
            poll_count += 1
            
            # Check if task exists in the real tasks dictionary
            if workflow_id in tasks:
                task = tasks[workflow_id]
                logger.info(f"🔍 Poll #{poll_count}: Task found. Status: {task.status}, Has result: {bool(task.result)}")
                
                # Check for results
                if task.result and "results" in task.result:
                    results = task.result["results"]
                    logger.info(f"🔍 Results keys: {list(results.keys())}")
                    
                    # Check each step
                    for step_key, step_name in step_mapping.items():
                        if step_key in results and step_key not in sent_steps:
                            step_data = results[step_key]
                            
                            if step_data.get("status") == "completed":
                                # Send completion update
                                # We send both the raw key and a display name
                                await websocket.send_json({
                                    "type": "progress",
                                    "agent_name": step_name,  # Display name
                                    "step_id": step_key,      # Internal ID
                                    "status": "completed",
                                    "message": f"{step_name} completed",
                                    "data": step_data,
                                    "progress": len(sent_steps) * 25 + 25  # Approximate progress
                                })
                                sent_steps.add(step_key)
                                logger.info(f"📤 Sent WebSocket update for {step_name} (Task {workflow_id})")
                
                # Check if task is completed
                if task.status == "completed" and "final_compilation" in sent_steps:
                    await websocket.send_json({
                        "type": "complete",
                        "message": "Travel plan created successfully!",
                        "workflow_id": workflow_id,
                        "result": task.result
                    })
                    logger.info(f"✅ Travel workflow completed: {workflow_id}")
                    break
                
                # Check if task failed
                if task.status == "failed":
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Workflow failed: {getattr(task, 'error', 'Unknown error')}"
                    })
                    break
            else:
                # Task not found yet (maybe starting up), or invalid ID
                if poll_count % 10 == 0:  # Log every 10 polls
                    logger.warning(f"⚠️ Poll #{poll_count}: Task {workflow_id} not found in tasks dict")
                    logger.info(f"🔍 Available tasks: {list(tasks.keys())[:5]}")  # Show first 5
            
            await asyncio.sleep(1)
            
            # Send heartbeat to keep connection alive
            try:
                await websocket.send_json({
                    "type": "heartbeat",
                    "timestamp": asyncio.get_event_loop().time()
                })
            except Exception:
                break
            
    except WebSocketDisconnect:
        logger.info(f"🔌 Travel workflow WebSocket disconnected: {workflow_id}")
    except Exception as e:
        logger.error(f"❌ Travel workflow WebSocket error: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass
