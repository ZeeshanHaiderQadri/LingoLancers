"""
Microsoft Agent Framework Orchestrator for Lancers Teams
"""

from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
import asyncio
import json
import uuid
from mcp_local.mcp_server import MCPServer
from tools.langchain_tools import langchain_tools_manager

class Agent(ABC):
    """Base Agent class for Microsoft Agent Framework"""
    
    def __init__(self, agent_id: str, name: str, capabilities: List[str]):
        self.agent_id = agent_id
        self.name = name
        self.capabilities = capabilities
        self.is_active = False
        self.mcp_server: Optional[MCPServer] = None
    
    async def start(self) -> bool:
        """Start the agent"""
        try:
            self.is_active = True
            print(f"Agent {self.name} ({self.agent_id}) started")
            return True
        except Exception as e:
            print(f"Error starting agent {self.name}: {e}")
            return False
    
    async def stop(self):
        """Stop the agent"""
        self.is_active = False
        print(f"Agent {self.name} ({self.agent_id}) stopped")
    
    @abstractmethod
    async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a task - to be implemented by subclasses"""
        pass
    
    async def send_message(self, to_agent_id: str, message: Dict[str, Any]) -> bool:
        """Send a message to another agent via MCP server"""
        if self.mcp_server and self.is_active:
            return await self.mcp_server.send_message(self.agent_id, to_agent_id, message)
        return False
    
    async def receive_messages(self) -> List[Dict[str, Any]]:
        """Receive messages from MCP server"""
        if self.mcp_server and self.is_active:
            return await self.mcp_server.get_messages_for_agent(self.agent_id)
        return []

class TeamOrchestrator:
    """Orchestrator for coordinating agents within a team using Microsoft Agent Framework"""
    
    def __init__(self, team_id: str, team_name: str):
        self.team_id = team_id
        self.team_name = team_name
        self.agents: Dict[str, Agent] = {}
        self.mcp_server: Optional[MCPServer] = None
        self.is_active = False
        self.task_queue: List[Dict[str, Any]] = []
        self.current_task_id = None  # Track current task ID
    
    async def initialize(self, mcp_server: MCPServer) -> bool:
        """Initialize the team orchestrator with MCP server"""
        try:
            self.mcp_server = mcp_server
            self.is_active = True
            
            # Connect team to MCP server
            team_info = {
                "team_id": self.team_id,
                "team_name": self.team_name,
                "type": "team_orchestrator"
            }
            await self.mcp_server.connect_agent(f"team_{self.team_id}", team_info)
            
            print(f"Team orchestrator {self.team_name} initialized with MCP server")
            return True
        except Exception as e:
            print(f"Error initializing team orchestrator {self.team_name}: {e}")
            return False
    
    async def add_agent(self, agent: Agent) -> bool:
        """Add an agent to the team"""
        if not self.is_active:
            return False
        
        try:
            # Start the agent
            if await agent.start():
                # Connect agent to MCP server
                if self.mcp_server:
                    agent.mcp_server = self.mcp_server
                    agent_info = {
                        "agent_id": agent.agent_id,
                        "name": agent.name,
                        "capabilities": agent.capabilities,
                        "team_id": self.team_id
                    }
                    await self.mcp_server.connect_agent(agent.agent_id, agent_info)
                
                # Add to agents dictionary
                self.agents[agent.agent_id] = agent
                print(f"Agent {agent.name} added to team {self.team_name}")
                return True
            else:
                print(f"Failed to start agent {agent.name}")
                return False
        except Exception as e:
            print(f"Error adding agent {agent.name} to team {self.team_name}: {e}")
            return False
    
    async def coordinate_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate task execution among team agents with proper sequential workflow"""
        if not self.is_active:
            return {"success": False, "error": "Team orchestrator not active"}
        
        # Generate a unique task ID for this coordination task
        task_id = str(uuid.uuid4())
        self.current_task_id = task_id
        task_data["task_id"] = task_id
        
        try:
            print(f"Team {self.team_name} coordinating task: {task_data.get('request', 'Unknown')}")
            
            # Sequential workflow implementation according to Microsoft Agent Framework
            results = {}
            
            # Process agents in a specific order based on their capabilities
            # This ensures proper sequential workflow
            agent_order = ["travel_specialist", "research_assistant", "tavily_search"]
            
            for agent_id in agent_order:
                if agent_id in self.agents:
                    agent = self.agents[agent_id]
                    try:
                        print(f"Calling agent {agent.name}...")
                        agent_result = await agent.process_task(task_data)
                        results[agent_id] = agent_result
                        print(f"Agent {agent.name} completed task with result: {agent_result.get('status', 'unknown')}")
                        
                        # If an agent fails, we might want to stop the workflow or continue with defaults
                        if not agent_result.get("success", False):
                            print(f"Warning: Agent {agent.name} failed, continuing with defaults...")
                    except Exception as e:
                        print(f"Error processing task with agent {agent.name}: {e}")
                        results[agent_id] = {"success": False, "error": str(e)}
                else:
                    print(f"Agent {agent_id} not available in team")
            
            # Reset current task ID
            self.current_task_id = None
            
            return {
                "success": True,
                "team": self.team_name,
                "results": results,
                "coordinated_at": "2024-01-01T00:00:00Z"
            }
        except Exception as e:
            # Reset current task ID on error
            self.current_task_id = None
            return {
                "success": False,
                "error": f"Error coordinating task: {str(e)}",
                "team": self.team_name
            }
    
    async def shutdown(self):
        """Shutdown the team orchestrator and all agents"""
        # Stop all agents
        for agent_id, agent in self.agents.items():
            await agent.stop()
        
        # Disconnect team from MCP server
        if self.mcp_server:
            await self.mcp_server.disconnect_agent(f"team_{self.team_id}")
        
        self.is_active = False
        print(f"Team orchestrator {self.team_name} shutdown completed")

class LancersTeamsOrchestrator:
    """Main orchestrator for all Lancers Teams using Microsoft Agent Framework"""
    
    def __init__(self):
        self.teams: Dict[str, TeamOrchestrator] = {}
        self.mcp_servers: Dict[str, MCPServer] = {}
        self.is_active = False
    
    async def initialize(self) -> bool:
        """Initialize the main orchestrator"""
        try:
            # Initialize MCP servers for different integrations
            github_mcp = MCPServer("github_mcp", "GitHub MCP Server", "MCP server for GitHub integration")
            await github_mcp.start()
            self.mcp_servers["github"] = github_mcp
            
            slack_mcp = MCPServer("slack_mcp", "Slack MCP Server", "MCP server for Slack integration")
            await slack_mcp.start()
            self.mcp_servers["slack"] = slack_mcp
            
            # Initialize LangChain tools
            langchain_tools_manager.initialize()
            
            self.is_active = True
            print("Lancers Teams Orchestrator initialized with Microsoft Agent Framework")
            return True
        except Exception as e:
            print(f"Error initializing Lancers Teams Orchestrator: {e}")
            return False
    
    async def create_team(self, team_id: str, team_name: str, mcp_server_key: str = "github") -> Optional[TeamOrchestrator]:
        """Create a new team with orchestrator"""
        if not self.is_active:
            return None
        
        try:
            # Get MCP server
            mcp_server = self.mcp_servers.get(mcp_server_key)
            if not mcp_server:
                print(f"MCP server {mcp_server_key} not found")
                return None
            
            # Create team orchestrator
            team_orchestrator = TeamOrchestrator(team_id, team_name)
            if await team_orchestrator.initialize(mcp_server):
                self.teams[team_id] = team_orchestrator
                print(f"Team {team_name} created and initialized")
                return team_orchestrator
            else:
                print(f"Failed to initialize team {team_name}")
                return None
        except Exception as e:
            print(f"Error creating team {team_name}: {e}")
            return None
    
    async def get_team(self, team_id: str) -> Optional[TeamOrchestrator]:
        """Get a team orchestrator by ID"""
        return self.teams.get(team_id)
    
    async def process_team_request(self, team_id: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a request for a specific team"""
        if not self.is_active:
            return {"success": False, "error": "Orchestrator not active"}
        
        team = self.teams.get(team_id)
        if not team:
            return {"success": False, "error": f"Team {team_id} not found"}
        
        return await team.coordinate_task(request_data)
    
    async def shutdown(self):
        """Shutdown the orchestrator and all teams"""
        # Shutdown all teams
        for team_id, team in self.teams.items():
            await team.shutdown()
        
        # Shutdown MCP servers
        for mcp_server in self.mcp_servers.values():
            await mcp_server.stop()
        
        self.is_active = False
        print("Lancers Teams Orchestrator shutdown completed")

# Global orchestrator instance
lancers_orchestrator: Optional[LancersTeamsOrchestrator] = None

async def initialize_orchestrator():
    """Initialize the global orchestrator"""
    global lancers_orchestrator
    lancers_orchestrator = LancersTeamsOrchestrator()
    success = await lancers_orchestrator.initialize()
    return success

async def get_orchestrator() -> Optional[LancersTeamsOrchestrator]:
    """Get the global orchestrator instance"""
    return lancers_orchestrator