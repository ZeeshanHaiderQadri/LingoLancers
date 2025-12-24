"""
Microsoft Agent Framework - Workflow Implementation
Following MAF workflow patterns for orchestrating multiple agents
"""

import asyncio
import json
import uuid
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Callable, Union
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import logging

from .agents import BaseAgent, AgentMessage, AgentContext

logger = logging.getLogger(__name__)

class WorkflowState(Enum):
    """Workflow execution states"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"

@dataclass
class WorkflowStep:
    """Individual step in a workflow"""
    step_id: str
    name: str
    agent_id: str
    input_data: Dict[str, Any] = field(default_factory=dict)
    output_data: Dict[str, Any] = field(default_factory=dict)
    status: WorkflowState = WorkflowState.PENDING
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    dependencies: List[str] = field(default_factory=list)  # Step IDs this step depends on

@dataclass
class WorkflowCheckpoint:
    """Checkpoint for workflow state persistence"""
    checkpoint_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    workflow_id: str = ""
    state: WorkflowState = WorkflowState.PENDING
    current_step: Optional[str] = None
    completed_steps: List[str] = field(default_factory=list)
    step_data: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)

class BaseWorkflow(ABC):
    """
    Base workflow class following Microsoft Agent Framework patterns
    """
    
    def __init__(
        self,
        workflow_id: str,
        name: str,
        description: str = ""
    ):
        self.workflow_id = workflow_id
        self.name = name
        self.description = description
        self.state = WorkflowState.PENDING
        self.agents: Dict[str, BaseAgent] = {}
        self.steps: Dict[str, WorkflowStep] = {}
        self.step_order: List[str] = []
        self.context: Optional[AgentContext] = None
        self.checkpoints: List[WorkflowCheckpoint] = []
        self.current_step_index = 0
        self.workflow_data: Dict[str, Any] = {}
        
        # Event handlers
        self.on_step_completed: Optional[Callable] = None
        self.on_workflow_completed: Optional[Callable] = None
        self.on_workflow_failed: Optional[Callable] = None
        
        logger.info(f"Workflow {self.name} ({self.workflow_id}) initialized")
    
    def add_agent(self, agent: BaseAgent) -> None:
        """Add an agent to the workflow"""
        self.agents[agent.agent_id] = agent
        logger.info(f"Added agent {agent.name} to workflow {self.name}")
    
    def add_step(
        self,
        step_id: str,
        name: str,
        agent_id: str,
        input_data: Dict[str, Any] = None,
        dependencies: List[str] = None
    ) -> WorkflowStep:
        """Add a step to the workflow"""
        step = WorkflowStep(
            step_id=step_id,
            name=name,
            agent_id=agent_id,
            input_data=input_data or {},
            dependencies=dependencies or []
        )
        self.steps[step_id] = step
        self.step_order.append(step_id)
        logger.info(f"Added step {name} to workflow {self.name}")
        return step
    
    async def execute(self, input_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Execute the workflow"""
        try:
            self.state = WorkflowState.RUNNING
            self.workflow_data.update(input_data or {})
            
            logger.info(f"Starting workflow execution: {self.name}")
            
            # Create checkpoint at start
            await self._create_checkpoint()
            
            # Execute workflow logic
            result = await self._execute_workflow()
            
            self.state = WorkflowState.COMPLETED
            logger.info(f"Workflow {self.name} completed successfully")
            
            # Trigger completion handler
            if self.on_workflow_completed:
                await self.on_workflow_completed(result)
            
            return result
            
        except Exception as e:
            self.state = WorkflowState.FAILED
            logger.error(f"Workflow {self.name} failed: {e}")
            import traceback
            logger.error(f"Workflow error traceback: {traceback.format_exc()}")
            
            # Trigger failure handler
            if self.on_workflow_failed:
                try:
                    await self.on_workflow_failed(e)
                except Exception as handler_error:
                    logger.error(f"Error in workflow failure handler: {handler_error}")
            
            return {
                "success": False,
                "error": str(e),
                "workflow_id": self.workflow_id
            }
    
    @abstractmethod
    async def _execute_workflow(self) -> Dict[str, Any]:
        """Execute the workflow logic - to be implemented by subclasses"""
        pass
    
    async def execute_step(self, step_id: str) -> Dict[str, Any]:
        """Execute a single workflow step with intelligent data passing"""
        if step_id not in self.steps:
            raise ValueError(f"Step {step_id} not found in workflow")
        
        step = self.steps[step_id]
        agent = self.agents.get(step.agent_id)
        
        if not agent:
            raise ValueError(f"Agent {step.agent_id} not found for step {step_id}")
        
        try:
            step.status = WorkflowState.RUNNING
            step.started_at = datetime.now()
            
            logger.info(f"🔄 Executing step {step.name} with agent {agent.name}")
            logger.info(f"📊 Current workflow data keys: {list(self.workflow_data.keys())}")
            
            # Prepare intelligent input message with context
            input_content = {
                **step.input_data,
                **self.workflow_data,
                "step_id": step_id,
                "step_name": step.name,
                "workflow_context": {
                    "previous_steps": [s for s in self.step_order if self.steps[s].status == WorkflowState.COMPLETED],
                    "current_step": step_id,
                    "remaining_steps": [s for s in self.step_order if self.steps[s].status == WorkflowState.PENDING]
                }
            }
            
            logger.info(f"📤 Sending to agent {agent.name}: {list(input_content.keys())}")
            
            message = AgentMessage(
                sender_id="workflow",
                recipient_id=agent.agent_id,
                content=input_content,
                message_type="workflow_task"
            )
            
            # Execute step with timeout
            import asyncio
            try:
                response = await asyncio.wait_for(agent.handle_message(message), timeout=120.0)  # 2 minute timeout
            except asyncio.TimeoutError:
                raise Exception(f"Step {step_id} timed out after 2 minutes")
            
            # Store and validate output
            if not response or not hasattr(response, 'content'):
                raise Exception(f"Invalid response from agent {agent.name}")
            
            step.output_data = response.content
            step.status = WorkflowState.COMPLETED
            step.completed_at = datetime.now()
            
            logger.info(f"✅ Step {step.name} completed successfully")
            logger.info(f"📥 Response keys: {list(response.content.keys()) if isinstance(response.content, dict) else 'Non-dict response'}")
            
            # Trigger step completion handler
            if self.on_step_completed:
                try:
                    await self.on_step_completed(step)
                except Exception as handler_error:
                    logger.error(f"Error in step completion handler: {handler_error}")
                    # Don't fail the step due to handler error
            
            return step.output_data
            
        except Exception as e:
            step.status = WorkflowState.FAILED
            step.error_message = str(e)
            step.completed_at = datetime.now()
            
            logger.error(f"❌ Step {step.name} failed: {e}")
            import traceback
            logger.error(f"📋 Traceback: {traceback.format_exc()}")
            raise
    
    async def _create_checkpoint(self) -> WorkflowCheckpoint:
        """Create a checkpoint of the current workflow state"""
        completed_steps = [
            step_id for step_id, step in self.steps.items()
            if step.status == WorkflowState.COMPLETED
        ]
        
        checkpoint = WorkflowCheckpoint(
            workflow_id=self.workflow_id,
            state=self.state,
            current_step=self.step_order[self.current_step_index] if self.current_step_index < len(self.step_order) else None,
            completed_steps=completed_steps,
            step_data={step_id: self.steps[step_id].output_data for step_id in completed_steps}
        )
        
        self.checkpoints.append(checkpoint)
        logger.info(f"Created checkpoint for workflow {self.name}")
        return checkpoint
    
    async def resume_from_checkpoint(self, checkpoint: WorkflowCheckpoint) -> Dict[str, Any]:
        """Resume workflow execution from a checkpoint"""
        logger.info(f"Resuming workflow {self.name} from checkpoint")
        
        # Restore state
        self.state = checkpoint.state
        
        # Mark completed steps
        for step_id in checkpoint.completed_steps:
            if step_id in self.steps:
                self.steps[step_id].status = WorkflowState.COMPLETED
                self.steps[step_id].output_data = checkpoint.step_data.get(step_id, {})
        
        # Find current step index
        if checkpoint.current_step and checkpoint.current_step in self.step_order:
            self.current_step_index = self.step_order.index(checkpoint.current_step)
        
        # Continue execution
        return await self.execute()

class SequentialWorkflow(BaseWorkflow):
    """
    Sequential workflow that executes steps one after another
    """
    
    async def _execute_workflow(self) -> Dict[str, Any]:
        """Execute steps sequentially with proper agent reasoning"""
        results = {}
        
        logger.info(f"🚀 Starting sequential workflow execution: {self.name}")
        logger.info(f"📋 Steps to execute: {self.step_order}")
        
        for step_id in self.step_order:
            current_step = self.steps[step_id]
            
            logger.info(f"🔄 Executing step: {step_id} - {current_step.name}")
            
            # Check dependencies
            if not await self._check_dependencies(current_step):
                raise RuntimeError(f"Dependencies not met for step {current_step.name}")
            
            # Execute step with detailed logging
            try:
                result = await self.execute_step(step_id)
                results[step_id] = result
                
                # Update workflow data with step output
                if isinstance(result, dict):
                    self.workflow_data.update(result)
                
                logger.info(f"✅ Step {step_id} completed successfully")
                logger.info(f"📊 Step result keys: {list(result.keys()) if isinstance(result, dict) else 'Non-dict result'}")
                
                # Create checkpoint after each step
                await self._create_checkpoint()
                
            except Exception as e:
                logger.error(f"❌ Step {step_id} failed: {e}")
                raise
        
        logger.info(f"🎉 Workflow {self.name} completed successfully")
        
        return {
            "success": True,
            "workflow_id": self.workflow_id,
            "results": results,
            "workflow_data": self.workflow_data,
            "total_steps": len(self.step_order),
            "completed_steps": len(results)
        }
    
    async def _check_dependencies(self, step: WorkflowStep) -> bool:
        """Check if step dependencies are satisfied"""
        for dep_step_id in step.dependencies:
            if dep_step_id not in self.steps:
                return False
            if self.steps[dep_step_id].status != WorkflowState.COMPLETED:
                return False
        return True

class ConcurrentWorkflow(BaseWorkflow):
    """
    Concurrent workflow that can execute independent steps in parallel
    """
    
    async def _execute_workflow(self) -> Dict[str, Any]:
        """Execute steps concurrently where possible"""
        results = {}
        remaining_steps = set(self.step_order)
        
        while remaining_steps:
            # Find steps that can be executed (dependencies satisfied)
            ready_steps = []
            for step_id in remaining_steps:
                current_step = self.steps[step_id]
                if await self._check_dependencies(current_step):
                    ready_steps.append(step_id)
            
            if not ready_steps:
                raise RuntimeError("Circular dependency detected or no steps ready")
            
            # Execute ready steps concurrently
            tasks = [self.execute_step(step_id) for step_id in ready_steps]
            step_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for i, step_id in enumerate(ready_steps):
                result = step_results[i]
                if isinstance(result, Exception):
                    raise result
                
                results[step_id] = result
                self.workflow_data.update(result)
                remaining_steps.remove(step_id)
            
            # Create checkpoint after batch
            await self._create_checkpoint()
        
        return {
            "success": True,
            "workflow_id": self.workflow_id,
            "results": results,
            "workflow_data": self.workflow_data
        }
    
    async def _check_dependencies(self, step: WorkflowStep) -> bool:
        """Check if step dependencies are satisfied"""
        for dep_step_id in step.dependencies:
            if dep_step_id not in self.steps:
                return False
            if self.steps[dep_step_id].status != WorkflowState.COMPLETED:
                return False
        return True

class ConditionalWorkflow(BaseWorkflow):
    """
    Workflow with conditional branching logic
    """
    
    def __init__(self, workflow_id: str, name: str, description: str = ""):
        super().__init__(workflow_id, name, description)
        self.conditions: Dict[str, Callable] = {}
        self.branches: Dict[str, List[str]] = {}  # condition -> list of step_ids
    
    def add_condition(self, condition_id: str, condition_func: Callable) -> None:
        """Add a condition function"""
        self.conditions[condition_id] = condition_func
    
    def add_branch(self, condition_id: str, step_ids: List[str]) -> None:
        """Add a branch for a condition"""
        self.branches[condition_id] = step_ids
    
    async def _execute_workflow(self) -> Dict[str, Any]:
        """Execute workflow with conditional branching"""
        results = {}
        
        for step_id in self.step_order:
            current_step = self.steps[step_id]
            
            # Check if this step should be executed based on conditions
            should_execute = True
            for condition_id, condition_func in self.conditions.items():
                if step_id in self.branches.get(condition_id, []):
                    should_execute = await self._evaluate_condition(condition_func)
                    break
            
            if should_execute:
                # Check dependencies
                if not await self._check_dependencies(current_step):
                    raise RuntimeError(f"Dependencies not met for step {current_step.name}")
                
                # Execute step
                result = await self.execute_step(step_id)
                results[step_id] = result
                self.workflow_data.update(result)
            else:
                logger.info(f"Skipping step {current_step.name} due to condition")
                current_step.status = WorkflowState.COMPLETED  # Mark as completed but skipped
            
            # Create checkpoint
            await self._create_checkpoint()
        
        return {
            "success": True,
            "workflow_id": self.workflow_id,
            "results": results,
            "workflow_data": self.workflow_data
        }
    
    async def _evaluate_condition(self, condition_func: Callable) -> bool:
        """Evaluate a condition function"""
        try:
            if asyncio.iscoroutinefunction(condition_func):
                return await condition_func(self.workflow_data)
            else:
                return condition_func(self.workflow_data)
        except Exception as e:
            logger.error(f"Error evaluating condition: {e}")
            return False
    
    async def _check_dependencies(self, step: WorkflowStep) -> bool:
        """Check if step dependencies are satisfied"""
        for dep_step_id in step.dependencies:
            if dep_step_id not in self.steps:
                return False
            if self.steps[dep_step_id].status != WorkflowState.COMPLETED:
                return False
        return True

# Workflow factory for creating different types of workflows
class WorkflowFactory:
    """Factory for creating different types of workflows"""
    
    @staticmethod
    def create_sequential_workflow(
        workflow_id: str,
        name: str,
        description: str = ""
    ) -> SequentialWorkflow:
        """Create a sequential workflow"""
        return SequentialWorkflow(workflow_id, name, description)
    
    @staticmethod
    def create_concurrent_workflow(
        workflow_id: str,
        name: str,
        description: str = ""
    ) -> ConcurrentWorkflow:
        """Create a concurrent workflow"""
        return ConcurrentWorkflow(workflow_id, name, description)
    
    @staticmethod
    def create_conditional_workflow(
        workflow_id: str,
        name: str,
        description: str = ""
    ) -> ConditionalWorkflow:
        """Create a conditional workflow"""
        return ConditionalWorkflow(workflow_id, name, description)