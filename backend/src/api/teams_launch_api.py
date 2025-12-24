"""
API endpoints for launching teams with Microsoft Agent Framework
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
import uuid
from datetime import datetime

# Import team instances
from team_instances import get_team_instances

router = APIRouter()

class TeamLaunchRequest(BaseModel):
    """Request model for launching a team"""
    request: str
    priority: str = "normal"
    preferences: Dict[str, Any] = {}

class TeamLaunchResponse(BaseModel):
    """Response model for team launch"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.post("/teams/{team_domain}/launch", response_model=TeamLaunchResponse)
async def launch_team(team_domain: str, launch_request: TeamLaunchRequest):
    """Launch a team with Microsoft Agent Framework"""
    try:
        # Prepare the request data
        request_data = {
            "request": launch_request.request,
            "priority": launch_request.priority,
            "preferences": launch_request.preferences
        }
        
        # Get team instances
        team_instances = get_team_instances()
        web_design_team = team_instances['web_design_team']
        web_development_team = team_instances['web_development_team']
        ecommerce_team = team_instances['ecommerce_team']
        social_media_team = team_instances['social_media_team']
        blog_writing_team = team_instances['blog_writing_team']
        research_team = team_instances['research_team']
        travel_planning_team = team_instances['travel_planning_team']
        
        # Process the request with the appropriate team
        result = None
        
        # Print debug info
        print(f"Processing launch request for team {team_domain}")
        print(f"Web design team available: {web_design_team is not None}")
        
        if team_domain == "web_design" and web_design_team:
            result = await web_design_team.process_request(request_data)
        elif team_domain == "web_development" and web_development_team:
            result = await web_development_team.process_request(request_data)
        elif team_domain == "ecommerce" and ecommerce_team:
            result = await ecommerce_team.process_request(request_data)
        elif team_domain == "social_media" and social_media_team:
            result = await social_media_team.process_request(request_data)
        elif team_domain == "blog_writing" and blog_writing_team:
            result = await blog_writing_team.process_request(request_data)
        elif team_domain == "research" and research_team:
            result = await research_team.process_request(request_data)
        elif team_domain == "travel_planning" and travel_planning_team:
            result = await travel_planning_team.process_request(request_data)
        else:
            # Try to find team by name (for teams like "WEB DESIGN")
            team_name = team_domain.replace("_", " ").upper()
            if team_name == "WEB DESIGN" and web_design_team:
                result = await web_design_team.process_request(request_data)
            elif team_name == "WEB DEVELOPMENT" and web_development_team:
                result = await web_development_team.process_request(request_data)
            elif team_name == "ECOMMERCE" and ecommerce_team:
                result = await ecommerce_team.process_request(request_data)
            elif team_name == "SOCIAL MEDIA" and social_media_team:
                result = await social_media_team.process_request(request_data)
            elif team_name == "BLOG WRITING" and blog_writing_team:
                result = await blog_writing_team.process_request(request_data)
            elif team_name == "RESEARCH" and research_team:
                result = await research_team.process_request(request_data)
            elif team_name == "TRAVEL PLANNING" and travel_planning_team:
                result = await travel_planning_team.process_request(request_data)
            else:
                raise HTTPException(status_code=404, detail=f"Team {team_domain} not found")
        
        if result and result.get("success"):
            # Generate a task ID for tracking
            task_id = f"task_{uuid.uuid4().hex[:8]}"
            
            return TeamLaunchResponse(
                success=True,
                data={
                    "task_id": task_id,
                    "team_domain": team_domain,
                    "result": result,
                    "launched_at": datetime.utcnow().isoformat() + "Z"
                }
            )
        else:
            error_message = result.get("error") if result else f"Failed to process request with {team_domain} team"
            return TeamLaunchResponse(
                success=False,
                error=error_message
            )
            
    except Exception as e:
        return TeamLaunchResponse(
            success=False,
            error=f"Error launching team {team_domain}: {str(e)}"
        )