"""
Task model definitions for the Lingo Master Agent Backend
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class TaskRequest(BaseModel):
    user_id: str
    request: str
    priority: str = "normal"
    voice_input: Optional[str] = None

class TaskResponse(BaseModel):
    task_id: str
    status: str
    estimated_completion: Optional[str] = None

class TaskStatus(BaseModel):
    task_id: str
    user_id: str
    original_request: str
    voice_input: Optional[str] = None
    status: str
    assigned_team: Optional[str] = None
    priority: str
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class TeamInstructionRequest(BaseModel):
    task_id: str
    instruction: str
    user_id: str