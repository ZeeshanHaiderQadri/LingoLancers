"""
API endpoints for managing Model Context Protocol (MCP) servers
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import os

router = APIRouter()

class ServerConfigRequest(BaseModel):
    server_id: str
    config: Dict[str, str]

class ServerConfigResponse(BaseModel):
    success: bool
    message: str

# Mock data for MCP servers
MCP_SERVERS = [
    {
        "id": "github_mcp",
        "name": "GitHub MCP Server",
        "category": "Development",
        "endpoint": "https://api.github.com/mcp",
        "api_key_required": True,
        "auth_fields": ["github_token"],
        "description": "Access and manage GitHub repositories through MCP protocol",
        "capabilities": ["repo_access", "code_review", "issue_management"],
        "installed": True,
        "configured": False
    },
    {
        "id": "jira_mcp",
        "name": "Jira MCP Server",
        "category": "Productivity",
        "endpoint": "https://your-domain.atlassian.net/mcp",
        "api_key_required": True,
        "auth_fields": ["jira_email", "jira_api_token"],
        "description": "Integrate with Jira for project management and issue tracking",
        "capabilities": ["issue_tracking", "project_management", "sprint_planning"],
        "installed": False,
        "configured": False
    },
    {
        "id": "slack_mcp",
        "name": "Slack MCP Server",
        "category": "Communication",
        "endpoint": "https://slack.com/api/mcp",
        "api_key_required": True,
        "auth_fields": ["slack_bot_token"],
        "description": "Connect with Slack for team communication and notifications",
        "capabilities": ["messaging", "notifications", "channel_management"],
        "installed": True,
        "configured": True
    },
    {
        "id": "notion_mcp",
        "name": "Notion MCP Server",
        "category": "Productivity",
        "endpoint": "https://api.notion.com/mcp",
        "api_key_required": True,
        "auth_fields": ["notion_token"],
        "description": "Access and manage Notion workspaces through MCP protocol",
        "capabilities": ["database_access", "page_management", "content_creation"],
        "installed": False,
        "configured": False
    }
]

@router.get("/mcp-servers")
async def get_mcp_servers():
    """Get all available MCP servers"""
    return MCP_SERVERS

@router.post("/mcp-servers/configure")
async def configure_mcp_server(config: ServerConfigRequest):
    """Configure an MCP server with authentication credentials"""
    for server in MCP_SERVERS:
        if server["id"] == config.server_id:
            # In a real implementation, you would validate and store the credentials securely
            # For now, we'll just mark the server as configured
            server["configured"] = True
            
            # Store credentials (in a real app, use secure storage like environment variables or a database)
            for key, value in config.config.items():
                # Mask sensitive data in logs
                masked_value = value[:4] + "*" * (len(value) - 8) + value[-4:] if len(value) > 8 else "*" * len(value)
                print(f"Configuring {key}: {masked_value}")
            
            return ServerConfigResponse(
                success=True,
                message=f"Server {server['name']} configured successfully"
            )
    
    raise HTTPException(status_code=404, detail="MCP server not found")

@router.post("/mcp-servers/{server_id}/install")
async def install_mcp_server(server_id: str):
    """Install an MCP server"""
    for server in MCP_SERVERS:
        if server["id"] == server_id:
            server["installed"] = True
            return {"success": True, "message": f"MCP Server {server['name']} installed successfully"}
    
    raise HTTPException(status_code=404, detail="MCP server not found")

@router.post("/mcp-servers/{server_id}/uninstall")
async def uninstall_mcp_server(server_id: str):
    """Uninstall an MCP server"""
    for server in MCP_SERVERS:
        if server["id"] == server_id:
            server["installed"] = False
            server["configured"] = False
            return {"success": True, "message": f"MCP Server {server['name']} uninstalled successfully"}
    
    raise HTTPException(status_code=404, detail="MCP server not found")