"""
Model Context Protocol (MCP) Server Implementation
"""

from typing import Dict, Any, List, Optional
import asyncio
import json

class MCPServer:
    """Model Context Protocol server for agent communication"""
    
    def __init__(self, server_id: str, name: str, description: str):
        self.server_id = server_id
        self.name = name
        self.description = description
        self.is_active = False
        self.connected_agents: Dict[str, Any] = {}
        self.message_queue: List[Dict[str, Any]] = []
    
    async def start(self) -> bool:
        """Start the MCP server"""
        try:
            self.is_active = True
            print(f"MCP Server {self.name} started")
            return True
        except Exception as e:
            print(f"Error starting MCP server {self.name}: {e}")
            return False
    
    async def stop(self):
        """Stop the MCP server"""
        self.is_active = False
        # Disconnect all agents
        for agent_id in list(self.connected_agents.keys()):
            await self.disconnect_agent(agent_id)
        print(f"MCP Server {self.name} stopped")
    
    async def connect_agent(self, agent_id: str, agent_info: Dict[str, Any]) -> bool:
        """Connect an agent to the MCP server"""
        if not self.is_active:
            return False
        
        try:
            self.connected_agents[agent_id] = {
                "info": agent_info,
                "connected_at": asyncio.get_event_loop().time(),
                "last_heartbeat": asyncio.get_event_loop().time()
            }
            
            print(f"Agent {agent_id} connected to MCP server {self.name}")
            return True
        except Exception as e:
            print(f"Error connecting agent {agent_id} to MCP server {self.name}: {e}")
            return False
    
    async def disconnect_agent(self, agent_id: str):
        """Disconnect an agent from the MCP server"""
        if agent_id in self.connected_agents:
            del self.connected_agents[agent_id]
            print(f"Agent {agent_id} disconnected from MCP server {self.name}")
    
    async def send_message(self, from_agent: str, to_agent: str, message: Dict[str, Any]) -> bool:
        """Send a message between agents via the MCP server"""
        if not self.is_active:
            return False
        
        # Verify both agents are connected
        if from_agent not in self.connected_agents or to_agent not in self.connected_agents:
            print(f"Error: One or both agents not connected to MCP server")
            return False
        
        # Create message envelope
        message_envelope = {
            "message_id": f"msg_{len(self.message_queue) + 1}",
            "from": from_agent,
            "to": to_agent,
            "content": message,
            "timestamp": asyncio.get_event_loop().time(),
            "server": self.server_id
        }
        
        # Add to message queue
        self.message_queue.append(message_envelope)
        
        print(f"Message sent from {from_agent} to {to_agent} via MCP server {self.name}")
        return True
    
    async def get_messages_for_agent(self, agent_id: str) -> List[Dict[str, Any]]:
        """Get messages for a specific agent"""
        if not self.is_active:
            return []
        
        # Filter messages for this agent
        agent_messages = [msg for msg in self.message_queue if msg["to"] == agent_id]
        
        # Remove delivered messages (in a real implementation, you might want to mark as delivered instead)
        self.message_queue = [msg for msg in self.message_queue if msg["to"] != agent_id]
        
        return agent_messages
    
    def get_server_info(self) -> Dict[str, Any]:
        """Get information about the MCP server"""
        return {
            "server_id": self.server_id,
            "name": self.name,
            "description": self.description,
            "is_active": self.is_active,
            "connected_agents": len(self.connected_agents),
            "pending_messages": len(self.message_queue)
        }

class GitHubMCPServer(MCPServer):
    """Specialized MCP server for GitHub integration"""
    
    def __init__(self):
        super().__init__(
            server_id="github_mcp",
            name="GitHub MCP Server",
            description="MCP server for GitHub repository access and management"
        )
        self.github_token: Optional[str] = None
    
    async def configure(self, config: Dict[str, str]) -> bool:
        """Configure the GitHub MCP server with authentication"""
        try:
            self.github_token = config.get("github_token")
            if not self.github_token:
                print("Error: GitHub token not provided")
                return False
            
            # In a real implementation, you would validate the token here
            print(f"GitHub MCP server configured with token")
            return True
        except Exception as e:
            print(f"Error configuring GitHub MCP server: {e}")
            return False

class SlackMCPServer(MCPServer):
    """Specialized MCP server for Slack integration"""
    
    def __init__(self):
        super().__init__(
            server_id="slack_mcp",
            name="Slack MCP Server",
            description="MCP server for Slack messaging and notifications"
        )
        self.slack_token: Optional[str] = None
    
    async def configure(self, config: Dict[str, str]) -> bool:
        """Configure the Slack MCP server with authentication"""
        try:
            self.slack_token = config.get("slack_bot_token")
            if not self.slack_token:
                print("Error: Slack bot token not provided")
                return False
            
            # In a real implementation, you would validate the token here
            print(f"Slack MCP server configured with bot token")
            return True
        except Exception as e:
            print(f"Error configuring Slack MCP server: {e}")
            return False

# Example usage
if __name__ == "__main__":
    # This would be used in a real implementation
    async def main():
        server = MCPServer("test_server", "Test MCP Server", "Test server for demonstration")
        await server.start()
        
        # Connect agents
        await server.connect_agent("agent_1", {"name": "Agent 1", "capabilities": ["search"]})
        await server.connect_agent("agent_2", {"name": "Agent 2", "capabilities": ["design"]})
        
        # Send message
        message = {"type": "task", "content": "Please search for UI design trends"}
        await server.send_message("agent_1", "agent_2", message)
        
        # Get messages
        messages = await server.get_messages_for_agent("agent_2")
        print(f"Agent 2 received {len(messages)} messages")
        
        await server.stop()
    
    # asyncio.run(main())