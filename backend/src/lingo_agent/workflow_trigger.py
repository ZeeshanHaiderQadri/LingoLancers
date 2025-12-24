"""
Workflow Trigger System for Starting Workflows with Collected Data
"""

import httpx
import logging
import os
from typing import Dict, Any, Optional
from .conversation_state import ConversationState, ConversationPhase

logger = logging.getLogger(__name__)


class WorkflowTrigger:
    """Handles triggering workflows with collected conversation data"""
    
    def __init__(self):
        # Use PORT from environment, default to 8000
        port = os.getenv('PORT', '8000')
        self.base_url = f"http://localhost:{port}"
        logger.info(f"🔧 WorkflowTrigger initialized with base_url: {self.base_url}")
    
    async def trigger_blog_workflow(self, state: ConversationState) -> Dict[str, Any]:
        """Trigger blog writing workflow"""
        
        try:
            # Prepare blog request data
            keywords = state.collected_data.get("keywords", [])
            if isinstance(keywords, str):
                keywords = [k.strip() for k in keywords.split(",") if k.strip()]
            
            blog_data = {
                "topic": state.collected_data.get("topic", ""),
                "reference_urls": [],
                "target_word_count": int(state.collected_data.get("length", 1500)),
                "tone": state.collected_data.get("tone", "professional"),
                "additional_instructions": "",
                "seo_keywords": keywords
            }
            
            logger.info(f"🚀 Starting blog workflow with data: {blog_data}")
            logger.info(f"📍 Calling API: {self.base_url}/api/blog/create")
            
            # Call Blog Team API
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/blog/create",
                    json=blog_data,
                    timeout=30.0
                )
                
                # Accept both 200 OK and 202 Accepted
                if response.status_code in [200, 202]:
                    result = response.json()
                    state.workflow_id = result.get("workflow_id")
                    state.phase = ConversationPhase.EXECUTING
                    
                    return {
                        "success": True,
                        "workflow_id": state.workflow_id,
                        "message": "Blog workflow started successfully!",
                        "data": result,
                        # DON'T navigate - let split-screen handle it
                        "navigate_to": None,
                        "auto_redirect": False
                    }
                else:
                    error_detail = response.text
                    logger.error(f"Blog API error: {response.status_code} - {error_detail}")
                    
                    # Try to parse error message
                    try:
                        error_json = response.json()
                        error_msg = error_json.get("detail", error_detail)
                    except:
                        error_msg = error_detail
                    
                    return {
                        "success": False,
                        "error": f"Failed to start blog workflow: {response.status_code}",
                        "message": f"Sorry, I couldn't start the blog workflow: {error_msg}. Please try using the Blog Writing Team dashboard.",
                        "debug_info": {
                            "status_code": response.status_code,
                            "error": error_detail,
                            "blog_data": blog_data
                        }
                    }
        
        except Exception as e:
            logger.error(f"Error triggering blog workflow: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Sorry, I encountered an error starting the blog workflow. Please try using the Blog Writing Team dashboard."
            }
    
    def _extract_destination_from_history(self, conversation_history: list) -> Optional[str]:
        """Extract destination from conversation history as last resort"""
        import re
        
        # Look through recent messages for destination mentions
        for message in reversed(conversation_history[-10:]):  # Check last 10 messages
            if message.get("role") == "user":
                text = message.get("content", "")
                
                # More comprehensive patterns to match destinations (case-insensitive)
                patterns = [
                    r"(?:to|visit|going to|trip to|travel to|fly to|destination is|destination:)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)",
                    r"(?:plan|planning)\s+(?:a|an|the)?\s+(?:trip|travel|visit|journey).*?(?:to|for)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)",
                    r"(?:from\s+[A-Za-z]+(?:\s+[A-Za-z]+)?\s+to)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)",
                    r"(?:want to go to|would like to visit|interested in visiting)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)",
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, text, re.IGNORECASE)
                    if match:
                        destination = match.group(1).strip()
                        # Filter out common words that aren't destinations
                        common_non_destinations = [
                            'plan', 'trip', 'days', 'for', 'me', 'a', 'the', 'an', 
                            'to', 'in', 'on', 'at', 'by', 'of', 'up', 'as', 'so', 
                            'my', 'our', 'your', 'his', 'her', 'its', 'their', 
                            'this', 'that', 'these', 'those', 'here', 'there',
                            'somewhere', 'anywhere', 'everywhere', 'nowhere'
                        ]
                        if (destination.lower() not in common_non_destinations and 
                            len(destination) > 1 and
                            not destination.isdigit()):
                            # Capitalize properly
                            return destination.title()
        
        return None
    
    async def trigger_travel_workflow(self, state: ConversationState) -> Dict[str, Any]:
        """Trigger travel planning workflow"""
        
        try:
            # Extract destination from multiple possible sources
            logger.info(f"🔍 DEBUG: Extracting destination from collected_data: {state.collected_data}")
            
            # Look for destination in various fields
            destination_fields = ["destination", "to", "location", "place"]
            destination_from_data = None
            for field in destination_fields:
                value = state.collected_data.get(field)
                if value and value.strip() and value.lower() not in ['paris', 'undefined', 'null', 'none', '']:
                    destination_from_data = value.strip()
                    break
            
            destination_from_history = self._extract_destination_from_history(state.conversation_history)
            
            logger.info(f"🔍 DEBUG: destination sources - data: {destination_from_data}, history: {destination_from_history}")
            
            # Better extraction logic with prioritization
            destination = None
            
            # Priority 1: Explicit destination from collected data
            if destination_from_data:
                destination = destination_from_data
            # Priority 2: Extracted from conversation history
            elif destination_from_history and destination_from_history.strip() and destination_from_history.lower() not in ['paris', 'undefined', 'null', 'none', '']:
                destination = destination_from_history.strip()
            
            # Only fallback to Paris if absolutely necessary and we have some travel-related context
            if not destination:
                # Check if this is actually a travel request by looking for travel keywords
                travel_keywords = ['travel', 'trip', 'visit', 'fly', 'destination', 'vacation', 'holiday']
                has_travel_context = any(
                    keyword in str(state.collected_data).lower() or 
                    any(keyword in str(msg.get('content', '')).lower() for msg in state.conversation_history if msg.get('role') == 'user')
                    for keyword in travel_keywords
                )
                
                if has_travel_context:
                    destination = "Paris"  # Last resort fallback only for actual travel requests
                    logger.info("⚠️  No destination found, defaulting to Paris as fallback for travel request")
                else:
                    logger.info("⚠️  No travel context detected, not defaulting to Paris")
                    return {
                        "success": False,
                        "error": "No destination specified",
                        "message": "Please specify a destination for your travel plan."
                    }
            
            logger.info(f"🎯 DEBUG: Final destination selected: {destination}")
            
            # Extract departure location
            departure_fields = ["departure", "from", "origin"]
            departure = None
            for field in departure_fields:
                value = state.collected_data.get(field)
                if value and value.strip():
                    departure = value.strip()
                    break
            
            # Prepare travel request data
            travel_data = {
                "destination": destination,
                "departure": departure,
                "duration": f"{state.collected_data.get('duration', 7)} days",
                "budget": state.collected_data.get("budget", "$1500-$2500"),
                "preferences": state.collected_data.get("preferences", {}),
                "user_id": "default_user"
            }
            
            logger.info(f"🚀 Starting travel workflow with data: {travel_data}")
            logger.info(f"📊 Collected data: {state.collected_data}")
            logger.info(f"🎯 Extracted destination: {destination}")
            
            # Call existing Tasks API (same as Travel Dashboard uses)
            if departure:
                travel_request = f"Plan a trip from {departure} to {travel_data['destination']} for {travel_data['duration']} with a budget of {travel_data['budget']}"
            else:
                travel_request = f"Plan a trip to {travel_data['destination']} for {travel_data['duration']} with a budget of {travel_data['budget']}"
            
            task_data = {
                "request": f"[TEAM: travel_planning] {travel_request}",
                "user_id": travel_data.get('user_id', 'default_user'),
                "priority": "normal",
                "voice_input": None  # Changed from False to None (Optional[str])
            }
            
            logger.info(f"📍 Calling API: {self.base_url}/api/tasks with task_data: {task_data}")
            
            async with httpx.AsyncClient() as client:
                # Step 1: Create task
                response = await client.post(
                    f"{self.base_url}/api/tasks",
                    json=task_data,
                    timeout=30.0
                )
                
                if response.status_code in [200, 202]:
                    result = response.json()
                    task_id = result.get("task_id")
                    
                    # NOTE: Don't create travel plan here - the MAF workflow will create it
                    # This prevents duplicate entries in the database
                    logger.info(f"✅ Task created: {task_id} - MAF workflow will create the travel plan")
                    
                    state.workflow_id = task_id
                    state.phase = ConversationPhase.EXECUTING
                    
                    return {
                        "success": True,
                        "workflow_id": task_id,
                        "message": "Travel planning workflow started successfully!",
                        "data": {
                            "task_id": task_id,
                            "workflow_id": task_id,  # Add explicit workflow_id
                            "status": "started",
                            "estimated_completion": "5-10 minutes",
                            "websocket_url": f"/ws/travel/{task_id}",  # WebSocket endpoint for real-time updates
                            "team": "travel_planning"
                        },
                        # DON'T navigate - let split-screen handle it
                        "navigate_to": None,
                        "auto_redirect": False
                    }
                else:
                    error_detail = response.text
                    logger.error(f"Travel API error: {response.status_code} - {error_detail}")
                    
                    try:
                        error_json = response.json()
                        error_msg = error_json.get("detail", error_detail)
                    except:
                        error_msg = error_detail
                    
                    return {
                        "success": False,
                        "error": f"Failed to start travel workflow: {response.status_code}",
                        "message": f"Sorry, I couldn't start the travel workflow: {error_msg}. Please try using the Travel Planning Team dashboard.",
                        "debug_info": {
                            "status_code": response.status_code,
                            "error": error_detail,
                            "travel_data": travel_data
                        }
                    }
        
        except Exception as e:
            logger.error(f"Error triggering travel workflow: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Sorry, I encountered an error starting the travel workflow. Please try using the Travel Team dashboard."
            }
    
    async def get_workflow_status(self, workflow_id: str, workflow_type: str) -> Dict[str, Any]:
        """Get status of running workflow"""
        
        try:
            if workflow_type == "blog":
                endpoint = f"{self.base_url}/api/blog/status/{workflow_id}"
            elif workflow_type == "travel":
                endpoint = f"{self.base_url}/api/travel/status/{workflow_id}"
            else:
                return {"error": "Unknown workflow type"}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(endpoint, timeout=10.0)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return {"error": f"Status check failed: {response.status_code}"}
        
        except Exception as e:
            logger.error(f"Error checking workflow status: {e}")
            return {"error": str(e)}
    
    async def trigger_workflow(self, state: ConversationState) -> Dict[str, Any]:
        """Main method to trigger appropriate workflow"""
        
        if state.intent == "blog":
            return await self.trigger_blog_workflow(state)
        elif state.intent == "travel":
            return await self.trigger_travel_workflow(state)
        else:
            return {
                "success": False,
                "error": "Unknown intent",
                "message": "I'm not sure what workflow to start. Please try again."
            }


# Global workflow trigger instance
workflow_trigger = WorkflowTrigger()
