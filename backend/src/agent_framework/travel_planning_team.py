"""
Travel Planning Team for Microsoft Agent Framework
"""

from agent_framework.orchestrator import TeamOrchestrator, get_orchestrator
from agent_framework.travel_planning_agents import TravelSpecialistAgent, ResearchAssistantAgent, TavilySearchAgent
from typing import Dict, Any, Optional
import asyncio
import traceback
import uuid

class TravelPlanningTeam:
    """Travel Planning Team using Microsoft Agent Framework"""
    
    def __init__(self):
        self.name = "Travel Planning Team"
        self.domain = "travel_planning"
        self.description = "Team specialized in travel itineraries, accommodation recommendations, and activity planning."
        self.team_orchestrator: Optional[TeamOrchestrator] = None
        self.is_active = False
        self.agents = {}
        self.tavily_search_performed = False  # Track if Tavily search has been performed
        self.current_task_id = None  # Track current task ID to prevent infinite loops
    
    async def initialize(self) -> bool:
        """Initialize the travel planning team with Microsoft Agent Framework"""
        try:
            # Get the global orchestrator
            orchestrator = await get_orchestrator()
            if not orchestrator:
                print("Error: Global orchestrator not available")
                return False
            
            # Create team orchestrator for MCP integration only
            self.team_orchestrator = await orchestrator.create_team(
                team_id=self.domain,
                team_name=self.name,
                mcp_server_key="github"
            )
            
            # Create agents
            agents = [
                TravelSpecialistAgent(),
                ResearchAssistantAgent(),
                TavilySearchAgent()
            ]
            
            # Start and register agents with MCP if orchestrator exists
            for agent in agents:
                success = await agent.start()
                if success:
                    # Register with MCP server if available
                    if self.team_orchestrator and self.team_orchestrator.mcp_server:
                        agent.mcp_server = self.team_orchestrator.mcp_server
                        agent_info = {
                            "agent_id": agent.agent_id,
                            "name": agent.name,
                            "capabilities": agent.capabilities,
                            "team_id": self.domain
                        }
                        await self.team_orchestrator.mcp_server.connect_agent(agent.agent_id, agent_info)
                    # Store agents for direct access
                    self.agents[agent.agent_id] = agent
                else:
                    print(f"Failed to start agent {agent.name}")
                    return False
            
            self.is_active = True
            print(f"Team {self.name} initialized successfully with Microsoft Agent Framework")
            return True
                
        except Exception as e:
            print(f"Error initializing travel planning team: {e}")
            return False
    
    async def process_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a request using the travel planning team with Microsoft Agent Framework"""
        if not self.is_active:
            return {
                "success": False,
                "error": "Team not properly initialized"
            }
        
        # Generate a unique task ID for this request to prevent infinite loops
        task_id = str(uuid.uuid4())
        self.current_task_id = task_id
        
        try:
            # Extract request details
            request_text = request_data.get("request", "")
            user_preferences = request_data.get("preferences", {})
            
            print(f"=== Travel Planning Team Processing Request ===")
            print(f"Request: {request_text}")
            print(f"Task ID: {task_id}")
            
            # Reset Tavily search flag for new request
            self.tavily_search_performed = False
            
            # Step 1: Travel Specialist creates initial plan
            print("\n--- Step 1: Travel Specialist Creating Initial Plan ---")
            travel_specialist = self.agents.get("travel_specialist")
            if not travel_specialist:
                return {
                    "success": False,
                    "error": "Travel Specialist agent not available",
                    "team": self.name
                }
            
            plan_task = {
                "request": request_text,
                "preferences": user_preferences,
                "team_domain": self.domain,
                "task_id": task_id
            }
            
            plan_result = await travel_specialist.process_task(plan_task)
            print(f"Step 1 completed with success: {plan_result.get('success')}")
            
            if not plan_result.get("success"):
                error_msg = f"Travel Specialist failed: {plan_result.get('error', 'Unknown error')}"
                print(f"ERROR: {error_msg}")
                return {
                    "success": False,
                    "error": error_msg,
                    "team": self.name
                }
            
            # Extract the plan data for the next agent
            plan_data = plan_result.get("result", {})
            print(f"Plan data extracted for Research Assistant: {plan_data}")
            
            # Step 2: Research Assistant gathers detailed information
            print("\n--- Step 2: Research Assistant Gathering Detailed Information ---")
            research_assistant = self.agents.get("research_assistant")
            if not research_assistant:
                error_msg = "Research Assistant agent not available"
                print(f"ERROR: {error_msg}")
                return {
                    "success": False,
                    "error": error_msg,
                    "team": self.name
                }
            
            research_task = {
                "request": request_text,
                "plan": plan_data,
                "team_domain": self.domain,
                "task_id": task_id
            }
            
            research_result = await research_assistant.process_task(research_task)
            print(f"Step 2 completed with success: {research_result.get('success')}")
            
            if not research_result.get("success"):
                error_msg = f"Research Assistant failed: {research_result.get('error', 'Unknown error')}"
                print(f"ERROR: {error_msg}")
                # Don't fail the entire process if research fails, continue with available data
                research_result = {
                    "success": True,
                    "agent": "Research Assistant",
                    "result": {
                        "accommodation_info": "Accommodation information not available",
                        "transportation_info": "Transportation information not available",
                        "local_insights": "Local insights not available",
                        "cultural_information": "Cultural information not available"
                    },
                    "status": "completed"
                }
            
            # Extract research data for the next agent
            research_data = research_result.get("result", {})
            print(f"Research data extracted for Tavily Search: {research_data}")
            
            # Step 3: Tavily Search Agent performs real-time search
            print("\n--- Step 3: Tavily Search Agent Performing Real-time Search ---")
            tavily_agent = self.agents.get("tavily_search")
            if not tavily_agent:
                error_msg = "Tavily Search agent not available"
                print(f"ERROR: {error_msg}")
                return {
                    "success": False,
                    "error": error_msg,
                    "team": self.name
                }
            
            # Always perform Tavily search for new requests (don't skip based on flag)
            search_task = {
                "request": request_text,
                "team_domain": self.domain,
                "task_id": task_id
            }
            
            search_result = await tavily_agent.process_task(search_task)
            self.tavily_search_performed = True  # Mark search as performed to prevent infinite loops
            print(f"Step 3 completed with success: {search_result.get('success')}")
            
            # Extract search data
            search_data = search_result.get("result", {})
            print(f"Search data extracted: {search_data}")
            
            # Step 4: Compile final travel plan with all information
            print("\n--- Step 4: Compiling Final Travel Plan ---")
            final_travel_plan = {
                "team": self.name,
                "request": request_text,
                "plan": plan_data,
                "research": research_data,
                "current_info": search_data
            }
            
            print("Final travel plan compiled successfully")
            print(f"Final plan keys: {list(final_travel_plan.keys())}")
            
            # Create a more structured response that the frontend can easily parse
            formatted_response = {
                "team": self.name,
                "request": request_text,
                "plan": {
                    "destinations": plan_data.get("destinations", "Destinations will be determined based on your preferences"),
                    "itinerary": plan_data.get("itinerary", "Custom itinerary will be created for your trip"),
                    "travel_tips": plan_data.get("travel_tips", "Travel tips will be provided")
                },
                "research": {
                    "accommodation_info": research_data.get("accommodation_info", "Accommodation information will be provided"),
                    "transportation_info": research_data.get("transportation_info", "Transportation information will be provided"),
                    "local_insights": research_data.get("local_insights", "Local insights about your destination"),
                    "cultural_information": research_data.get("cultural_information", "Cultural information for your destination")
                },
                "current_info": search_data
            }
            
            print("Travel Planning Team completed processing request successfully")
            
            # Reset current task ID
            self.current_task_id = None
            
            return {
                "success": True,
                "result": formatted_response,
                "team": self.name,
                "timestamp": "2024-01-01T00:00:00Z"
            }
            
        except Exception as e:
            error_msg = f"Error processing request: {str(e)}"
            print(f"ERROR: {error_msg}")
            print(f"Traceback: {traceback.format_exc()}")
            # Reset current task ID on error
            self.current_task_id = None
            return {
                "success": False,
                "error": error_msg,
                "team": self.name
            }
    
    async def shutdown(self):
        """Shutdown the team"""
        # Stop all agents
        for agent in self.agents.values():
            try:
                await agent.stop()
            except Exception as e:
                print(f"Error stopping agent {agent.name}: {e}")
            
        # Disconnect agents from MCP server
        if self.team_orchestrator and self.team_orchestrator.mcp_server:
            for agent_id in self.agents:
                try:
                    await self.team_orchestrator.mcp_server.disconnect_agent(agent_id)
                except Exception as e:
                    print(f"Error disconnecting agent {agent_id}: {e}")
        
        self.is_active = False
        print(f"Team {self.name} shutdown completed")