"""
Blog Writing Agents for Microsoft Agent Framework
"""

from agent_framework.orchestrator import Agent
from typing import Dict, Any
from tools.langchain_tools import langchain_tools_manager

class SEOWriterAgent(Agent):
    """Agent specialized in SEO writing"""
    
    def __init__(self):
        super().__init__(
            agent_id="seo_writer",
            name="SEO Writer",
            capabilities=["SEO Optimization", "Keyword Research", "Content Structure", "Meta Tags"]
        )
    
    async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process SEO writing tasks"""
        try:
            request = task_data.get("request", "")
            team_domain = task_data.get("team_domain", "blog_writing")
            
            # Use LangChain tools for SEO research
            search_tool = langchain_tools_manager.get_tool("duckduckgo_search")
            research_result = "No search results available"
            if search_tool:
                try:
                    research_result = search_tool.invoke(f"SEO best practices for {request}")
                except Exception as e:
                    research_result = f"Search failed: {str(e)}"
            
            # Create SEO writing output
            seo_output = {
                "keyword_research": f"Keyword research for {request}",
                "content_structure": f"Content structure for {team_domain}",
                "meta_tags": f"Meta tags for {request}",
                "research_insights": research_result
            }
            
            return {
                "success": True,
                "agent": self.name,
                "result": seo_output,
                "status": "completed"
            }
        except Exception as e:
            return {
                "success": False,
                "agent": self.name,
                "error": str(e),
                "status": "failed"
            }

class TechnicalWriterAgent(Agent):
    """Agent specialized in technical writing"""
    
    def __init__(self):
        super().__init__(
            agent_id="technical_writer",
            name="Technical Writer",
            capabilities=["Technical Documentation", "Complex Concepts", "Clarity", "Accuracy"]
        )
    
    async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process technical writing tasks"""
        try:
            request = task_data.get("request", "")
            
            # Create technical writing output
            technical_output = {
                "technical_explanation": f"Technical explanation for {request}",
                "documentation_structure": f"Documentation structure for {request}",
                "clarity_improvements": f"Clarity improvements for {request}"
            }
            
            return {
                "success": True,
                "agent": self.name,
                "result": technical_output,
                "status": "completed"
            }
        except Exception as e:
            return {
                "success": False,
                "agent": self.name,
                "error": str(e),
                "status": "failed"
            }

class StorytellerAgent(Agent):
    """Agent specialized in storytelling"""
    
    def __init__(self):
        super().__init__(
            agent_id="storyteller",
            name="Storyteller",
            capabilities=["Narrative Writing", "Engagement", "Emotional Connection", "Brand Storytelling"]
        )
    
    async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process storytelling tasks"""
        try:
            request = task_data.get("request", "")
            
            # Create storytelling output
            story_output = {
                "narrative_structure": f"Narrative structure for {request}",
                "emotional_hooks": f"Emotional hooks for {request}",
                "brand_storytelling": f"Brand storytelling approach for {request}"
            }
            
            return {
                "success": True,
                "agent": self.name,
                "result": story_output,
                "status": "completed"
            }
        except Exception as e:
            return {
                "success": False,
                "agent": self.name,
                "error": str(e),
                "status": "failed"
            }

class ContentPlannerAgent(Agent):
    """Agent specialized in content planning"""
    
    def __init__(self):
        super().__init__(
            agent_id="content_planner",
            name="Content Planner",
            capabilities=["Content Calendar", "Topic Research", "Audience Alignment", "Content Series"]
        )
    
    async def process_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process content planning tasks"""
        try:
            request = task_data.get("request", "")
            
            # Create content planning output
            planning_output = {
                "content_calendar": f"Content calendar for {request}",
                "topic_research": f"Topic research for {request}",
                "series_planning": f"Content series planning for {request}"
            }
            
            return {
                "success": True,
                "agent": self.name,
                "result": planning_output,
                "status": "completed"
            }
        except Exception as e:
            return {
                "success": False,
                "agent": self.name,
                "error": str(e),
                "status": "failed"
            }