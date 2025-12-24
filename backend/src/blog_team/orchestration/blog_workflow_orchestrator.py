"""
Blog Workflow Orchestrator
Coordinates the execution of all blog writing agents using MAF patterns
Requirements: 1.4, 1.5, 10.1, 10.2, 10.3
"""
import asyncio
import uuid
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import logging

# Import all agents
from blog_team.agents.research_agent import ResearchAgent
from blog_team.agents.seo_agent import SEOAgent
from blog_team.agents.writer_agent import WriterAgent
from blog_team.agents.feature_image_agent import FeatureImageAgent
from blog_team.agents.image_finder_agent import ImageFinderAgent
from blog_team.agents.compiler_agent import CompilerAgent

# Import models
from blog_team.models.database import get_db
from blog_team.models.orm_models import WorkflowState as WorkflowStateModel, DraftArticle

logger = logging.getLogger(__name__)

# Import WebSocket manager (lazy import to avoid circular dependency)
_websocket_manager = None

def get_websocket_manager():
    """Get WebSocket manager instance (lazy import)"""
    global _websocket_manager
    if _websocket_manager is None:
        try:
            from blog_team.api.websocket_manager import get_connection_manager
            _websocket_manager = get_connection_manager()
        except ImportError:
            logger.warning("WebSocket manager not available")
            _websocket_manager = None
    return _websocket_manager


class WorkflowStatus(Enum):
    """Workflow execution status"""
    PENDING = "pending"
    RUNNING = "running"
    AWAITING_REVIEW = "awaiting_review"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AgentStatus(Enum):
    """Individual agent execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class BlogRequest:
    """User request for blog article"""
    topic: Optional[str] = None
    reference_urls: List[str] = field(default_factory=list)
    target_word_count: int = 1500
    tone: str = "professional"
    additional_instructions: Optional[str] = None
    user_id: str = ""


@dataclass
class AgentProgress:
    """Progress update for a single agent"""
    agent_name: str
    status: AgentStatus
    progress_percentage: int
    message: str
    result: Optional[Any] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


@dataclass
class WorkflowResult:
    """Result of workflow execution"""
    workflow_id: str
    status: WorkflowStatus
    article: Optional[Any] = None
    agent_results: Dict[str, Any] = field(default_factory=dict)
    errors: List[str] = field(default_factory=list)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class BlogWorkflowOrchestratorError(Exception):
    """Base exception for orchestrator errors"""
    pass


class BlogWorkflowOrchestrator:
    """
    Orchestrates the blog writing workflow using MAF patterns
    Combines sequential, concurrent, and branching execution
    """
    
    def __init__(self, max_retries: int = 3, retry_delay: float = 2.0):
        """
        Initialize orchestrator with all agents
        
        Args:
            max_retries: Maximum number of retries for transient failures
            retry_delay: Delay between retries in seconds
        """
        # Initialize all agents
        self.agents = {
            'research': ResearchAgent(),
            'seo': SEOAgent(),
            'writer': WriterAgent(),
            'feature_image': FeatureImageAgent(),
            'image_finder': ImageFinderAgent(),
            'compiler': CompilerAgent()
        }
        
        # Progress tracking
        self.progress_callbacks: List[Callable] = []
        
        # Workflow state
        self.current_workflow_id: Optional[str] = None
        self.workflow_states: Dict[str, Dict[str, Any]] = {}
        
        # Error handling configuration
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        
        logger.info("BlogWorkflowOrchestrator initialized with all agents")
    
    def register_progress_callback(self, callback: Callable) -> None:
        """Register a callback for progress updates"""
        self.progress_callbacks.append(callback)
    
    async def emit_progress(
        self,
        workflow_id: str,
        agent_name: str,
        status: AgentStatus,
        progress_percentage: int,
        message: str,
        result: Optional[Any] = None,
        error: Optional[str] = None
    ) -> None:
        """Emit progress update to all registered callbacks and WebSocket"""
        progress = AgentProgress(
            agent_name=agent_name,
            status=status,
            progress_percentage=progress_percentage,
            message=message,
            result=result,
            error=error,
            started_at=datetime.now() if status == AgentStatus.RUNNING else None,
            completed_at=datetime.now() if status in [AgentStatus.COMPLETED, AgentStatus.FAILED] else None
        )
        
        # Call all registered callbacks
        for callback in self.progress_callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(workflow_id, progress)
                else:
                    callback(workflow_id, progress)
            except Exception as e:
                logger.error(f"Error in progress callback: {e}")
        
        # Send WebSocket update
        try:
            ws_manager = get_websocket_manager()
            if ws_manager:
                if status == AgentStatus.RUNNING and progress_percentage == 0:
                    # Agent just started
                    await ws_manager.send_agent_started(workflow_id, agent_name, message)
                elif status == AgentStatus.COMPLETED:
                    # Agent completed
                    await ws_manager.send_agent_completed(workflow_id, agent_name, result, message)
                elif status == AgentStatus.FAILED:
                    # Agent failed
                    await ws_manager.send_agent_failed(workflow_id, agent_name, error or "Unknown error", message)
                else:
                    # Progress update
                    await ws_manager.send_agent_progress(workflow_id, agent_name, progress_percentage, message)
        except Exception as e:
            logger.error(f"Error sending WebSocket update: {e}")
    
    async def save_workflow_state(
        self,
        workflow_id: str,
        user_id: str,
        status: WorkflowStatus,
        current_agent: Optional[str] = None,
        agent_results: Optional[Dict[str, Any]] = None,
        request_data: Optional[Dict[str, Any]] = None
    ) -> None:
        """Save workflow state to database"""
        try:
            db = next(get_db())
            
            # Check if workflow state exists
            workflow_state = db.query(WorkflowStateModel).filter(
                WorkflowStateModel.workflow_id == workflow_id
            ).first()
            
            if workflow_state:
                # Update existing
                workflow_state.status = status.value
                workflow_state.current_agent = current_agent
                workflow_state.agent_results = agent_results or {}
                workflow_state.updated_at = datetime.now()
            else:
                # Create new - request_data is required for new records
                workflow_state = WorkflowStateModel(
                    workflow_id=workflow_id,
                    user_id=user_id,
                    status=status.value,
                    request_data=request_data or {},
                    current_agent=current_agent,
                    agent_results=agent_results or {},
                    iteration_count=0
                )
                db.add(workflow_state)
            
            db.commit()
            logger.info(f"Saved workflow state for {workflow_id}")
            
        except Exception as e:
            logger.error(f"Error saving workflow state: {e}")
            raise
    
    async def execute_workflow(
        self,
        request: BlogRequest,
        user_id: str,
        workflow_id: Optional[str] = None
    ) -> WorkflowResult:
        """
        Execute the complete blog writing workflow
        
        Workflow stages:
        1. Sequential: Research → SEO → Writer
        2. Concurrent: Feature Image || Image Finder
        3. Sequential: Compiler
        4. Human Review (handled separately)
        
        Args:
            request: Blog request with topic/URLs
            user_id: User ID for tracking
            workflow_id: Optional workflow ID (generated if not provided)
            
        Returns:
            WorkflowResult with compiled article awaiting review
        """
        if workflow_id is None:
            workflow_id = str(uuid.uuid4())
        self.current_workflow_id = workflow_id
        started_at = datetime.now()
        
        # Initialize workflow state
        self.workflow_states[workflow_id] = {
            'status': WorkflowStatus.RUNNING,
            'agent_results': {},
            'errors': []
        }
        
        try:
            logger.info(f"Starting workflow {workflow_id} for user {user_id}")
            
            # Prepare request data for storage
            request_data = {
                "topic": request.topic,
                "reference_urls": request.reference_urls,
                "target_word_count": request.target_word_count,
                "tone": request.tone,
                "additional_instructions": request.additional_instructions
            }
            
            # Save initial workflow state
            await self.save_workflow_state(
                workflow_id=workflow_id,
                user_id=user_id,
                status=WorkflowStatus.RUNNING,
                current_agent='research',
                request_data=request_data
            )
            
            # Give WebSocket connection time to fully establish
            await asyncio.sleep(0.5)
            
            # Phase 1: Sequential Content Creation
            # =====================================
            
            # Step 1: Research Agent
            await self.emit_progress(
                workflow_id, 'research', AgentStatus.RUNNING, 0,
                "Starting research on topic..."
            )
            
            # Create BlogRequest object for research agent
            from blog_team.agents.research_agent import BlogRequest
            research_request = BlogRequest(
                topic=request.topic,
                reference_urls=request.reference_urls,
                tone=request.tone
            )
            
            research_result = await self.agents['research'].execute(research_request, workflow_id)
            
            self.workflow_states[workflow_id]['agent_results']['research'] = research_result.to_dict()
            
            await self.emit_progress(
                workflow_id, 'research', AgentStatus.COMPLETED, 20,
                f"Research completed: {len(research_result.sources)} sources analyzed",
                result=research_result.to_dict()
            )
            
            # Save progress
            await self.save_workflow_state(
                workflow_id, user_id, WorkflowStatus.RUNNING,
                current_agent='seo',
                agent_results=self.workflow_states[workflow_id]['agent_results']
            )
            
            # Step 2: SEO Agent
            await self.emit_progress(
                workflow_id, 'seo', AgentStatus.RUNNING, 20,
                "Analyzing SEO opportunities..."
            )
            
            seo_result = await self.agents['seo'].execute(research_result)
            
            self.workflow_states[workflow_id]['agent_results']['seo'] = seo_result.to_dict()
            
            await self.emit_progress(
                workflow_id, 'seo', AgentStatus.COMPLETED, 35,
                f"SEO analysis completed: {len(seo_result.primary_keywords)} primary keywords identified",
                result=seo_result.to_dict()
            )
            
            # Save progress
            await self.save_workflow_state(
                workflow_id, user_id, WorkflowStatus.RUNNING,
                current_agent='writer',
                agent_results=self.workflow_states[workflow_id]['agent_results']
            )
            
            # Step 3: Writer Agent
            await self.emit_progress(
                workflow_id, 'writer', AgentStatus.RUNNING, 35,
                "Writing article content..."
            )
            
            # Create BlogRequest for writer agent
            from blog_team.agents.research_agent import BlogRequest
            writer_request = BlogRequest(
                topic=request.topic,
                reference_urls=request.reference_urls,
                tone=request.tone
            )
            
            article_draft = await self.agents['writer'].execute(
                research_result=research_result,
                seo_result=seo_result,
                blog_request=writer_request
            )
            
            self.workflow_states[workflow_id]['agent_results']['writer'] = article_draft.to_dict()
            
            await self.emit_progress(
                workflow_id, 'writer', AgentStatus.COMPLETED, 55,
                f"Article draft completed: {article_draft.word_count} words",
                result=article_draft.to_dict()
            )
            
            # Save progress
            await self.save_workflow_state(
                workflow_id, user_id, WorkflowStatus.RUNNING,
                current_agent='images',
                agent_results=self.workflow_states[workflow_id]['agent_results']
            )
            
            # Phase 2: Concurrent Visual Content
            # ===================================
            
            # Start both image agents in parallel
            await self.emit_progress(
                workflow_id, 'feature_image', AgentStatus.RUNNING, 55,
                "Generating feature image..."
            )
            await self.emit_progress(
                workflow_id, 'image_finder', AgentStatus.RUNNING, 55,
                "Finding supporting images..."
            )
            
            # Execute in parallel
            feature_image_task = self.agents['feature_image'].execute(
                article_draft
            )
            
            image_finder_task = self.agents['image_finder'].execute(
                article_draft
            )
            
            # Wait for both to complete
            feature_image_result, supporting_images_result = await asyncio.gather(
                feature_image_task,
                image_finder_task,
                return_exceptions=True
            )
            
            # Handle potential errors from parallel execution
            if isinstance(feature_image_result, Exception):
                logger.error(f"Feature image generation failed: {feature_image_result}")
                await self.emit_progress(
                    workflow_id, 'feature_image', AgentStatus.FAILED, 70,
                    "Feature image generation failed",
                    error=str(feature_image_result)
                )
                raise feature_image_result
            
            if isinstance(supporting_images_result, Exception):
                logger.error(f"Image finder failed: {supporting_images_result}")
                await self.emit_progress(
                    workflow_id, 'image_finder', AgentStatus.FAILED, 70,
                    "Supporting image search failed",
                    error=str(supporting_images_result)
                )
                raise supporting_images_result
            
            # Store results
            self.workflow_states[workflow_id]['agent_results']['feature_image'] = feature_image_result.to_dict()
            self.workflow_states[workflow_id]['agent_results']['image_finder'] = supporting_images_result.to_dict()
            
            await self.emit_progress(
                workflow_id, 'feature_image', AgentStatus.COMPLETED, 70,
                "Feature image generated successfully",
                result=feature_image_result.to_dict()
            )
            
            await self.emit_progress(
                workflow_id, 'image_finder', AgentStatus.COMPLETED, 75,
                f"Found {len(supporting_images_result.images)} supporting images",
                result=supporting_images_result.to_dict()
            )
            
            # Save progress
            await self.save_workflow_state(
                workflow_id, user_id, WorkflowStatus.RUNNING,
                current_agent='compiler',
                agent_results=self.workflow_states[workflow_id]['agent_results']
            )
            
            # Phase 3: Compilation
            # ====================
            
            await self.emit_progress(
                workflow_id, 'compiler', AgentStatus.RUNNING, 75,
                "Compiling final article..."
            )
            
            compiled_article = await self.agents['compiler'].execute(
                article_draft=article_draft,
                seo_result=seo_result,
                feature_image_result=feature_image_result,
                supporting_images_result=supporting_images_result
            )
            
            self.workflow_states[workflow_id]['agent_results']['compiler'] = compiled_article.to_dict()
            
            await self.emit_progress(
                workflow_id, 'compiler', AgentStatus.COMPLETED, 100,
                f"Article compiled successfully (SEO: {compiled_article.seo_score:.0f}, Readability: {compiled_article.readability_score:.0f})",
                result=compiled_article.to_dict()
            )
            
            # Save final state as awaiting review
            await self.save_workflow_state(
                workflow_id, user_id, WorkflowStatus.AWAITING_REVIEW,
                current_agent='review',
                agent_results=self.workflow_states[workflow_id]['agent_results']
            )
            
            # Save as draft article
            await self.save_draft_article(
                workflow_id=workflow_id,
                user_id=user_id,
                compiled_article=compiled_article
            )
            
            completed_at = datetime.now()
            
            # Send workflow completion notification
            try:
                ws_manager = get_websocket_manager()
                if ws_manager:
                    await ws_manager.send_workflow_completed(
                        workflow_id=workflow_id,
                        status='awaiting_review',
                        message="Article creation complete! Ready for review."
                    )
                    # Also send the article data
                    await ws_manager.broadcast_to_workflow(
                        workflow_id,
                        {
                            "type": "workflow_completed",
                            "workflow_id": workflow_id,
                            "status": "awaiting_review",
                            "message": "Article creation complete! Ready for review.",
                            "article": compiled_article.to_dict()
                        }
                    )
            except Exception as e:
                logger.error(f"Error sending workflow completion notification: {e}")
            
            logger.info(f"Workflow {workflow_id} completed successfully, awaiting review")
            
            return WorkflowResult(
                workflow_id=workflow_id,
                status=WorkflowStatus.AWAITING_REVIEW,
                article=compiled_article,
                agent_results=self.workflow_states[workflow_id]['agent_results'],
                started_at=started_at,
                completed_at=completed_at
            )
            
        except Exception as e:
            logger.error(f"Workflow {workflow_id} failed: {e}", exc_info=True)
            
            # Update workflow state to failed
            self.workflow_states[workflow_id]['status'] = WorkflowStatus.FAILED
            self.workflow_states[workflow_id]['errors'].append(str(e))
            
            await self.save_workflow_state(
                workflow_id, user_id, WorkflowStatus.FAILED,
                agent_results=self.workflow_states[workflow_id]['agent_results']
            )
            
            # Emit failure progress
            await self.emit_progress(
                workflow_id, 'workflow', AgentStatus.FAILED, 0,
                f"Workflow failed: {str(e)}",
                error=str(e)
            )
            
            raise BlogWorkflowOrchestratorError(f"Workflow execution failed: {e}")
    
    async def save_draft_article(
        self,
        workflow_id: str,
        user_id: str,
        compiled_article: Any
    ) -> None:
        """Save compiled article as draft"""
        try:
            db = next(get_db())
            
            draft = DraftArticle(
                workflow_id=workflow_id,
                user_id=user_id,
                title=compiled_article.title,
                content=compiled_article.to_dict()  # Store all content as JSON
            )
            
            db.add(draft)
            db.commit()
            
            logger.info(f"Saved draft article for workflow {workflow_id}")
            
        except Exception as e:
            logger.error(f"Error saving draft article: {e}")
            raise
    
    async def get_workflow_state(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get current workflow state"""
        return self.workflow_states.get(workflow_id)
    
    async def cancel_workflow(self, workflow_id: str) -> None:
        """Cancel a running workflow"""
        if workflow_id in self.workflow_states:
            self.workflow_states[workflow_id]['status'] = WorkflowStatus.CANCELLED
            logger.info(f"Workflow {workflow_id} cancelled")
    
    # Review Handling Methods
    # =======================
    
    async def handle_review_action(
        self,
        workflow_id: str,
        action: str,
        feedback: Optional[str] = None,
        platforms: Optional[List[str]] = None
    ) -> WorkflowResult:
        """
        Handle user review action
        
        Args:
            workflow_id: Workflow ID
            action: One of 'approve', 'request_changes', 'decline'
            feedback: User feedback for changes (required for request_changes)
            platforms: Publishing platforms (required for approve)
            
        Returns:
            WorkflowResult with updated status
        """
        try:
            # Get workflow state from database
            db = next(get_db())
            workflow_state = db.query(WorkflowStateModel).filter(
                WorkflowStateModel.workflow_id == workflow_id
            ).first()
            
            if not workflow_state:
                raise BlogWorkflowOrchestratorError(f"Workflow {workflow_id} not found")
            
            if workflow_state.status != WorkflowStatus.AWAITING_REVIEW.value:
                raise BlogWorkflowOrchestratorError(
                    f"Workflow {workflow_id} is not awaiting review (status: {workflow_state.status})"
                )
            
            logger.info(f"Handling review action '{action}' for workflow {workflow_id}")
            
            if action == 'approve':
                return await self._handle_approve(workflow_id, workflow_state, platforms or [])
            
            elif action == 'request_changes':
                if not feedback:
                    raise BlogWorkflowOrchestratorError("Feedback is required for requesting changes")
                return await self._handle_request_changes(workflow_id, workflow_state, feedback)
            
            elif action == 'decline':
                return await self._handle_decline(workflow_id, workflow_state)
            
            else:
                raise BlogWorkflowOrchestratorError(f"Invalid action: {action}")
                
        except Exception as e:
            logger.error(f"Error handling review action: {e}", exc_info=True)
            raise BlogWorkflowOrchestratorError(f"Failed to handle review action: {e}")
    
    async def _handle_approve(
        self,
        workflow_id: str,
        workflow_state: WorkflowStateModel,
        platforms: List[str]
    ) -> WorkflowResult:
        """Handle approve action"""
        logger.info(f"Approving workflow {workflow_id} for platforms: {platforms}")
        
        # Update workflow state
        workflow_state.status = WorkflowStatus.COMPLETED.value
        workflow_state.updated_at = datetime.now()
        
        db = next(get_db())
        db.commit()
        
        # Update draft article status
        draft = db.query(DraftArticle).filter(
            DraftArticle.workflow_id == workflow_id
        ).first()
        
        if draft:
            draft.status = 'approved'
            draft.updated_at = datetime.now()
            db.commit()
        
        # Emit progress
        await self.emit_progress(
            workflow_id, 'review', AgentStatus.COMPLETED, 100,
            "Article approved for publishing"
        )
        
        # Get compiled article from agent results
        agent_results = workflow_state.agent_results or {}
        compiled_article = agent_results.get('compiler')
        
        return WorkflowResult(
            workflow_id=workflow_id,
            status=WorkflowStatus.COMPLETED,
            article=compiled_article,
            agent_results=agent_results
        )
    
    async def _handle_decline(
        self,
        workflow_id: str,
        workflow_state: WorkflowStateModel
    ) -> WorkflowResult:
        """Handle decline action"""
        logger.info(f"Declining workflow {workflow_id}")
        
        # Update workflow state
        workflow_state.status = WorkflowStatus.CANCELLED.value
        workflow_state.updated_at = datetime.now()
        
        db = next(get_db())
        db.commit()
        
        # Update draft article status
        draft = db.query(DraftArticle).filter(
            DraftArticle.workflow_id == workflow_id
        ).first()
        
        if draft:
            draft.status = 'declined'
            draft.updated_at = datetime.now()
            db.commit()
        
        # Emit progress
        await self.emit_progress(
            workflow_id, 'review', AgentStatus.COMPLETED, 100,
            "Article declined and saved as draft"
        )
        
        return WorkflowResult(
            workflow_id=workflow_id,
            status=WorkflowStatus.CANCELLED,
            agent_results=workflow_state.agent_results or {}
        )
    
    async def _handle_request_changes(
        self,
        workflow_id: str,
        workflow_state: WorkflowStateModel,
        feedback: str
    ) -> WorkflowResult:
        """Handle request changes action with iteration"""
        logger.info(f"Requesting changes for workflow {workflow_id}")
        
        # Check iteration count
        if workflow_state.iteration_count >= 3:
            raise BlogWorkflowOrchestratorError(
                "Maximum iteration count (3) reached. Please approve or decline."
            )
        
        # Increment iteration count
        workflow_state.iteration_count += 1
        workflow_state.updated_at = datetime.now()
        
        db = next(get_db())
        db.commit()
        
        logger.info(f"Starting iteration {workflow_state.iteration_count} for workflow {workflow_id}")
        
        # Emit progress
        await self.emit_progress(
            workflow_id, 'iteration', AgentStatus.RUNNING, 0,
            f"Starting iteration {workflow_state.iteration_count}/3 based on feedback"
        )
        
        # Analyze feedback to determine which agents to re-run
        agents_to_rerun = await self._analyze_feedback(feedback)
        
        logger.info(f"Agents to re-run: {agents_to_rerun}")
        
        # Get previous agent results
        agent_results = workflow_state.agent_results or {}
        
        # Re-run specific agents based on feedback
        updated_results = await self._iterate_agents(
            workflow_id=workflow_id,
            agents_to_rerun=agents_to_rerun,
            feedback=feedback,
            previous_results=agent_results
        )
        
        # Update agent results
        agent_results.update(updated_results)
        workflow_state.agent_results = agent_results
        
        # Always recompile after changes
        await self.emit_progress(
            workflow_id, 'compiler', AgentStatus.RUNNING, 80,
            "Recompiling article with changes..."
        )
        
        compiled_article = await self.agents['compiler'].execute(
            article_draft=agent_results.get('writer'),
            seo_result=agent_results.get('seo'),
            feature_image_result=agent_results.get('feature_image'),
            supporting_images_result=agent_results.get('image_finder')
        )
        
        agent_results['compiler'] = compiled_article
        workflow_state.agent_results = agent_results
        
        await self.emit_progress(
            workflow_id, 'compiler', AgentStatus.COMPLETED, 100,
            "Article recompiled successfully"
        )
        
        # Update workflow state back to awaiting review
        workflow_state.status = WorkflowStatus.AWAITING_REVIEW.value
        db.commit()
        
        # Update draft article
        draft = db.query(DraftArticle).filter(
            DraftArticle.workflow_id == workflow_id
        ).first()
        
        if draft:
            draft.title = compiled_article.title
            draft.content_html = compiled_article.content_html
            draft.content_markdown = compiled_article.content_markdown
            draft.meta_description = compiled_article.meta_description
            draft.seo_score = compiled_article.seo_score
            draft.readability_score = compiled_article.readability_score
            draft.word_count = compiled_article.word_count
            draft.updated_at = datetime.now()
            db.commit()
        
        logger.info(f"Iteration {workflow_state.iteration_count} completed for workflow {workflow_id}")
        
        return WorkflowResult(
            workflow_id=workflow_id,
            status=WorkflowStatus.AWAITING_REVIEW,
            article=compiled_article,
            agent_results=agent_results
        )
    
    async def _analyze_feedback(self, feedback: str) -> List[str]:
        """
        Analyze user feedback using Smart Feedback Analyzer
        
        Returns list of agents for backward compatibility,
        but the real logic now uses targeted changes
        """
        try:
            from blog_team.utils.smart_feedback_analyzer import analyze_change_request
            
            # Use smart analyzer
            change_request = analyze_change_request(feedback)
            
            logger.info(f"Smart analysis result: {change_request.change_type.value} "
                       f"(confidence: {change_request.confidence_score:.2f}, "
                       f"agents: {change_request.agents_needed}, "
                       f"time: {change_request.estimated_time_seconds}s)")
            
            return change_request.agents_needed
            
        except Exception as e:
            logger.error(f"Error in smart feedback analysis: {e}")
            # Fallback to simple analysis
            return await self._simple_feedback_analysis(feedback)
    
    async def _simple_feedback_analysis(self, feedback: str) -> List[str]:
        """
        Simple fallback feedback analysis
        """
        feedback_lower = feedback.lower()
        agents_to_rerun = []
        
        # Check for content/writing changes
        content_keywords = ['content', 'writing', 'text', 'paragraph', 'section', 'rewrite', 'tone']
        if any(keyword in feedback_lower for keyword in content_keywords):
            agents_to_rerun.append('writer')
        
        # Check for SEO changes
        seo_keywords = ['seo', 'keyword', 'meta', 'description', 'optimize']
        if any(keyword in feedback_lower for keyword in seo_keywords):
            if 'seo' not in agents_to_rerun:
                agents_to_rerun.append('seo')
            if 'writer' not in agents_to_rerun:
                agents_to_rerun.append('writer')
        
        # Check for image changes
        image_keywords = ['image', 'picture', 'photo', 'visual', 'illustration']
        if any(keyword in feedback_lower for keyword in image_keywords):
            if 'feature' in feedback_lower or 'main' in feedback_lower:
                agents_to_rerun.append('feature_image')
            else:
                agents_to_rerun.append('image_finder')
        
        # Check for title changes
        title_keywords = ['title', 'heading', 'headline']
        if any(keyword in feedback_lower for keyword in title_keywords):
            if 'writer' not in agents_to_rerun:
                agents_to_rerun.append('writer')
        
        # If no specific agents identified, default to writer
        if not agents_to_rerun:
            agents_to_rerun.append('writer')
        
        return agents_to_rerun
    
    async def _iterate_agents(
        self,
        workflow_id: str,
        agents_to_rerun: List[str],
        feedback: str,
        previous_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Re-run specific agents based on feedback
        
        Args:
            workflow_id: Workflow ID
            agents_to_rerun: List of agent names to re-run
            feedback: User feedback
            previous_results: Previous agent results
            
        Returns:
            Updated agent results
        """
        updated_results = {}
        
        for agent_name in agents_to_rerun:
            try:
                await self.emit_progress(
                    workflow_id, agent_name, AgentStatus.RUNNING, 50,
                    f"Re-running {agent_name} based on feedback..."
                )
                
                if agent_name == 'writer':
                    # Re-run writer with feedback
                    result = await self.agents['writer'].execute(
                        research_result=previous_results.get('research'),
                        seo_result=previous_results.get('seo'),
                        target_word_count=previous_results.get('writer').word_count,
                        tone=previous_results.get('writer').tone,
                        feedback=feedback  # Pass feedback to writer
                    )
                    updated_results['writer'] = result
                
                elif agent_name == 'seo':
                    # Re-run SEO analysis
                    result = await self.agents['seo'].execute(
                        previous_results.get('research')
                    )
                    updated_results['seo'] = result
                
                elif agent_name == 'feature_image':
                    # Re-generate feature image
                    writer_result = updated_results.get('writer') or previous_results.get('writer')
                    result = await self.agents['feature_image'].execute(
                        title=writer_result.title,
                        topic=writer_result.title
                    )
                    updated_results['feature_image'] = result
                
                elif agent_name == 'image_finder':
                    # Re-find supporting images
                    writer_result = updated_results.get('writer') or previous_results.get('writer')
                    result = await self.agents['image_finder'].execute(
                        article_sections=writer_result.sections
                    )
                    updated_results['image_finder'] = result
                
                await self.emit_progress(
                    workflow_id, agent_name, AgentStatus.COMPLETED, 70,
                    f"{agent_name} completed successfully"
                )
                
            except Exception as e:
                logger.error(f"Error re-running {agent_name}: {e}")
                await self.emit_progress(
                    workflow_id, agent_name, AgentStatus.FAILED, 0,
                    f"Failed to re-run {agent_name}",
                    error=str(e)
                )
                raise
        
        return updated_results
    
    # Error Handling and Recovery Methods
    # ====================================
    
    async def execute_with_retry(
        self,
        agent_name: str,
        execute_func: Callable,
        workflow_id: Optional[str] = None,
        *args,
        **kwargs
    ) -> Any:
        """
        Execute an agent with retry logic for transient failures
        
        Args:
            agent_name: Name of the agent
            execute_func: Agent execute function
            workflow_id: Workflow ID for progress tracking
            *args, **kwargs: Arguments to pass to execute function
            
        Returns:
            Agent execution result
            
        Raises:
            Exception after max retries exceeded
        """
        last_exception = None
        
        for attempt in range(self.max_retries):
            try:
                logger.info(f"Executing {agent_name} (attempt {attempt + 1}/{self.max_retries})")
                
                result = await execute_func(*args, **kwargs)
                
                if attempt > 0:
                    logger.info(f"{agent_name} succeeded after {attempt + 1} attempts")
                
                return result
                
            except Exception as e:
                last_exception = e
                logger.warning(
                    f"{agent_name} failed on attempt {attempt + 1}/{self.max_retries}: {e}"
                )
                
                # Check if error is retryable
                if not self._is_retryable_error(e):
                    logger.error(f"{agent_name} failed with non-retryable error: {e}")
                    raise
                
                # Emit progress update
                if workflow_id:
                    await self.emit_progress(
                        workflow_id, agent_name, AgentStatus.RUNNING, 0,
                        f"Retrying after error (attempt {attempt + 1}/{self.max_retries})...",
                        error=str(e)
                    )
                
                # Wait before retry (exponential backoff)
                if attempt < self.max_retries - 1:
                    delay = self.retry_delay * (2 ** attempt)
                    logger.info(f"Waiting {delay}s before retry...")
                    await asyncio.sleep(delay)
        
        # All retries exhausted
        logger.error(f"{agent_name} failed after {self.max_retries} attempts")
        raise last_exception
    
    def _is_retryable_error(self, error: Exception) -> bool:
        """
        Determine if an error is retryable
        
        Retryable errors include:
        - Network errors (connection, timeout)
        - API rate limits
        - Temporary service unavailability
        
        Non-retryable errors include:
        - Authentication errors
        - Invalid input errors
        - Logic errors
        """
        error_str = str(error).lower()
        error_type = type(error).__name__
        
        # Retryable error patterns
        retryable_patterns = [
            'timeout',
            'connection',
            'network',
            'rate limit',
            'too many requests',
            'service unavailable',
            'temporarily unavailable',
            '429',  # HTTP 429 Too Many Requests
            '503',  # HTTP 503 Service Unavailable
            '504',  # HTTP 504 Gateway Timeout
        ]
        
        # Non-retryable error patterns
        non_retryable_patterns = [
            'authentication',
            'unauthorized',
            'forbidden',
            'invalid',
            'not found',
            '401',  # HTTP 401 Unauthorized
            '403',  # HTTP 403 Forbidden
            '404',  # HTTP 404 Not Found
        ]
        
        # Check non-retryable first
        if any(pattern in error_str for pattern in non_retryable_patterns):
            return False
        
        # Check retryable
        if any(pattern in error_str for pattern in retryable_patterns):
            return True
        
        # Default: retry for common network exceptions
        retryable_types = [
            'TimeoutError',
            'ConnectionError',
            'HTTPError',
        ]
        
        return error_type in retryable_types
    
    async def save_partial_results(
        self,
        workflow_id: str,
        agent_name: str,
        result: Any
    ) -> None:
        """
        Save partial results after each agent completes
        Enables recovery from failures
        
        Args:
            workflow_id: Workflow ID
            agent_name: Name of the agent that completed
            result: Agent result to save
        """
        try:
            # Update in-memory state
            if workflow_id in self.workflow_states:
                self.workflow_states[workflow_id]['agent_results'][agent_name] = result.to_dict() if hasattr(result, 'to_dict') else result
            
            # Update database
            db = next(get_db())
            workflow_state = db.query(WorkflowStateModel).filter(
                WorkflowStateModel.workflow_id == workflow_id
            ).first()
            
            if workflow_state:
                agent_results = workflow_state.agent_results or {}
                agent_results[agent_name] = result.to_dict() if hasattr(result, 'to_dict') else result
                workflow_state.agent_results = agent_results
                workflow_state.current_agent = agent_name
                workflow_state.updated_at = datetime.now()
                db.commit()
                
                logger.info(f"Saved partial results for {agent_name} in workflow {workflow_id}")
            
        except Exception as e:
            logger.error(f"Error saving partial results: {e}")
            # Don't raise - partial save failure shouldn't stop workflow
    
    async def resume_workflow(
        self,
        workflow_id: str
    ) -> WorkflowResult:
        """
        Resume a failed workflow from the last successful checkpoint
        
        Args:
            workflow_id: Workflow ID to resume
            
        Returns:
            WorkflowResult
        """
        try:
            logger.info(f"Attempting to resume workflow {workflow_id}")
            
            # Load workflow state from database
            db = next(get_db())
            workflow_state = db.query(WorkflowStateModel).filter(
                WorkflowStateModel.workflow_id == workflow_id
            ).first()
            
            if not workflow_state:
                raise BlogWorkflowOrchestratorError(f"Workflow {workflow_id} not found")
            
            if workflow_state.status not in [WorkflowStatus.FAILED.value, WorkflowStatus.RUNNING.value]:
                raise BlogWorkflowOrchestratorError(
                    f"Workflow {workflow_id} cannot be resumed (status: {workflow_state.status})"
                )
            
            # Restore agent results
            agent_results = workflow_state.agent_results or {}
            current_agent = workflow_state.current_agent
            
            logger.info(f"Resuming from agent: {current_agent}")
            logger.info(f"Completed agents: {list(agent_results.keys())}")
            
            # Determine which agents still need to run
            all_agents = ['research', 'seo', 'writer', 'feature_image', 'image_finder', 'compiler']
            completed_agents = list(agent_results.keys())
            remaining_agents = [a for a in all_agents if a not in completed_agents]
            
            if not remaining_agents:
                logger.info("All agents completed, moving to compilation")
                # All agents done, just need compilation
                if 'compiler' not in completed_agents:
                    remaining_agents = ['compiler']
            
            # Update workflow state to running
            workflow_state.status = WorkflowStatus.RUNNING.value
            db.commit()
            
            # Continue execution from where it left off
            # This is a simplified resume - in production, you'd want more sophisticated logic
            logger.info(f"Remaining agents to execute: {remaining_agents}")
            
            # For now, return current state
            # Full resume logic would re-execute remaining agents
            return WorkflowResult(
                workflow_id=workflow_id,
                status=WorkflowStatus.RUNNING,
                agent_results=agent_results
            )
            
        except Exception as e:
            logger.error(f"Error resuming workflow: {e}", exc_info=True)
            raise BlogWorkflowOrchestratorError(f"Failed to resume workflow: {e}")
    
    def get_error_message(self, error: Exception) -> str:
        """
        Generate user-friendly error message
        
        Args:
            error: Exception that occurred
            
        Returns:
            User-friendly error message
        """
        error_str = str(error).lower()
        error_type = type(error).__name__
        
        # Map technical errors to user-friendly messages
        if 'authentication' in error_str or 'unauthorized' in error_str:
            return "Authentication failed. Please check your API credentials."
        
        elif 'rate limit' in error_str or '429' in error_str:
            return "API rate limit exceeded. Please try again in a few minutes."
        
        elif 'timeout' in error_str:
            return "Request timed out. Please try again."
        
        elif 'connection' in error_str or 'network' in error_str:
            return "Network connection error. Please check your internet connection."
        
        elif 'not found' in error_str or '404' in error_str:
            return "Resource not found. Please check your configuration."
        
        elif 'service unavailable' in error_str or '503' in error_str:
            return "Service temporarily unavailable. Please try again later."
        
        else:
            # Generic error message
            return f"An error occurred: {error_type}. Please try again or contact support."
    
    async def handle_agent_failure(
        self,
        workflow_id: str,
        agent_name: str,
        error: Exception
    ) -> None:
        """
        Handle agent failure with appropriate logging and notifications
        
        Args:
            workflow_id: Workflow ID
            agent_name: Name of the failed agent
            error: Exception that occurred
        """
        logger.error(f"Agent {agent_name} failed in workflow {workflow_id}: {error}", exc_info=True)
        
        # Get user-friendly error message
        error_message = self.get_error_message(error)
        
        # Emit failure progress
        await self.emit_progress(
            workflow_id, agent_name, AgentStatus.FAILED, 0,
            error_message,
            error=str(error)
        )
        
        # Update workflow state
        if workflow_id in self.workflow_states:
            self.workflow_states[workflow_id]['status'] = WorkflowStatus.FAILED
            self.workflow_states[workflow_id]['errors'].append({
                'agent': agent_name,
                'error': str(error),
                'message': error_message,
                'timestamp': datetime.now().isoformat()
            })
        
        # Save to database
        try:
            db = next(get_db())
            workflow_state = db.query(WorkflowStateModel).filter(
                WorkflowStateModel.workflow_id == workflow_id
            ).first()
            
            if workflow_state:
                workflow_state.status = WorkflowStatus.FAILED.value
                workflow_state.updated_at = datetime.now()
                db.commit()
        except Exception as db_error:
            logger.error(f"Error updating workflow state in database: {db_error}")
    # Smart Targeted Changes Methods
    # ==============================
    
    async def execute_smart_change(
        self,
        workflow_id: str,
        change_type: str,
        user_request: str,
        current_article: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a smart targeted change instead of full workflow rerun
        
        Args:
            workflow_id: Original workflow ID
            change_type: Type of change (title_only, feature_image, etc.)
            user_request: User's specific request
            current_article: Current article data
            
        Returns:
            Dict with success status and updated article
        """
        try:
            # Import smart targeted methods
            from blog_team.agents.targeted_agent_methods import execute_targeted_update
            
            # Create new workflow ID for the targeted change
            smart_workflow_id = f"{workflow_id}_smart_{change_type}_{uuid.uuid4().hex[:8]}"
            
            logger.info(f"Starting smart change: {change_type} for workflow {workflow_id}")
            
            # Emit progress start
            await self.emit_progress(
                smart_workflow_id,
                "smart_analyzer",
                AgentStatus.RUNNING,
                10,
                f"Analyzing request: {user_request[:50]}...",
                {}
            )
            
            # Execute the targeted update
            result = await execute_targeted_update(
                change_type=change_type,
                current_article=current_article,
                user_request=user_request,
                workflow_id=smart_workflow_id
            )
            
            if result.success:
                # Emit progress completion
                await self.emit_progress(
                    smart_workflow_id,
                    result.agent_name,
                    AgentStatus.COMPLETED,
                    100,
                    result.message,
                    result.updated_content
                )
                
                # Update the draft article in database
                await self._update_draft_article(workflow_id, result.updated_content)
                
                logger.info(f"Smart change completed successfully: {change_type}")
                
                return {
                    'success': True,
                    'message': result.message,
                    'updated_article': result.updated_content,
                    'execution_time': result.execution_time_seconds,
                    'change_type': change_type,
                    'smart_workflow_id': smart_workflow_id
                }
            else:
                # Emit progress failure
                await self.emit_progress(
                    smart_workflow_id,
                    result.agent_name,
                    AgentStatus.FAILED,
                    0,
                    f"Failed: {result.message}",
                    {}
                )
                
                logger.error(f"Smart change failed: {result.message}")
                
                return {
                    'success': False,
                    'message': result.message,
                    'error': 'Targeted update failed',
                    'change_type': change_type
                }
                
        except Exception as e:
            logger.error(f"Error executing smart change: {e}")
            
            # Emit progress failure
            await self.emit_progress(
                smart_workflow_id if 'smart_workflow_id' in locals() else workflow_id,
                "smart_analyzer",
                AgentStatus.FAILED,
                0,
                f"Error: {str(e)}",
                {}
            )
            
            return {
                'success': False,
                'message': f"Smart change failed: {str(e)}",
                'error': str(e),
                'change_type': change_type
            }
    
    async def analyze_change_request(self, feedback: str) -> Dict[str, Any]:
        """
        Analyze user feedback to determine if smart changes can be applied
        
        Args:
            feedback: User's feedback text
            
        Returns:
            Dict with analysis results and change recommendations
        """
        try:
            # Import smart feedback analyzer
            from blog_team.utils.smart_feedback_analyzer import analyze_change_request
            
            # Analyze the feedback
            change_request = analyze_change_request(feedback)
            
            logger.info(f"Analyzed feedback: {change_request.change_type.value} (confidence: {change_request.confidence_score:.2f})")
            
            return {
                'success': True,
                'change_type': change_request.change_type.value,
                'specific_target': change_request.specific_target,
                'new_requirements': change_request.new_requirements,
                'agents_needed': change_request.agents_needed,
                'estimated_time_seconds': change_request.estimated_time_seconds,
                'confidence_score': change_request.confidence_score,
                'is_smart_change': change_request.confidence_score >= 0.3,  # Threshold for smart changes
                'recommendation': 'smart_change' if change_request.confidence_score >= 0.3 else 'full_rewrite'
            }
            
        except Exception as e:
            logger.error(f"Error analyzing change request: {e}")
            return {
                'success': False,
                'error': str(e),
                'recommendation': 'full_rewrite'
            }
    
    async def _update_draft_article(self, workflow_id: str, updated_content: Dict[str, Any]) -> None:
        """Update the draft article in database with new content"""
        try:
            db = next(get_db())
            
            logger.info(f"Updating draft article for workflow {workflow_id}")
            logger.info(f"Updated content: {updated_content}")
            
            # Find the draft article
            draft_article = db.query(DraftArticle).filter(
                DraftArticle.workflow_id == workflow_id
            ).first()
            
            if draft_article:
                # Get current content as dict, handle null case
                current_content = draft_article.content if draft_article.content and isinstance(draft_article.content, dict) else {}
                
                logger.info(f"Current content before update: {current_content}")
                
                # Update the title
                draft_article.title = updated_content.get('title', draft_article.title)
                
                # Update the content JSON with new data in the correct format expected by the API
                # CRITICAL FIX: Only update fields that are explicitly provided in updated_content
                # Preserve existing content for fields not being changed
                # BUT allow content updates when explicitly provided (for title/image changes in HTML)
                updated_content_dict = {
                    # Update content if provided (for title/image changes), otherwise preserve
                    'content_html': updated_content.get('content', current_content.get('content_html', current_content.get('content', ''))),
                    'content_markdown': current_content.get('content_markdown', current_content.get('content', '')),
                    'meta_description': updated_content.get('meta_description', current_content.get('meta_description', '')),
                    'feature_image': updated_content.get('feature_image', current_content.get('feature_image')),
                    'supporting_images': updated_content.get('supporting_images', current_content.get('supporting_images', [])),
                    'word_count': current_content.get('word_count', 0),
                    'seo_score': current_content.get('seo_score', 0),
                    'readability_score': current_content.get('readability_score', 0),
                    'quality_checks': current_content.get('quality_checks', []),
                    'keyword_usage': current_content.get('keyword_usage', {}),
                    'updated_at': datetime.now().isoformat()
                }
                
                logger.info(f"New content to save: {updated_content_dict}")
                
                # Save the updated content back to the draft
                draft_article.content = updated_content_dict
                draft_article.updated_at = datetime.now()
                db.commit()
                
                logger.info(f"Successfully updated draft article for workflow {workflow_id}")
                logger.info(f"New content: {current_content}")
            else:
                logger.warning(f"No draft article found for workflow {workflow_id}")
                
        except Exception as e:
            logger.error(f"Error updating draft article: {e}")