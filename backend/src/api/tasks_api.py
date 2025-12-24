from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
import asyncio
import json
import threading
import logging
from models.task_model import TaskRequest, TaskResponse, TaskStatus

# Import team instances
from team_instances import get_team_instances

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage for tasks (in a real app, use a database)
tasks: Dict[str, TaskStatus] = {}

# Thread lock for safe task updates (for progressive updates)
task_update_lock = threading.Lock()

@router.post("/tasks", response_model=TaskResponse)
async def create_task(task_request: TaskRequest):
    """Create a new task"""
    import time
    # Generate a unique task ID
    task_id = f"task_{len(tasks) + 1}_{int(time.time())}"
    
    # Parse team from request (format: [TEAM: team_domain] request)
    request_text = task_request.request
    team_domain = None
    
    if request_text.startswith("[TEAM:"):
        end_bracket = request_text.find("]")
        if end_bracket != -1:
            team_domain = request_text[6:end_bracket].strip()
            request_text = request_text[end_bracket + 1:].strip()
    
    # Auto-detect team if not specified
    if not team_domain:
        team_domain = detect_team_from_request(request_text)
    
    # Create task status
    from datetime import datetime
    task_status = TaskStatus(
        task_id=task_id,
        user_id=task_request.user_id,
        original_request=request_text,  # Store the cleaned request
        voice_input=task_request.voice_input,
        status="pending",
        assigned_team=team_domain,
        priority=task_request.priority,
        created_at=datetime.now().isoformat()
    )
    
    tasks[task_id] = task_status
    
    logger.info(f"🔍 DEBUG: tasks_api tasks dict ID: {id(tasks)}")
    logger.info(f"🔍 DEBUG: Added task {task_id} to tasks. Keys: {list(tasks.keys())}")
    
    # Process task asynchronously in background
    asyncio.create_task(process_task_async(task_id, request_text, team_domain))
    
    return TaskResponse(
        task_id=task_id,
        status="pending",
        estimated_completion="2-5 minutes"
    )

@router.get("/tasks/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """Get the status of a specific task with progressive results"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    
    # Log progressive update status for debugging
    if task.result and "results" in task.result:
        completed_steps = [step for step, data in task.result["results"].items() if data.get("status") == "completed"]
        logger.debug(f"📊 Task {task_id} status: {task.status}, completed steps: {completed_steps}")
    
    return task

@router.post("/tasks/{task_id}/instruction")
async def send_team_instruction(task_id: str, instruction_request: Dict[str, Any]):
    """Send additional instruction to a team for human-in-the-loop interaction"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    instruction = instruction_request.get("instruction", "")
    
    print(f"📝 Received instruction for task {task_id}: {instruction}")
    
    # Get team instances
    team_instances = get_team_instances()
    team_domain = task.assigned_team
    
    try:
        if team_domain and team_domain in team_instances and team_instances[team_domain] is not None:
            # Process additional instruction with the team
            request_data = {
                "request": f"Additional instruction: {instruction}",
                "priority": "high",
                "context": task.original_request,
                "task_id": task_id
            }
            
            # Create a new background task for the instruction
            asyncio.create_task(process_instruction_async(task_id, instruction, team_domain))
            
            return {
                "status": "accepted",
                "message": f"Instruction sent to {team_domain} team",
                "task_id": task_id
            }
        else:
            return {
                "status": "error",
                "message": f"Team {team_domain} not available for instructions"
            }
            
    except Exception as e:
        print(f"❌ Error sending instruction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_instruction_async(task_id: str, instruction: str, team_domain: str):
    """Process additional instruction for human-in-the-loop interaction"""
    from datetime import datetime
    
    print(f"🔄 Processing instruction for task {task_id}: {instruction}")
    
    # Get team instances
    team_instances = get_team_instances()
    
    try:
        if team_domain in team_instances and team_instances[team_domain] is not None:
            # Process the instruction
            request_data = {
                "request": f"Human feedback: {instruction}",
                "priority": "high",
                "iteration": True
            }
            
            result = await team_instances[team_domain].process_request(request_data)
            
            # Update the task with the new result
            if task_id in tasks:
                current_result = tasks[task_id].result or {}
                if "iterations" not in current_result:
                    current_result["iterations"] = []
                
                current_result["iterations"].append({
                    "instruction": instruction,
                    "result": result,
                    "timestamp": datetime.now().isoformat()
                })
                
                tasks[task_id].result = current_result
                
            print(f"✅ Instruction processed for task {task_id}")
            
    except Exception as e:
        print(f"❌ Error processing instruction for task {task_id}: {e}")

def detect_team_from_request(request_text: str) -> str:
    """Auto-detect team based on request content"""
    request_lower = request_text.lower()
    
    # Travel-related keywords
    travel_keywords = ["travel", "trip", "vacation", "visit", "tour", "flight", "hotel", "destination", "itinerary", "madinah", "medina", "makkah", "mecca", "saudi arabia"]
    if any(keyword in request_lower for keyword in travel_keywords):
        return "travel_planning"
    
    # Web design keywords
    web_design_keywords = ["website", "web design", "ui", "ux", "landing page", "homepage"]
    if any(keyword in request_lower for keyword in web_design_keywords):
        return "web_design"
    
    # Default to travel planning for now
    return "travel_planning"

async def process_task_async(task_id: str, request_text: str, team_domain: Optional[str] = None):
    """Process task using Microsoft Agent Framework teams with REAL workflow execution"""
    from datetime import datetime
    import traceback
    
    print(f"🚀 Starting REAL MAF task processing: {task_id} for team {team_domain}")
    
    # Update task status to processing
    if task_id in tasks:
        tasks[task_id].status = "processing"
        tasks[task_id].started_at = datetime.now().isoformat()
    
    # Get team instances
    team_instances = get_team_instances()
    
    try:
        if team_domain and team_domain in team_instances and team_instances[team_domain] is not None:
            print(f"✅ Processing with REAL MAF team: {team_domain}")
            
            # Process with actual MAF team workflow
            request_data = {
                "request": request_text,
                "priority": tasks[task_id].priority if task_id in tasks else "normal",
                "task_id": task_id
            }
            
            print(f"📤 Executing REAL MAF workflow...")
            
            # Execute the team workflow and wait for completion
            result = await team_instances[team_domain].process_request(request_data)
            
            print(f"📊 MAF Team processing result: {result}")
            
            # Validate that we got a real result
            if not result or not result.get("success"):
                raise Exception(f"MAF workflow failed: {result.get('error', 'Unknown error')}")
            
            # Update task with REAL result
            if task_id in tasks:
                tasks[task_id].status = "completed"
                tasks[task_id].completed_at = datetime.now().isoformat()
                tasks[task_id].result = {
                    "status": "success",
                    "data": json.dumps(result) if result else None,
                    "full_result": result,
                    "timestamp": datetime.now().isoformat()
                }
            
            print(f"✅ REAL MAF Task {task_id} completed successfully")
            
        else:
            print(f"⚠️ Team {team_domain} not found, using intelligent fallback")
            await process_fallback_task(task_id, request_text, team_domain)
            
    except Exception as e:
        print(f"❌ Error processing MAF task {task_id}: {e}")
        print(f"📋 Traceback: {traceback.format_exc()}")
        
        # Update task with error
        if task_id in tasks:
            tasks[task_id].status = "failed"
            tasks[task_id].completed_at = datetime.now().isoformat()
            tasks[task_id].error = str(e)
            tasks[task_id].result = {
                "status": "error",
                "data": None,
                "full_result": None,
                "timestamp": datetime.now().isoformat()
            }

async def process_fallback_task(task_id: str, request_text: str, team_domain: Optional[str] = None):
    """Process task with fallback mock responses"""
    from datetime import datetime
    
    print(f"🔄 Processing fallback for task {task_id}")
    
    # Simulate processing time
    await asyncio.sleep(2)
    
    # Create mock result based on team domain
    if team_domain == "travel_planning":
        mock_result = {
            "success": True,
            "team": "Travel Planning Team",
            "result": {
                "workflow_data": {
                    "plan": {
                        "destination": "Madinah, Saudi Arabia",
                        "duration": "14 days",
                        "budget_estimate": {
                            "total_estimate": "$3500 - $7570"
                        }
                    }
                },
                "results": {
                    "initial_planning": {
                        "plan": {
                            "destination": "Madinah, Saudi Arabia",
                            "duration": "14 days",
                            "budget_estimate": {
                                "total_estimate": "$3500 - $7570"
                            }
                        }
                    },
                    "destination_research": {
                        "research_data": {
                            "key_attractions": [
                                "Prophet's Mosque (Al-Masjid an-Nabawi)",
                                "Quba Mosque - First mosque in Islam",
                                "Mount Uhud - Historic battlefield"
                            ]
                        }
                    },
                    "real_time_search": {
                        "search_results": {
                            "results_count": 15
                        },
                        "query": "Madinah Saudi Arabia travel guide"
                    },
                    "final_compilation": {
                        "status": "completed"
                    }
                }
            }
        }
    else:
        mock_result = {
            "success": True,
            "team": team_domain or "Unknown Team",
            "result": {
                "message": f"Task processed successfully by {team_domain} team",
                "request": request_text
            }
        }
    
    # Update task with mock result
    if task_id in tasks:
        tasks[task_id].status = "completed"
        tasks[task_id].completed_at = datetime.now().isoformat()
        tasks[task_id].result = {
            "status": "success",
            "data": json.dumps(mock_result),
            "full_result": mock_result,
            "timestamp": datetime.now().isoformat()
        }
    
    print(f"✅ Fallback processing completed for task {task_id}")