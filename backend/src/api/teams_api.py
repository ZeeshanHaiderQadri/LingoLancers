"""
API endpoints for team management
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from models.team_model import TeamInfo, TeamDashboardData, TeamTask, TeamMessage

# Import team instances
from team_instances import get_team_instances

router = APIRouter()

# Mock team data
TEAMS = [
    TeamInfo(
        domain="web_design",
        name="WEB DESIGN",
        description="UI/UX design, wireframing, prototyping, responsive design.",
        capabilities=["UI/UX Design", "Wireframing", "Prototyping", "Responsive Design"]
    ),
    TeamInfo(
        domain="web_development",
        name="WEB DEVELOPMENT",
        description="Frontend/backend development, API integration, deployment.",
        capabilities=["Frontend", "Backend", "APIs", "Databases", "Deployment"]
    ),
    TeamInfo(
        domain="ecommerce",
        name="ECOMMERCE",
        description="Online store setup, product management, payment integration.",
        capabilities=["Store Setup", "Product Management", "Payment Integration", "Optimization"]
    ),
    TeamInfo(
        domain="social_media",
        name="SOCIAL MEDIA",
        description="Multi-platform content strategy, engagement, analytics.",
        capabilities=["Content Strategy", "Platform Management", "Analytics", "Engagement"]
    ),
    TeamInfo(
        domain="blog_writing",
        name="BLOG WRITING",
        description="Long-form content, SEO optimization, storytelling.",
        capabilities=["Article Writing", "SEO Optimization", "Content Planning", "Editing"]
    ),
    TeamInfo(
        domain="research",
        name="RESEARCH",
        description="Market analysis, data interpretation, trend forecasting.",
        capabilities=["Market Research", "Data Analysis", "Trend Analysis", "Reporting"]
    ),
    TeamInfo(
        domain="finance_advisor",
        name="FINANCE ADVISOR",
        description="Financial planning, investment strategy, risk assessment.",
        capabilities=["Financial Planning", "Investment Strategy", "Risk Assessment", "Modeling"]
    ),
    TeamInfo(
        domain="marketing_agency",
        name="MARKETING AGENCY",
        description="Campaign development, brand strategy, digital marketing.",
        capabilities=["Campaign Development", "Brand Strategy", "Digital Marketing", "ROI Tracking"]
    ),
    TeamInfo(
        domain="travel_planning",
        name="TRAVEL PLANNING",
        description="Travel itineraries, accommodation recommendations, activity planning with real-time search capabilities.",
        capabilities=["Itinerary Planning", "Accommodation Booking", "Activity Recommendations", "Travel Tips", "Real-time Search"]
    )
]

@router.get("/teams", response_model=List[TeamInfo])
async def get_teams():
    """Get all available teams"""
    return TEAMS

@router.get("/teams/{team_id}/dashboard", response_model=TeamDashboardData)
async def get_team_dashboard(team_id: str):
    """Get team dashboard data"""
    # Find the team
    team = next((t for t in TEAMS if t.domain == team_id), None)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Mock tasks based on team
    tasks = []
    if team_id == "travel_planning":
        tasks = [
            TeamTask(
                task_id="task_1",
                content="Analyzing travel destination and user preferences",
                status="completed",
                type="thought",
                result="Identified key attractions and activities for the destination"
            ),
            TeamTask(
                task_id="task_2",
                content="Researching accommodations and transportation options",
                status="processing",
                type="task"
            ),
            TeamTask(
                task_id="task_3",
                content="Creating detailed day-by-day itinerary",
                status="pending",
                type="task"
            )
        ]
    else:
        tasks = [
            TeamTask(
                task_id="task_1",
                content="Analyzing user request and determining approach",
                status="completed",
                type="thought",
                result="Determined that this is a content creation task"
            ),
            TeamTask(
                task_id="task_2",
                content="Researching relevant topics and gathering information",
                status="processing",
                type="task"
            ),
            TeamTask(
                task_id="task_3",
                content="Creating initial draft content",
                status="pending",
                type="task"
            )
        ]
    
    return TeamDashboardData(
        team_id=team_id,
        team_name=team.name,
        tasks=tasks,
        status="active",
        members=["SpecialistAgent", "AnalysisAgent", "SupportAgent"]
    )

@router.get("/teams/{team_id}/messages", response_model=List[TeamMessage])
async def get_team_messages(team_id: str):
    """Get team chat messages"""
    # Find the team
    team = next((t for t in TEAMS if t.domain == team_id), None)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Mock messages based on team
    if team_id == "travel_planning":
        messages = [
            TeamMessage(
                message_id="msg_1",
                content=f"Hello! I'm the TravelSpecialist agent for the {team.name} team. I'll help create an amazing travel plan for you.",
                sender="TravelSpecialist",
                timestamp="2024-01-01T00:00:00Z",
                type="agent"
            ),
            TeamMessage(
                message_id="msg_2",
                content=f"I'm the ResearchAssistant for the {team.name} team. I'll gather relevant information about your destination.",
                sender="ResearchAssistant",
                timestamp="2024-01-01T00:00:01Z",
                type="agent"
            ),
            TeamMessage(
                message_id="msg_3",
                content=f"I'm the TavilySearchAgent for the {team.name} team. I can perform real-time searches for current travel information.",
                sender="TavilySearchAgent",
                timestamp="2024-01-01T00:00:02Z",
                type="agent"
            )
        ]
    else:
        messages = [
            TeamMessage(
                message_id="msg_1",
                content=f"Hello! I'm an agent for the {team.name} team. I'm here to help with your request.",
                sender="SpecialistAgent",
                timestamp="2024-01-01T00:00:00Z",
                type="agent"
            ),
            TeamMessage(
                message_id="msg_2",
                content="I'm analyzing your request and preparing to help.",
                sender="AnalysisAgent",
                timestamp="2024-01-01T00:00:01Z",
                type="agent"
            ),
            TeamMessage(
                message_id="msg_3",
                content="I can assist with various tasks. Please let me know what you need!",
                sender="SupportAgent",
                timestamp="2024-01-01T00:00:02Z",
                type="agent"
            )
        ]
    
    return messages

@router.post("/teams/{team_id}/instruction")
async def send_team_instruction(team_id: str, instruction_request: dict):
    """Send an instruction to a team"""
    # Find the team
    team = next((t for t in TEAMS if t.domain == team_id), None)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Get team instances
    team_instances = get_team_instances()
    web_design_team = team_instances['web_design_team']
    web_development_team = team_instances['web_development_team']
    ecommerce_team = team_instances['ecommerce_team']
    social_media_team = team_instances['social_media_team']
    blog_writing_team = team_instances['blog_writing_team']
    research_team = team_instances['research_team']
    travel_planning_team = team_instances['travel_planning_team']
    
    # Process the instruction with the appropriate team
    result = None
    
    # Print debug info
    print(f"Processing instruction for team {team_id}")
    print(f"Web design team available: {web_design_team is not None}")
    
    if team_id == "web_design" and web_design_team:
        result = await web_design_team.process_request(instruction_request)
    elif team_id == "web_development" and web_development_team:
        result = await web_development_team.process_request(instruction_request)
    elif team_id == "ecommerce" and ecommerce_team:
        result = await ecommerce_team.process_request(instruction_request)
    elif team_id == "social_media" and social_media_team:
        result = await social_media_team.process_request(instruction_request)
    elif team_id == "blog_writing" and blog_writing_team:
        result = await blog_writing_team.process_request(instruction_request)
    elif team_id == "research" and research_team:
        result = await research_team.process_request(instruction_request)
    elif team_id == "travel_planning" and travel_planning_team:
        result = await travel_planning_team.process_request(instruction_request)
    
    if result:
        return {
            "status": "success" if result.get("success") else "failed",
            "message": f"Instruction processed by {team.name} team",
            "result": result
        }
    else:
        return {
            "status": "error",
            "message": f"Team {team.name} not available"
        }