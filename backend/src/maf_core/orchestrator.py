"""
Microsoft Agent Framework - Orchestrator Implementation
Central coordination system for managing agents and workflows
"""

import asyncio
import json
import uuid
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
import logging

from .agents import BaseAgent, AgentMessage, AgentContext
from .workflows import BaseWorkflow, WorkflowFactory, WorkflowState

logger = logging.getLogger(__name__)

@dataclass
class TeamConfiguration:
    """Configuration for a team of agents"""
    team_id: str
    name: str
    description: str
    agents: List[Dict[str, Any]] = field(default_factory=list)
    workflow_type: str = "sequential"  # sequential, concurrent, conditional
    tools: List[str] = field(default_factory=list)

class TeamOrchestrator:
    """
    Team orchestrator following Microsoft Agent Framework patterns
    Manages a group of agents working together on tasks
    """
    
    def __init__(self, config: TeamConfiguration):
        self.config = config
        self.team_id = config.team_id
        self.name = config.name
        self.agents: Dict[str, BaseAgent] = {}
        self.workflow: Optional[BaseWorkflow] = None
        self.is_active = False
        self.context: Optional[AgentContext] = None
        self.message_queue: List[AgentMessage] = []
        
        logger.info(f"Team orchestrator {self.name} initialized")
    
    async def initialize(self) -> bool:
        """Initialize the team orchestrator"""
        try:
            # Create workflow based on configuration
            self.workflow = WorkflowFactory.create_sequential_workflow(
                workflow_id=f"{self.team_id}_workflow",
                name=f"{self.name} Workflow",
                description=f"Workflow for {self.name} team"
            )
            
            # Initialize context
            self.context = AgentContext(
                conversation_id=str(uuid.uuid4()),
                tools=self.config.tools
            )
            
            self.is_active = True
            logger.info(f"Team orchestrator {self.name} initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize team orchestrator {self.name}: {e}")
            return False
    
    async def add_agent(self, agent: BaseAgent) -> bool:
        """Add an agent to the team"""
        try:
            # Start the agent
            if await agent.start(self.context):
                self.agents[agent.agent_id] = agent
                
                # Add agent to workflow
                if self.workflow:
                    self.workflow.add_agent(agent)
                
                logger.info(f"Added agent {agent.name} to team {self.name}")
                return True
            else:
                logger.error(f"Failed to start agent {agent.name}")
                return False
                
        except Exception as e:
            logger.error(f"Error adding agent {agent.name} to team {self.name}: {e}")
            return False
    
    async def process_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a request using the team's workflow"""
        if not self.is_active or not self.workflow:
            return {
                "success": False,
                "error": "Team orchestrator not active or workflow not initialized"
            }
        
        try:
            logger.info(f"Team {self.name} processing request: {request_data.get('request', 'Unknown')}")
            
            # Execute workflow
            result = await self.workflow.execute(request_data)
            
            logger.info(f"Team {self.name} completed request processing")
            return {
                "success": True,
                "team": self.name,
                "team_id": self.team_id,
                "result": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing request in team {self.name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "team": self.name,
                "team_id": self.team_id
            }
    
    async def send_message_to_agent(
        self,
        agent_id: str,
        content: Dict[str, Any],
        message_type: str = "task"
    ) -> Optional[AgentMessage]:
        """Send a message to a specific agent"""
        if agent_id not in self.agents:
            logger.error(f"Agent {agent_id} not found in team {self.name}")
            return None
        
        agent = self.agents[agent_id]
        message = AgentMessage(
            sender_id="team_orchestrator",
            recipient_id=agent_id,
            content=content,
            message_type=message_type
        )
        
        try:
            response = await agent.handle_message(message)
            logger.info(f"Sent message to agent {agent.name} in team {self.name}")
            return response
        except Exception as e:
            logger.error(f"Error sending message to agent {agent.name}: {e}")
            return None
    
    async def broadcast_message(
        self,
        content: Dict[str, Any],
        message_type: str = "broadcast"
    ) -> List[AgentMessage]:
        """Broadcast a message to all agents in the team"""
        responses = []
        
        for agent_id, agent in self.agents.items():
            response = await self.send_message_to_agent(agent_id, content, message_type)
            if response:
                responses.append(response)
        
        logger.info(f"Broadcasted message to {len(responses)} agents in team {self.name}")
        return responses
    
    async def get_team_status(self) -> Dict[str, Any]:
        """Get the current status of the team"""
        agent_statuses = {}
        for agent_id, agent in self.agents.items():
            agent_statuses[agent_id] = {
                "name": agent.name,
                "is_active": agent.is_active,
                "capabilities": agent.capabilities,
                "tools": agent.tools
            }
        
        workflow_status = None
        if self.workflow:
            workflow_status = {
                "workflow_id": self.workflow.workflow_id,
                "state": self.workflow.state.value,
                "steps_completed": len([
                    step for step in self.workflow.steps.values()
                    if step.status == WorkflowState.COMPLETED
                ]),
                "total_steps": len(self.workflow.steps)
            }
        
        return {
            "team_id": self.team_id,
            "name": self.name,
            "is_active": self.is_active,
            "agent_count": len(self.agents),
            "agents": agent_statuses,
            "workflow": workflow_status
        }
    
    async def shutdown(self) -> None:
        """Shutdown the team orchestrator and all agents"""
        logger.info(f"Shutting down team orchestrator {self.name}")
        
        # Stop all agents
        for agent in self.agents.values():
            await agent.stop()
        
        self.is_active = False
        logger.info(f"Team orchestrator {self.name} shutdown completed")

class MasterOrchestrator:
    """
    Master orchestrator for managing multiple teams
    Central coordination point for the entire agent system
    """
    
    def __init__(self):
        self.teams: Dict[str, TeamOrchestrator] = {}
        self.global_context: Optional[AgentContext] = None
        self.is_active = False
        self.message_router: Dict[str, Callable] = {}
        
        logger.info("Master orchestrator initialized")
    
    async def initialize(self) -> bool:
        """Initialize the master orchestrator"""
        try:
            # Initialize global context
            self.global_context = AgentContext(
                conversation_id=str(uuid.uuid4()),
                session_data={"orchestrator_id": "master"}
            )
            
            self.is_active = True
            logger.info("Master orchestrator initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize master orchestrator: {e}")
            return False
    
    async def create_team(self, config: TeamConfiguration) -> Optional[TeamOrchestrator]:
        """Create and initialize a new team"""
        try:
            team = TeamOrchestrator(config)
            
            if await team.initialize():
                self.teams[config.team_id] = team
                logger.info(f"Created team {config.name} with ID {config.team_id}")
                return team
            else:
                logger.error(f"Failed to initialize team {config.name}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating team {config.name}: {e}")
            return None
    
    async def get_team(self, team_id: str) -> Optional[TeamOrchestrator]:
        """Get a team by ID"""
        return self.teams.get(team_id)
    
    async def process_team_request(
        self,
        team_id: str,
        request_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process a request for a specific team"""
        if not self.is_active:
            return {
                "success": False,
                "error": "Master orchestrator not active"
            }
        
        team = self.teams.get(team_id)
        if not team:
            return {
                "success": False,
                "error": f"Team {team_id} not found"
            }
        
        return await team.process_request(request_data)
    
    async def route_message(
        self,
        from_team_id: str,
        to_team_id: str,
        message: AgentMessage
    ) -> bool:
        """Route a message between teams"""
        from_team = self.teams.get(from_team_id)
        to_team = self.teams.get(to_team_id)
        
        if not from_team or not to_team:
            logger.error(f"Invalid team IDs for message routing: {from_team_id} -> {to_team_id}")
            return False
        
        try:
            # Route message to target team
            await to_team.broadcast_message(
                content=message.content,
                message_type="inter_team_message"
            )
            
            logger.info(f"Routed message from team {from_team_id} to team {to_team_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error routing message between teams: {e}")
            return False
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get the status of the entire system"""
        team_statuses = {}
        
        for team_id, team in self.teams.items():
            team_statuses[team_id] = await team.get_team_status()
        
        return {
            "orchestrator_active": self.is_active,
            "total_teams": len(self.teams),
            "teams": team_statuses,
            "global_context": {
                "conversation_id": self.global_context.conversation_id if self.global_context else None,
                "session_data": self.global_context.session_data if self.global_context else {}
            }
        }
    
    async def shutdown(self) -> None:
        """Shutdown the master orchestrator and all teams"""
        logger.info("Shutting down master orchestrator")
        
        # Shutdown all teams
        for team in self.teams.values():
            await team.shutdown()
        
        self.is_active = False
        logger.info("Master orchestrator shutdown completed")

# Global orchestrator instance
_master_orchestrator: Optional[MasterOrchestrator] = None

async def get_master_orchestrator() -> Optional[MasterOrchestrator]:
    """Get the global master orchestrator instance"""
    global _master_orchestrator
    
    if _master_orchestrator is None:
        _master_orchestrator = MasterOrchestrator()
        await _master_orchestrator.initialize()
    
    return _master_orchestrator

async def initialize_master_orchestrator() -> bool:
    """Initialize the global master orchestrator"""
    global _master_orchestrator
    
    try:
        _master_orchestrator = MasterOrchestrator()
        success = await _master_orchestrator.initialize()
        
        if success:
            logger.info("Global master orchestrator initialized successfully")
        else:
            logger.error("Failed to initialize global master orchestrator")
        
        return success
        
    except Exception as e:
        logger.error(f"Error initializing global master orchestrator: {e}")
        return False