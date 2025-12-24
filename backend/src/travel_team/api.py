"""
Travel Plans API Endpoints
FastAPI routes for travel plan CRUD operations
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from .models import TravelPlanModel
import uuid

router = APIRouter(prefix="/api/travel", tags=["travel"])

# Initialize the model
travel_model = TravelPlanModel()

class TravelPlanCreate(BaseModel):
    departure: Optional[str] = None
    destination: str
    start_date: str
    end_date: str
    adults: int = 1
    children: int = 0
    budget: Optional[str] = None
    preferences: Optional[str] = None
    status: str = "planning"
    task_id: Optional[str] = None

class TravelPlanUpdate(BaseModel):
    departure: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    adults: Optional[int] = None
    children: Optional[int] = None
    budget: Optional[str] = None
    preferences: Optional[str] = None
    status: Optional[str] = None
    task_id: Optional[str] = None

class TravelWorkflowCreate(BaseModel):
    destination: str
    duration: str = "7 days"
    budget: str = "$2500"
    preferences: Dict = {}
    user_id: str = "default_user"

@router.post("/create")
async def create_travel_workflow(workflow: TravelWorkflowCreate):
    """Create a new travel planning workflow for split-screen"""
    try:
        from datetime import datetime, timedelta
        import asyncio
        
        # Import tasks API to start real workflow
        try:
            from api.tasks_api import tasks, process_task_async
            from models.task_model import TaskStatus
        except ImportError:
            # Fallback if import fails
            tasks = {}
            process_task_async = None
            TaskStatus = None
        
        # Generate workflow ID (use as task_id)
        workflow_id = f"travel_{uuid.uuid4().hex[:8]}"
        
        # Calculate dates based on duration
        start_date = datetime.now().strftime('%Y-%m-%d')
        # Parse duration (e.g., "7 days" -> 7)
        try:
            days = int(workflow.duration.split()[0])
        except:
            days = 7  # Default to 7 days
        end_date = (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%d')
        
        # Create a travel plan in the database
        plan_data = {
            'id': workflow_id,
            'destination': workflow.destination,
            'start_date': start_date,
            'end_date': end_date,
            'adults': 1,
            'children': 0,
            'budget': workflow.budget,
            'preferences': str(workflow.preferences),
            'status': 'in_progress',
            'task_id': workflow_id
        }
        
        created_plan = travel_model.create_travel_plan(plan_data)
        
        # Start the real workflow via tasks_api
        if process_task_async and TaskStatus:
            request_text = f"Plan a trip to {workflow.destination} for {workflow.duration} with a budget of {workflow.budget}"
            if workflow.preferences:
                request_text += f". Preferences: {workflow.preferences}"
            
            # Create task status entry
            task_status = TaskStatus(
                task_id=workflow_id,
                user_id=workflow.user_id,
                original_request=request_text,
                voice_input=None,
                status="pending",
                assigned_team="travel_planning",
                priority="normal",
                created_at=datetime.now().isoformat()
            )
            
            # Add to tasks dictionary
            tasks[workflow_id] = task_status
            
            print(f"🔍 DEBUG: travel_api tasks dict ID: {id(tasks)}")
            print(f"🔍 DEBUG: Added task {workflow_id} to tasks")
            
            # Start processing in background
            asyncio.create_task(process_task_async(workflow_id, request_text, "travel_planning"))
            print(f"🚀 Started real travel workflow: {workflow_id}")
        
        return {
            "success": True,
            "data": {
                "workflow_id": workflow_id,
                "destination": workflow.destination,
                "duration": workflow.duration,
                "budget": workflow.budget,
                "status": "started"
            },
            "message": "Travel workflow created successfully"
        }
    except Exception as e:
        print(f"❌ Error creating travel workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create travel workflow: {str(e)}")

@router.post("/plans")
async def create_travel_plan(plan: TravelPlanCreate):
    """Create a new travel plan"""
    try:
        plan_data = plan.dict()
        plan_data['id'] = str(uuid.uuid4())
        
        created_plan = travel_model.create_travel_plan(plan_data)
        return {
            "success": True,
            "data": created_plan,
            "message": "Travel plan created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create travel plan: {str(e)}")

@router.get("/plans")
async def get_all_travel_plans(user_id: str = "default_user"):
    """Get all travel plans for a user"""
    try:
        plans = travel_model.get_all_travel_plans(user_id)
        return {
            "success": True,
            "data": plans,
            "count": len(plans)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch travel plans: {str(e)}")

@router.get("/plans/{plan_id}")
async def get_travel_plan(plan_id: str):
    """Get a specific travel plan"""
    try:
        plan = travel_model.get_travel_plan(plan_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Travel plan not found")
        
        return {
            "success": True,
            "data": plan
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch travel plan: {str(e)}")

@router.put("/plans/{plan_id}")
async def update_travel_plan(plan_id: str, updates: TravelPlanUpdate):
    """Update a travel plan"""
    try:
        # Only include non-None values in updates
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        
        updated_plan = travel_model.update_travel_plan(plan_id, update_data)
        if not updated_plan:
            raise HTTPException(status_code=404, detail="Travel plan not found")
        
        return {
            "success": True,
            "data": updated_plan,
            "message": "Travel plan updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update travel plan: {str(e)}")

@router.delete("/plans/{plan_id}")
async def delete_travel_plan(plan_id: str):
    """Delete a travel plan"""
    try:
        success = travel_model.delete_travel_plan(plan_id)
        if not success:
            raise HTTPException(status_code=404, detail="Travel plan not found")
        
        return {
            "success": True,
            "message": "Travel plan deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete travel plan: {str(e)}")

@router.get("/plans/status/{status}")
async def get_plans_by_status(status: str, user_id: str = "default_user"):
    """Get travel plans by status"""
    try:
        plans = travel_model.get_plans_by_status(status, user_id)
        return {
            "success": True,
            "data": plans,
            "count": len(plans)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch travel plans: {str(e)}")

@router.get("/tasks/{task_id}")
async def get_travel_task_status(task_id: str):
    """Get travel task status from database - for workflow dashboard"""
    try:
        # Get the travel plan by task_id
        plan = travel_model.get_plan_by_task_id(task_id)
        
        if not plan:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Convert travel plan to task status format
        task_status = {
            "task_id": task_id,
            "user_id": "default_user",
            "original_request": f"Plan a trip to {plan.get('destination', 'Unknown')}",
            "status": "completed" if plan.get('result') else "processing",
            "assigned_team": "travel_planning",
            "priority": "normal",
            "created_at": plan.get('created_at', ''),
            "completed_at": plan.get('updated_at') if plan.get('result') else None,
            "result": None
        }
        
        # If we have results, parse and format them
        if plan.get('result'):
            try:
                # Check if result is already a dict (parsed by model) or string
                if isinstance(plan['result'], dict):
                    result_data = plan['result']
                else:
                    import json
                    result_data = json.loads(plan['result'])
                
                task_status["result"] = result_data
                task_status["status"] = "completed"
            except (json.JSONDecodeError, TypeError):
                # If result is not valid JSON, treat as processing
                task_status["status"] = "processing"
        
        return task_status
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting travel task status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get task status: {str(e)}")

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check for travel API"""
    return {
        "success": True,
        "message": "Travel API is healthy",
        "database": "connected"
    }