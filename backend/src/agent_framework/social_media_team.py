"""
Social Media Team implemented with Microsoft Agent Framework Orchestrator
"""

from agent_framework.orchestrator import TeamOrchestrator, get_orchestrator
from agent_framework.social_media_agents import (
    ContentStrategistAgent,
    EngagementAnalystAgent,
    PlatformSpecialistAgent
)
from typing import Dict, Any, Optional
import asyncio

class SocialMediaTeam:
    """Social Media Team using Microsoft Agent Framework"""
    
    def __init__(self):
        self.name = "Social Media Team"
        self.domain = "social_media"
        self.description = "Team specialized in multi-platform content strategy, engagement, and analytics."
        self.team_orchestrator: Optional[TeamOrchestrator] = None
        self.is_active = False
    
    async def initialize(self) -> bool:
        """Initialize the social media team with Microsoft Agent Framework"""
        try:
            # Get the global orchestrator
            orchestrator = await get_orchestrator()
            if not orchestrator:
                print("Error: Global orchestrator not available")
                return False
            
            # Create team orchestrator
            self.team_orchestrator = await orchestrator.create_team(
                team_id=self.domain,
                team_name=self.name,
                mcp_server_key="github"
            )
            
            if not self.team_orchestrator:
                print(f"Failed to create team orchestrator for {self.name}")
                return False
            
            # Create and add agents to the team
            agents = [
                ContentStrategistAgent(),
                EngagementAnalystAgent(),
                PlatformSpecialistAgent()
            ]
            
            for agent in agents:
                success = await self.team_orchestrator.add_agent(agent)
                if not success:
                    print(f"Failed to add agent {agent.name} to team")
                    return False
            
            self.is_active = True
            print(f"Team {self.name} initialized successfully with Microsoft Agent Framework")
            return True
                
        except Exception as e:
            print(f"Error initializing social media team: {e}")
            return False
    
    async def process_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a request using the social media team with Microsoft Agent Framework"""
        if not self.is_active or not self.team_orchestrator:
            return {
                "success": False,
                "error": "Team not properly initialized"
            }
        
        try:
            # Add team domain to request data
            request_data["team_domain"] = self.domain
            
            # Coordinate task execution through the orchestrator
            result = await self.team_orchestrator.coordinate_task(request_data)
            
            return {
                "success": True,
                "result": result,
                "team": self.name,
                "timestamp": "2024-01-01T00:00:00Z"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error processing request: {str(e)}",
                "team": self.name
            }
    
    async def shutdown(self):
        """Shutdown the team"""
        if self.team_orchestrator:
            await self.team_orchestrator.shutdown()
        self.is_active = False
        print(f"Team {self.name} shutdown completed")