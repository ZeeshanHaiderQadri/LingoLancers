"""
MAF Workflow Bridge for Lingo Agent
Connects conversational agent to actual workflow execution
"""

import logging
from typing import Dict, Any, Optional
import asyncio

logger = logging.getLogger(__name__)

class MAFWorkflowBridge:
    """Bridge between Lingo Agent and MAF workflows"""
    
    def __init__(self):
        self.active_workflows = {}
        
    async def start_workflow(self, workflow_type: str, data: Dict[str, Any]) -> Optional[str]:
        """Start a real MAF workflow"""
        
        try:
            # Import MAF components
            from maf_core.orchestrator import get_master_orchestrator
            from api.tasks_api import create_task
            
            logger.info(f"🚀 Starting MAF workflow: {workflow_type}")
            
            # Map workflow types to MAF requests
            workflow_mapping = {
                "travel": "Plan a trip",
                "travel_planning": "Plan a trip", 
                "blog": "Write a blog article",
                "blog_writing": "Write a blog article",
                "ai_image": "Generate an AI image"
            }
            
            request_text = workflow_mapping.get(workflow_type, f"Execute {workflow_type} workflow")
            
            # Add data context to request
            if data:
                if workflow_type in ["travel", "travel_planning"] and data.get("destination"):
                    request_text = f"Plan a trip to {data['destination']}"
                elif workflow_type in ["blog", "blog_writing"] and data.get("topic"):
                    request_text = f"Write a blog article about {data['topic']}"
                elif workflow_type == "ai_image" and data.get("prompt"):
                    request_text = f"Generate an AI image: {data['prompt']}"
            
            # Create MAF task
            task_request = {
                "user_id": "lingo_user",
                "request": request_text,
                "priority": "normal"
            }
            
            task_response = await create_task(task_request)
            
            if task_response and task_response.get('task_id'):
                task_id = task_response['task_id']
                self.active_workflows[task_id] = {
                    "type": workflow_type,
                    "data": data,
                    "started_at": asyncio.get_event_loop().time()
                }
                logger.info(f"✅ MAF workflow started: {task_id}")
                return task_id
            else:
                logger.error("❌ Failed to create MAF task")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error starting MAF workflow: {e}")
            return None
    
    async def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a running workflow"""
        
        try:
            from api.tasks_api import get_task_status
            
            status = await get_task_status(workflow_id)
            return status
            
        except Exception as e:
            logger.error(f"❌ Error getting workflow status: {e}")
            return None

# Global bridge instance
_workflow_bridge = None

def get_workflow_bridge() -> MAFWorkflowBridge:
    """Get the global workflow bridge instance"""
    global _workflow_bridge
    if _workflow_bridge is None:
        _workflow_bridge = MAFWorkflowBridge()
    return _workflow_bridge
