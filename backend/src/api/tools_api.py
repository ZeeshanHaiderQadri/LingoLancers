"""
API endpoints for managing LangChain tools
"""

from fastapi import APIRouter, HTTPException
from typing import List
from models.team_model import TeamInfo
from tools.langchain_tools import langchain_tools_manager

router = APIRouter()

# Mock data for tools (existing tools)
TOOLS = [
    {
        "id": "tavily_search",
        "name": "Tavily Search",
        "category": "Search",
        "description": "Advanced AI-powered search engine for comprehensive web research",
        "api_required": True,
        "installed": True,
        "configured": True,
        "capabilities": ["web_search", "research", "information_retrieval"]
    },
    {
        "id": "file_processor",
        "name": "File Processor",
        "category": "Utilities",
        "description": "Process and analyze various file formats including PDF, DOCX, and TXT",
        "api_required": False,
        "installed": True,
        "configured": True,
        "capabilities": ["file_parsing", "text_extraction", "document_analysis"]
    },
    {
        "id": "web_scraper",
        "name": "Web Scraper",
        "category": "Data",
        "description": "Extract structured data from websites and web pages",
        "api_required": False,
        "installed": False,
        "configured": False,
        "capabilities": ["data_extraction", "web_scraping", "structured_data"]
    },
    {
        "id": "code_analyzer",
        "name": "Code Analyzer",
        "category": "Development",
        "description": "Analyze and review code for best practices and potential issues",
        "api_required": False,
        "installed": True,
        "configured": True,
        "capabilities": ["code_review", "static_analysis", "best_practices"]
    }
]

@router.get("/tools")
async def get_tools():
    """Get all available tools including LangChain tools"""
    # Get existing tools
    all_tools = TOOLS.copy()
    
    # Add LangChain tools if initialized
    if langchain_tools_manager.initialized:
        langchain_tools = langchain_tools_manager.get_all_tools()
        for tool_name, tool_obj in langchain_tools.items():
            all_tools.append({
                "id": f"langchain_{tool_name}",
                "name": f"LangChain {tool_name.replace('_', ' ').title()}",
                "category": "LangChain Tools",
                "description": tool_obj.__doc__ or "LangChain tool integration",
                "api_required": False,
                "installed": True,
                "configured": True,
                "capabilities": [tool_name, "langchain_integration"]
            })
    
    return all_tools

@router.post("/tools/{tool_id}/install")
async def install_tool(tool_id: str):
    """Install a tool"""
    for tool in TOOLS:
        if tool["id"] == tool_id:
            tool["installed"] = True
            return {"success": True, "message": f"Tool {tool['name']} installed successfully"}
    
    # Check if it's a LangChain tool
    if tool_id.startswith("langchain_"):
        return {"success": True, "message": f"LangChain tool {tool_id} is already available"}
    
    raise HTTPException(status_code=404, detail="Tool not found")

@router.post("/tools/{tool_id}/uninstall")
async def uninstall_tool(tool_id: str):
    """Uninstall a tool"""
    for tool in TOOLS:
        if tool["id"] == tool_id:
            tool["installed"] = False
            tool["configured"] = False
            return {"success": True, "message": f"Tool {tool['name']} uninstalled successfully"}
    
    # Check if it's a LangChain tool
    if tool_id.startswith("langchain_"):
        return {"success": True, "message": f"Cannot uninstall core LangChain tool {tool_id}"}
    
    raise HTTPException(status_code=404, detail="Tool not found")