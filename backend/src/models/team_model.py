"""
Team model definitions for the Lingo Master Agent Backend
"""

from pydantic import BaseModel
from typing import List, Optional

class TeamInfo(BaseModel):
    domain: str
    name: str
    description: str
    capabilities: List[str]

class TeamTask(BaseModel):
    task_id: str
    content: str
    status: str
    type: str
    result: Optional[str] = None
    error: Optional[str] = None

class TeamMessage(BaseModel):
    message_id: str
    content: str
    sender: str
    timestamp: str
    type: str

class TeamDashboardData(BaseModel):
    team_id: str
    team_name: str
    tasks: List[TeamTask]
    status: str
    members: List[str]