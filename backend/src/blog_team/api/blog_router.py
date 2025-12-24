"""
Blog Workflow API Router
REST API endpoints for blog writing workflow
Requirements: 1.4, 8.6, 15.4, 15.5
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
import logging

from blog_team.orchestration import (
    BlogWorkflowOrchestrator,
    BlogRequest,
    WorkflowStatus
)
from blog_team.models.database import get_db
from blog_team.models.orm_models import WorkflowState, DraftArticle, WorkflowProgress
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/blog", tags=["blog"])

# Global orchestrator instance
orchestrator = BlogWorkflowOrchestrator()


# Request/Response Models
# ========================

class CreateBlogRequest(BaseModel):
    """Request to create a new blog article"""
    topic: Optional[str] = Field(None, description="Blog topic or title")
    reference_urls: List[str] = Field(default_factory=list, description="Reference URLs for research")
    target_word_count: int = Field(1500, ge=500, le=5000, description="Target word count")
    tone: str = Field("professional", description="Writing tone (professional, casual, technical, etc.)")
    additional_instructions: Optional[str] = Field(None, description="Additional instructions for the writer")
    
    class Config:
        json_schema_extra = {
            "example": {
                "topic": "The Future of AI in Healthcare",
                "reference_urls": ["https://example.com/ai-healthcare"],
                "target_word_count": 1500,
                "tone": "professional",
                "additional_instructions": "Focus on practical applications"
            }
        }


class CreateBlogResponse(BaseModel):
    """Response after creating blog workflow"""
    workflow_id: str
    status: str
    message: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "workflow_id": "abc-123-def-456",
                "status": "running",
                "message": "Blog workflow started successfully"
            }
        }


class WorkflowStatusResponse(BaseModel):
    """Workflow status response"""
    workflow_id: str
    status: str
    current_agent: Optional[str]
    progress_percentage: int
    agent_results: dict
    iteration_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "workflow_id": "abc-123",
                "status": "awaiting_review",
                "current_agent": "compiler",
                "progress_percentage": 100,
                "agent_results": {},
                "iteration_count": 0,
                "created_at": "2025-10-14T10:00:00",
                "updated_at": "2025-10-14T10:05:00"
            }
        }


class ReviewActionRequest(BaseModel):
    """Request to review article"""
    action: str = Field(..., description="Action: approve, request_changes, or decline")
    feedback: Optional[str] = Field(None, description="Feedback for changes (required for request_changes)")
    platforms: List[str] = Field(default_factory=list, description="Publishing platforms (for approve)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "action": "request_changes",
                "feedback": "Please make the tone more casual and add more examples",
                "platforms": []
            }
        }


class ReviewActionResponse(BaseModel):
    """Response after review action"""
    workflow_id: str
    status: str
    message: str
    iteration_count: Optional[int] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "workflow_id": "abc-123",
                "status": "awaiting_review",
                "message": "Changes applied successfully. Article ready for review.",
                "iteration_count": 1
            }
        }


class DraftArticleResponse(BaseModel):
    """Draft article response"""
    id: int
    workflow_id: str
    title: str
    content_html: str
    content_markdown: str
    meta_description: str
    feature_image_url: Optional[str]
    seo_score: float
    readability_score: float
    word_count: int
    keyword_usage: dict = {}
    quality_checks: list = []
    status: str
    created_at: datetime
    updated_at: datetime


# Helper Functions
# ================

def get_current_user_id() -> int:
    """
    Get current user ID from authentication
    TODO: Implement proper authentication
    For now, return a test user ID
    """
    return 1


# API Endpoints
# =============

@router.post("/create", response_model=CreateBlogResponse, status_code=202)
async def create_blog_workflow(
    request: CreateBlogRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Create a new blog writing workflow
    
    This endpoint starts the blog writing workflow in the background.
    The workflow will execute all agents sequentially and in parallel where possible.
    
    Returns immediately with a workflow_id that can be used to track progress.
    """
    try:
        # Get user ID (from auth in production)
        user_id = get_current_user_id()
        
        # Validate request
        if not request.topic and not request.reference_urls:
            raise HTTPException(
                status_code=400,
                detail="Either topic or reference_urls must be provided"
            )
        
        logger.info(f"Creating blog workflow for user {user_id}")
        logger.info(f"Topic: {request.topic}, URLs: {len(request.reference_urls)}")
        
        # Create blog request
        blog_request = BlogRequest(
            topic=request.topic,
            reference_urls=request.reference_urls,
            target_word_count=request.target_word_count,
            tone=request.tone,
            additional_instructions=request.additional_instructions,
            user_id=user_id
        )
        
        # Generate workflow ID upfront
        import uuid
        workflow_id = str(uuid.uuid4())
        
        # Store workflow ID in blog request
        blog_request.user_id = user_id
        
        # Execute workflow in background
        async def run_workflow():
            try:
                # Pass the workflow_id to the orchestrator
                result = await orchestrator.execute_workflow(blog_request, user_id, workflow_id=workflow_id)
                logger.info(f"Workflow {result.workflow_id} completed with status: {result.status}")
                
                # Send WebSocket completion event
                from blog_team.api.websocket_manager import get_connection_manager
                ws_manager = get_connection_manager()
                await ws_manager.send_workflow_completed(
                    result.workflow_id,
                    result.status.value,
                    "Workflow completed successfully"
                )
            except Exception as e:
                logger.error(f"Workflow execution failed: {e}", exc_info=True)
                # Send WebSocket error event
                try:
                    from blog_team.api.websocket_manager import get_connection_manager
                    ws_manager = get_connection_manager()
                    await ws_manager.send_workflow_error(
                        workflow_id,
                        str(e),
                        "Workflow execution failed"
                    )
                except:
                    pass
        
        background_tasks.add_task(run_workflow)
        
        # Return immediately with workflow info
        return CreateBlogResponse(
            workflow_id=workflow_id,
            status="starting",
            message=f"Blog workflow started. Connect to ws://localhost:8000/ws/blog/{workflow_id} for real-time updates."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating blog workflow: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create blog workflow: {str(e)}"
        )


@router.get("/{workflow_id}/status", response_model=WorkflowStatusResponse)
async def get_workflow_status(
    workflow_id: str,
    db: Session = Depends(get_db)
):
    """
    Get the current status of a blog workflow
    
    Returns detailed information about the workflow including:
    - Current status (running, awaiting_review, completed, failed)
    - Current agent being executed
    - Progress percentage
    - Agent results
    - Iteration count
    """
    try:
        # Get workflow state from database
        workflow_state = db.query(WorkflowState).filter(
            WorkflowState.workflow_id == workflow_id
        ).first()
        
        if not workflow_state:
            raise HTTPException(
                status_code=404,
                detail=f"Workflow {workflow_id} not found"
            )
        
        # Calculate progress percentage based on status
        progress_map = {
            "pending": 0,
            "running": 50,
            "awaiting_review": 100,
            "completed": 100,
            "failed": 0,
            "cancelled": 0
        }
        
        progress_percentage = progress_map.get(workflow_state.status, 0)
        
        return WorkflowStatusResponse(
            workflow_id=workflow_state.workflow_id,
            status=workflow_state.status,
            current_agent=workflow_state.current_agent,
            progress_percentage=progress_percentage,
            agent_results=workflow_state.agent_results or {},
            iteration_count=workflow_state.iteration_count,
            created_at=workflow_state.created_at,
            updated_at=workflow_state.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow status: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get workflow status: {str(e)}"
        )


@router.post("/{workflow_id}/review", response_model=ReviewActionResponse)
async def review_workflow(
    workflow_id: str,
    request: ReviewActionRequest,
    db: Session = Depends(get_db)
):
    """
    Submit a review action for a blog workflow
    
    Actions:
    - approve: Approve the article for publishing
    - request_changes: Request changes with feedback (triggers iteration)
    - decline: Decline the article and save as draft
    
    For request_changes, the system will:
    1. Analyze the feedback
    2. Determine which agents need to re-run
    3. Execute those agents
    4. Recompile the article
    5. Return to awaiting_review status
    
    Maximum 3 iterations are allowed per workflow.
    """
    try:
        # Validate action
        valid_actions = ["approve", "request_changes", "decline"]
        if request.action not in valid_actions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid action. Must be one of: {', '.join(valid_actions)}"
            )
        
        # Validate feedback for request_changes
        if request.action == "request_changes" and not request.feedback:
            raise HTTPException(
                status_code=400,
                detail="Feedback is required for request_changes action"
            )
        
        logger.info(f"Processing review action '{request.action}' for workflow {workflow_id}")
        
        # Handle review action
        result = await orchestrator.handle_review_action(
            workflow_id=workflow_id,
            action=request.action,
            feedback=request.feedback,
            platforms=request.platforms
        )
        
        # Generate response message
        messages = {
            "approve": "Article approved successfully",
            "request_changes": f"Changes applied successfully. Article ready for review (iteration {result.agent_results.get('iteration_count', 0)}/3)",
            "decline": "Article declined and saved as draft"
        }
        
        message = messages.get(request.action, "Review action processed")
        
        # Get updated workflow state
        workflow_state = db.query(WorkflowState).filter(
            WorkflowState.workflow_id == workflow_id
        ).first()
        
        return ReviewActionResponse(
            workflow_id=workflow_id,
            status=result.status.value,
            message=message,
            iteration_count=workflow_state.iteration_count if workflow_state else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing review action: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process review action: {str(e)}"
        )


@router.get("/drafts", response_model=List[DraftArticleResponse])
async def get_draft_articles(
    status: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get list of draft articles
    
    Query parameters:
    - status: Filter by status (draft, approved, declined)
    - limit: Maximum number of results (default: 10)
    - offset: Offset for pagination (default: 0)
    """
    try:
        # Get user ID
        user_id = get_current_user_id()
        
        # Build query
        query = db.query(DraftArticle).filter(
            DraftArticle.user_id == user_id
        )
        
        # Filter by status if provided
        if status:
            query = query.filter(DraftArticle.status == status)
        
        # Order by updated_at descending
        query = query.order_by(DraftArticle.updated_at.desc())
        
        # Apply pagination
        drafts = query.limit(limit).offset(offset).all()
        
        # Convert to response models
        return [
            DraftArticleResponse(
                id=draft.id,
                workflow_id=draft.workflow_id,
                title=draft.title,
                content_html=draft.content.get('content_html', '') if draft.content else '',
                content_markdown=draft.content.get('content_markdown', '') if draft.content else '',
                meta_description=draft.content.get('meta_description', '') if draft.content else '',
                feature_image_url=draft.content.get('feature_image', {}).get('image_url', '') if draft.content else '',
                seo_score=draft.content.get('seo_score', 0.0) if draft.content else 0.0,
                readability_score=draft.content.get('readability_score', 0.0) if draft.content else 0.0,
                word_count=draft.content.get('word_count', 0) if draft.content else 0,
                keyword_usage=draft.content.get('keyword_usage', {}) if draft.content else {},
                quality_checks=draft.content.get('quality_checks', []) if draft.content else [],
                status='draft',  # Default status
                created_at=draft.created_at,
                updated_at=draft.updated_at
            )
            for draft in drafts
        ]
        
    except Exception as e:
        logger.error(f"Error getting draft articles: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get draft articles: {str(e)}"
        )


@router.delete("/drafts/{draft_id}", status_code=204)
async def delete_draft_article(
    draft_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a draft article
    
    This permanently deletes the draft article from the database.
    """
    try:
        # Get user ID
        user_id = get_current_user_id()
        
        # Find draft
        draft = db.query(DraftArticle).filter(
            DraftArticle.id == draft_id,
            DraftArticle.user_id == user_id
        ).first()
        
        if not draft:
            raise HTTPException(
                status_code=404,
                detail=f"Draft article {draft_id} not found"
            )
        
        # Delete draft
        db.delete(draft)
        db.commit()
        
        logger.info(f"Deleted draft article {draft_id}")
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting draft article: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete draft article: {str(e)}"
        )


@router.get("/{workflow_id}/progress")
async def get_workflow_progress(
    workflow_id: str,
    db: Session = Depends(get_db)
):
    """
    Get the complete progress history for a workflow
    
    Returns all agent work progress entries for historical viewing
    """
    try:
        # Get workflow progress entries from database
        progress_entries = db.query(WorkflowProgress).filter(
            WorkflowProgress.workflow_id == workflow_id
        ).order_by(WorkflowProgress.timestamp.asc()).all()
        
        if not progress_entries:
            # Check if workflow exists
            workflow_state = db.query(WorkflowState).filter(
                WorkflowState.workflow_id == workflow_id
            ).first()
            
            if not workflow_state:
                raise HTTPException(
                    status_code=404,
                    detail=f"Workflow {workflow_id} not found"
                )
            
            # Return empty progress for workflows without saved progress
            return {
                "workflow_id": workflow_id,
                "progress_entries": [],
                "total_entries": 0
            }
        
        # Convert to dictionaries
        progress_data = [entry.to_dict() for entry in progress_entries]
        
        return {
            "workflow_id": workflow_id,
            "progress_entries": progress_data,
            "total_entries": len(progress_data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching workflow progress: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch workflow progress: {str(e)}"
        )


@router.post("/{workflow_id}/analyze-feedback")
async def analyze_feedback(
    workflow_id: str,
    request: dict,
    db: Session = Depends(get_db)
):
    """
    Analyze user feedback to determine targeted changes
    
    Returns change analysis with specific agents and estimated time
    """
    try:
        feedback = request.get('feedback', '')
        if not feedback:
            raise HTTPException(status_code=400, detail="Feedback is required")
        
        # Use smart feedback analyzer
        from blog_team.utils.smart_feedback_analyzer import analyze_change_request
        
        change_request = analyze_change_request(feedback)
        
        return {
            "workflow_id": workflow_id,
            "analysis": change_request.to_dict(),
            "message": f"Detected {change_request.change_type.value} change requiring {len(change_request.agents_needed)} agent(s)"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing feedback: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze feedback: {str(e)}"
        )


@router.post("/{workflow_id}/execute-smart-change")
async def execute_smart_change(
    workflow_id: str,
    request: dict,
    db: Session = Depends(get_db)
):
    """
    Execute a smart targeted change instead of full workflow rerun
    
    Request body should contain:
    - change_type: Type of change (title_only, feature_image, etc.)
    - user_request: User's specific request
    """
    try:
        change_type = request.get("change_type")
        user_request = request.get("user_request")
        
        if not change_type or not user_request:
            raise HTTPException(
                status_code=400,
                detail="change_type and user_request are required"
            )
        
        # Get current article data
        draft_article = db.query(DraftArticle).filter(
            DraftArticle.workflow_id == workflow_id
        ).first()
        
        if not draft_article:
            # For testing purposes, create a mock article
            if workflow_id.startswith('test-'):
                current_article = {
                    'title': 'Test Article Title',
                    'content': 'Test article content...',
                    'meta_description': 'Test meta description',
                    'feature_image': {
                        'url': 'https://example.com/test-image.jpg',
                        'alt_text': 'Test image'
                    },
                    'supporting_images': []
                }
            else:
                raise HTTPException(
                    status_code=404,
                    detail=f"No draft article found for workflow {workflow_id}"
                )
        else:
            # Convert draft to article format
            content = draft_article.content if isinstance(draft_article.content, dict) else {}
            current_article = {
                'title': draft_article.title,
                'content': content.get('content', ''),
                'meta_description': content.get('meta_description', ''),
                'feature_image': content.get('feature_image'),
                'supporting_images': content.get('supporting_images', [])
            }
        

        
        # Execute smart change
        try:
            result = await orchestrator.execute_smart_change(
                workflow_id=workflow_id,
                change_type=change_type,
                user_request=user_request,
                current_article=current_article
            )
            
            return result
        except Exception as exec_error:
            logger.error(f"Smart change execution error: {exec_error}", exc_info=True)
            # Return a fallback response instead of crashing
            return {
                'success': False,
                'message': f"Smart change failed: {str(exec_error)}",
                'error': str(exec_error),
                'change_type': change_type,
                'fallback_to_full_workflow': True
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing smart change: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to execute smart change: {str(e)}"
        )


@router.get("/change-suggestions")
async def get_change_suggestions():
    """
    Get common change suggestions for UI
    
    Returns list of quick change options with estimated times
    """
    try:
        from blog_team.utils.smart_feedback_analyzer import get_change_suggestions
        
        suggestions = get_change_suggestions()
        
        return {
            "suggestions": suggestions,
            "message": "Common change types with estimated completion times"
        }
        
    except Exception as e:
        logger.error(f"Error getting change suggestions: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get change suggestions: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "blog-workflow-api"}
