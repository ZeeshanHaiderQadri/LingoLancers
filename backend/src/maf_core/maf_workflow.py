"""
MAF Workflow Orchestrator with LLM-powered agents
Integrates the new MAF agents with proper LLM and tool connections
"""

import logging
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime

from .maf_travel_agents import (
    MAFTravelPlannerAgent,
    MAFResearchAgent,
    MAFSearchAgent
)
# Import MAFMessage from the correct module
try:
    from .maf_travel_agents import MAFMessage
except ImportError:
    # Fallback: define MAFMessage locally if import fails
    from dataclasses import dataclass
    from typing import Dict, Any
    
    @dataclass
    class MAFMessage:
        """MAF Message structure"""
        id: str
        sender: str
        recipient: str
        content: Dict[str, Any]
        message_type: str
        timestamp: str

logger = logging.getLogger(__name__)

class MAFTravelWorkflow:
    """
    Travel Planning Workflow using MAF agents with LLM integration
    """
    
    def __init__(self, task_id: Optional[str] = None):
        self.workflow_id = "maf_travel_workflow"
        self.name = "MAF Travel Planning Workflow"
        self.is_initialized = False
        self.task_id = task_id  # Store task_id for progressive updates
        
        # Initialize agents
        self.travel_planner: Optional[MAFTravelPlannerAgent] = None
        self.research_agent: Optional[MAFResearchAgent] = None
        self.search_agent: Optional[MAFSearchAgent] = None
        
        logger.info(f"🏗️ {self.name} created")
    
    async def initialize(self) -> bool:
        """Initialize all agents"""
        try:
            logger.info("🚀 Initializing MAF Travel Workflow with LLM agents...")
            
            # Create agents with LLM integration
            self.travel_planner = MAFTravelPlannerAgent()
            self.research_agent = MAFResearchAgent()
            self.search_agent = MAFSearchAgent()
            
            # Start all agents
            await self.travel_planner.start()
            await self.research_agent.start()
            await self.search_agent.start()
            
            self.is_initialized = True
            logger.info("✅ MAF Travel Workflow initialized with LLM-powered agents")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize workflow: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return False
    
    def _update_task_progress(self, step_id: str, result: Any) -> None:
        """
        Update task status with progressive results after each agent completes.
        
        This method updates the task cache with partial results, allowing the frontend
        to display results progressively as each agent completes its work.
        
        Thread-safe implementation with validation for result structure.
        
        Args:
            step_id: The workflow step identifier (e.g., 'initial_planning', 'destination_research')
            result: The result from the completed agent (MAFMessage object)
        
        Requirements: 2, 6
        """
        if not self.task_id:
            logger.warning("⚠️ No task_id set, skipping progressive update")
            return
        
        # Validate step_id
        valid_steps = ["initial_planning", "destination_research", "real_time_search", "final_compilation"]
        if step_id not in valid_steps:
            logger.error(f"❌ Invalid step_id: {step_id}. Must be one of {valid_steps}")
            return
        
        try:
            # Import tasks dictionary and threading lock from tasks_api
            from api.tasks_api import tasks, task_update_lock
            
            # Thread-safe update using lock
            with task_update_lock:
                # Check if task exists
                if self.task_id not in tasks:
                    logger.warning(f"⚠️ Task {self.task_id} not found in task cache")
                    return
                
                task = tasks[self.task_id]
                
                # Initialize result structure if not present
                if not task.result:
                    task.result = {
                        "status": "processing",
                        "results": {},
                        "timestamp": datetime.now().isoformat()
                    }
                
                # Ensure results dictionary exists
                if "results" not in task.result:
                    task.result["results"] = {}
                
                # Validate result object
                if not hasattr(result, 'content') or not isinstance(result.content, dict):
                    logger.error(f"❌ Invalid result object for {step_id}: missing content attribute")
                    return
                
                # Extract result data based on step_id
                step_data = {}
                if step_id == "initial_planning":
                    step_data = {
                        "plan": result.content.get("result", {}),
                        "status": "completed",
                        "timestamp": datetime.now().isoformat()
                    }
                elif step_id == "destination_research":
                    step_data = {
                        "research_data": result.content.get("research_data", {}),
                        "status": "completed",
                        "timestamp": datetime.now().isoformat()
                    }
                elif step_id == "real_time_search":
                    step_data = {
                        "search_results": result.content.get("search_results", {}),
                        "status": "completed",
                        "timestamp": datetime.now().isoformat()
                    }
                elif step_id == "final_compilation":
                    step_data = {
                        "status": "completed",
                        "timestamp": datetime.now().isoformat()
                    }
                
                # Validate step_data structure
                if not step_data or "status" not in step_data:
                    logger.error(f"❌ Invalid step_data structure for {step_id}")
                    return
                
                # Update the specific step in results
                task.result["results"][step_id] = step_data
                
                # Update task timestamp
                task.result["timestamp"] = datetime.now().isoformat()
                
                # Keep task status as "processing" until final compilation
                if step_id != "final_compilation":
                    task.status = "processing"
                else:
                    # Mark task as completed when final compilation is done
                    task.status = "completed"
                    task.completed_at = datetime.now().isoformat()
                
                logger.info(f"✅ Progressive update: {step_id} completed for task {self.task_id}")
                logger.debug(f"📊 Current results keys: {list(task.result['results'].keys())}")
            
        except Exception as e:
            logger.error(f"❌ Error updating task progress for {step_id}: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
    
    async def execute(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the travel planning workflow with progressive updates"""
        if not self.is_initialized:
            return {"success": False, "error": "Workflow not initialized"}
        
        try:
            request_text = request_data.get("request", "")
            logger.info(f"🎯 Executing workflow for: {request_text}")
            
            # Step 1: Travel Planner creates initial plan with LLM reasoning
            logger.info("📋 Step 1: Travel Planner analyzing request with LLM...")
            planner_message = MAFMessage(
                id=f"msg_{datetime.now().timestamp()}",
                sender="workflow",
                recipient="TravelPlannerAgent",
                content={"request": request_text},
                message_type="request"
            )
            
            planner_response = await self.travel_planner.process_message(planner_message)
            logger.info(f"✅ Travel Planner completed: {planner_response.content.get('type')}")
            
            # Progressive update after Agent 1
            self._update_task_progress("initial_planning", planner_response)
            
            # Small delay to allow frontend to poll and see this update
            await asyncio.sleep(3)
            
            # Extract destination for next steps
            destination = self._extract_destination(request_text, planner_response)
            
            # Step 2: Research Agent gathers information
            logger.info(f"🔬 Step 2: Research Agent researching {destination}...")
            research_message = MAFMessage(
                id=f"msg_{datetime.now().timestamp()}",
                sender="TravelPlannerAgent",
                recipient="ResearchAgent",
                content={"destination": destination},
                message_type="research_request"
            )
            
            research_response = await self.research_agent.process_message(research_message)
            logger.info(f"✅ Research Agent completed")
            
            # Progressive update after Agent 2
            self._update_task_progress("destination_research", research_response)
            
            # Small delay to allow frontend to poll and see this update
            await asyncio.sleep(3)
            
            # Step 3: Search Agent finds flights and hotels
            logger.info(f"🔍 Step 3: Search Agent finding flights and hotels...")
            search_message = MAFMessage(
                id=f"msg_{datetime.now().timestamp()}",
                sender="TravelPlannerAgent",
                recipient="SearchAgent",
                content={
                    "destination_city": destination,
                    "departure_city": "New York"  # Default, can be extracted from request
                },
                message_type="search_request"
            )
            
            search_response = await self.search_agent.process_message(search_message)
            logger.info(f"✅ Search Agent completed")
            
            # Progressive update after Agent 3
            self._update_task_progress("real_time_search", search_response)
            
            # Small delay to allow frontend to poll and see this update
            await asyncio.sleep(3)
            
            # Step 4: Compile final results
            logger.info("📦 Step 4: Compiling final travel plan...")
            final_result = self._compile_results(
                planner_response,
                research_response,
                search_response
            )
            
            # Progressive update after final compilation
            # Create a mock MAFMessage for final compilation
            final_message = MAFMessage(
                id=f"msg_{datetime.now().timestamp()}",
                sender="workflow",
                recipient="workflow",
                content={"result": final_result},
                message_type="compilation"
            )
            self._update_task_progress("final_compilation", final_message)
            
            # Save completed travel plan to database
            await self._save_travel_plan_to_database(request_data, final_result)
            
            logger.info("🎉 Workflow completed successfully!")
            
            return {
                "success": True,
                "workflow_id": self.workflow_id,
                "result": final_result
            }
            
        except Exception as e:
            logger.error(f"❌ Workflow execution failed: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            return {
                "success": False,
                "error": str(e),
                "workflow_id": self.workflow_id
            }
    
    async def _save_travel_plan_to_database(self, request_data: Dict[str, Any], final_result: Dict[str, Any]) -> None:
        """Save completed travel plan to database"""
        try:
            # Import travel model and json
            from travel_team.models import TravelPlanModel
            import json
            
            travel_model = TravelPlanModel()
            
            # Extract destination from request
            request_text = request_data.get("request", "")
            destination = self._extract_destination(request_text, None)
            
            # Check if we have a task_id that matches a travel plan
            if self.task_id:
                # Try to update existing plan with serialized result
                update_data = {
                    "status": "completed",
                    "result": json.dumps(final_result)  # Serialize to JSON string
                }
                
                updated = travel_model.update_travel_plan(self.task_id, update_data)
                
                if updated:
                    logger.info(f"✅ Updated travel plan {self.task_id} in database with final results")
                else:
                    logger.warning(f"⚠️ Could not find travel plan {self.task_id} to update")
            else:
                logger.warning("⚠️ No task_id available to save travel plan")
                
        except Exception as e:
            logger.error(f"❌ Error saving travel plan to database: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
    
    def _extract_destination(self, request: str, planner_response: Optional[MAFMessage]) -> str:
        """Extract destination from request or planner response"""
        # Try to extract from planner response if provided
        if planner_response:
            result = planner_response.content.get("result", {})
            if isinstance(result, dict):
                # Check for structured destination info
                if "destination_info" in result:
                    try:
                        import json
                        # Handle if it's already a dict or a string
                        dest_info = result["destination_info"]
                        if isinstance(dest_info, str):
                            dest_info = json.loads(dest_info)
                            
                        if isinstance(dest_info, dict):
                            # Try various keys
                            if "destination_city" in dest_info and dest_info["destination_city"] != "Unknown":
                                return dest_info["destination_city"]
                            if "destination" in dest_info and dest_info["destination"] != "Unknown":
                                return dest_info["destination"]
                    except Exception as e:
                        logger.warning(f"Failed to parse destination_info: {e}")

                agent_output = result.get("agent_output", "")
                if agent_output:
                    # Simple extraction - can be improved
                    words = request.lower().split()
                    for i, word in enumerate(words):
                        if word in ["to", "in", "visit"]:
                            if i + 1 < len(words):
                                return words[i + 1].title()
        
        # Fallback: extract from request
        if "madinah" in request.lower():
            return "Madinah"
        elif "paris" in request.lower():
            return "Paris"
        elif "dubai" in request.lower():
            return "Dubai"
        
        return "Unknown"
    
    def _compile_results(
        self,
        planner_response: MAFMessage,
        research_response: MAFMessage,
        search_response: MAFMessage
    ) -> Dict[str, Any]:
        """Compile all agent responses into final result - Frontend compatible format"""
        return {
            "travel_plan": planner_response.content.get("result", {}),
            "research_data": research_response.content.get("research_data", {}),
            "search_results": search_response.content.get("search_results", {}),
            "status": "completed",
            "timestamp": datetime.now().isoformat(),
            # Add frontend-compatible format
            "results": {
                "initial_planning": {
                    "plan": planner_response.content.get("result", {}),
                    "status": "completed"
                },
                "destination_research": {
                    "research_data": research_response.content.get("research_data", {}),
                    "status": "completed"
                },
                "real_time_search": {
                    "search_results": search_response.content.get("search_results", {}),
                    "status": "completed"
                },
                "final_compilation": {
                    "status": "completed"
                }
            }
        }
    
    async def shutdown(self) -> None:
        """Shutdown all agents"""
        logger.info("🛑 Shutting down MAF Travel Workflow...")
        
        if self.travel_planner:
            await self.travel_planner.stop()
        if self.research_agent:
            await self.research_agent.stop()
        if self.search_agent:
            await self.search_agent.stop()
        
        self.is_initialized = False
        logger.info("✅ Workflow shutdown complete")


class ProperMAFTravelTeam:
    """
    Wrapper for MAF Travel Workflow to maintain compatibility
    """
    
    def __init__(self):
        self.team_id = "proper_maf_travel_team"
        self.name = "Proper MAF Travel Team"
        self.workflow: Optional[MAFTravelWorkflow] = None
        self.is_initialized = False
    
    async def initialize(self) -> bool:
        """Initialize the travel team"""
        try:
            logger.info("🚀 Initializing Proper MAF Travel Team...")
            
            self.workflow = MAFTravelWorkflow()
            success = await self.workflow.initialize()
            
            if success:
                self.is_initialized = True
                logger.info("✅ Proper MAF Travel Team initialized")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize team: {e}")
            return False
    
    async def process_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process travel planning request"""
        if not self.is_initialized or not self.workflow:
            return {"success": False, "error": "Team not initialized"}
        
        try:
            logger.info(f"🎯 Processing request: {request_data.get('request', '')}")
            
            # Set task_id on workflow if provided
            task_id = request_data.get("task_id")
            if task_id:
                self.workflow.task_id = task_id
                logger.info(f"📋 Task ID set for progressive updates: {task_id}")
                
                # Create travel plan in database BEFORE executing workflow
                await self._create_travel_plan_in_database(task_id, request_data)
            
            result = await self.workflow.execute(request_data)
            
            return {
                "success": result.get("success", False),
                "team": self.name,
                "result": result.get("result", {}),
                "error": result.get("error")
            }
            
        except Exception as e:
            logger.error(f"❌ Error processing request: {e}")
            return {"success": False, "error": str(e)}
    
    async def _create_travel_plan_in_database(self, task_id: str, request_data: Dict[str, Any]) -> None:
        """Create travel plan in database before workflow starts"""
        try:
            from travel_team.models import TravelPlanModel
            from datetime import datetime, timedelta
            
            travel_model = TravelPlanModel()
            
            # Check if plan already exists
            existing_plan = travel_model.get_travel_plan(task_id)
            if existing_plan:
                logger.info(f"📝 Travel plan {task_id} already exists in database")
                return
            
            # Extract destination from request
            request_text = request_data.get("request", "")
            # Try to extract destination more intelligently
            destination = "Unknown"
            request_lower = request_text.lower()
            
            # Common patterns: "to X", "visit X", "trip to X"
            import re
            patterns = [
                r'to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',  # "to Paris" or "to New York"
                r'visit\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',  # "visit Tokyo"
                r'trip\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',  # "trip to London"
            ]
            
            for pattern in patterns:
                match = re.search(pattern, request_text)
                if match:
                    destination = match.group(1)
                    break
            
            # Fallback to simple extraction
            if destination == "Unknown":
                destination = self.workflow._extract_destination(request_text, None)
            
            # Parse duration and budget from request (simple extraction)
            duration_days = 7  # Default
            budget = "$2500"  # Default
            
            if "days" in request_text.lower():
                try:
                    words = request_text.split()
                    for i, word in enumerate(words):
                        if "day" in word.lower() and i > 0:
                            duration_days = int(''.join(filter(str.isdigit, words[i-1])))
                            break
                except:
                    pass
            
            if "$" in request_text:
                try:
                    import re
                    budget_match = re.search(r'\$[\d,]+', request_text)
                    if budget_match:
                        budget = budget_match.group()
                except:
                    pass
            
            # Calculate dates
            start_date = datetime.now().strftime('%Y-%m-%d')
            end_date = (datetime.now() + timedelta(days=duration_days)).strftime('%Y-%m-%d')
            
            # Create plan data
            plan_data = {
                "id": task_id,
                "destination": destination,
                "start_date": start_date,
                "end_date": end_date,
                "adults": 1,
                "children": 0,
                "budget": budget,
                "preferences": "",
                "status": "in_progress",
                "task_id": task_id,
                "user_id": "default_user"
            }
            
            logger.info(f"📝 Creating travel plan in database: {task_id} -> {destination}")
            travel_model.create_travel_plan(plan_data)
            logger.info(f"✅ Travel plan created in database: {task_id}")
            
        except Exception as e:
            logger.error(f"❌ Error creating travel plan in database: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
    
    async def shutdown(self) -> None:
        """Shutdown the team"""
        if self.workflow:
            await self.workflow.shutdown()
        self.is_initialized = False
        logger.info("🛑 Proper MAF Travel Team shutdown")
