"""
SQLAlchemy ORM models for Blog Writing Team
Requirements: 12.11, 15.2
"""
from sqlalchemy import (
    Column, Integer, String, Text, TIMESTAMP, JSON,
    CheckConstraint, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, Dict, Any
from .database import Base


class UserIntegration(Base):
    """
    User platform integration model
    Stores encrypted credentials for publishing platforms
    """
    __tablename__ = "user_integrations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    platform = Column(String(50), nullable=False, index=True)
    status = Column(String(20), nullable=False, default='disconnected', index=True)
    encrypted_credentials = Column(Text, nullable=False)
    platform_metadata = Column(JSON, nullable=True)
    last_sync_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Table constraints
    __table_args__ = (
        CheckConstraint(
            platform.in_(['wordpress', 'shopify', 'facebook', 'twitter']),
            name='user_integrations_platform_check'
        ),
        CheckConstraint(
            status.in_(['connected', 'disconnected', 'error']),
            name='user_integrations_status_check'
        ),
        Index('idx_user_integrations_user_platform', 'user_id', 'platform', unique=True),
    )
    
    def __repr__(self):
        return f"<UserIntegration(id={self.id}, user_id={self.user_id}, platform={self.platform}, status={self.status})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'platform': self.platform,
            'status': self.status,
            'platform_metadata': self.platform_metadata,
            'last_sync_at': self.last_sync_at.isoformat() if self.last_sync_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def is_connected(self) -> bool:
        """Check if integration is connected"""
        return self.status == 'connected'
    
    def mark_synced(self):
        """Update last sync timestamp"""
        self.last_sync_at = datetime.now()


class WorkflowState(Base):
    """
    Workflow execution state model
    Tracks blog writing workflow progress and results
    """
    __tablename__ = "workflow_state"
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String(100), nullable=False, unique=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    status = Column(String(20), nullable=False, default='running', index=True)
    request_data = Column(JSON, nullable=False)
    current_agent = Column(String(50), nullable=True)
    agent_results = Column(JSON, nullable=False, default={})
    article_data = Column(JSON, nullable=True)
    iteration_count = Column(Integer, nullable=False, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), index=True)
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    drafts = relationship("DraftArticle", back_populates="workflow", cascade="all, delete-orphan")
    
    # Table constraints
    __table_args__ = (
        CheckConstraint(
            status.in_(['running', 'completed', 'failed', 'awaiting_review', 'declined']),
            name='workflow_state_status_check'
        ),
        CheckConstraint(
            'iteration_count >= 0 AND iteration_count <= 3',
            name='workflow_state_iteration_check'
        ),
    )
    
    def __repr__(self):
        return f"<WorkflowState(id={self.id}, workflow_id={self.workflow_id}, status={self.status}, current_agent={self.current_agent})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'workflow_id': self.workflow_id,
            'user_id': self.user_id,
            'status': self.status,
            'request_data': self.request_data,
            'current_agent': self.current_agent,
            'agent_results': self.agent_results,
            'article_data': self.article_data,
            'iteration_count': self.iteration_count,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def set_agent_result(self, agent_name: str, result: Dict[str, Any]):
        """Store result from an agent"""
        if not self.agent_results:
            self.agent_results = {}
        self.agent_results[agent_name] = result
    
    def get_agent_result(self, agent_name: str) -> Optional[Dict[str, Any]]:
        """Get result from a specific agent"""
        if not self.agent_results:
            return None
        return self.agent_results.get(agent_name)
    
    def increment_iteration(self):
        """Increment iteration count"""
        if self.iteration_count is None:
            self.iteration_count = 0
        if self.iteration_count < 3:
            self.iteration_count += 1
        else:
            raise ValueError("Maximum iteration count (3) reached")
    
    def can_iterate(self) -> bool:
        """Check if workflow can iterate"""
        if self.iteration_count is None:
            return True
        return self.iteration_count < 3
    
    def set_awaiting_review(self, article_data: Dict[str, Any]):
        """Set workflow to awaiting review status"""
        self.status = 'awaiting_review'
        self.article_data = article_data
        self.current_agent = None
    
    def set_completed(self):
        """Mark workflow as completed"""
        self.status = 'completed'
        self.current_agent = None
    
    def set_failed(self, error_message: str):
        """Mark workflow as failed"""
        self.status = 'failed'
        self.error_message = error_message
        self.current_agent = None
    
    def set_declined(self):
        """Mark workflow as declined"""
        self.status = 'declined'
        self.current_agent = None


class WorkflowProgress(Base):
    """
    Workflow progress tracking model
    Stores real-time agent work progress for historical viewing
    """
    __tablename__ = "workflow_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String(100), nullable=False, index=True)
    agent_name = Column(String(50), nullable=False)
    progress_type = Column(String(20), nullable=False)  # 'search', 'analysis', 'generation', 'processing', 'compilation'
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    work_metadata = Column('metadata', JSON, nullable=True)  # Store sources, URLs, keywords, etc.
    timestamp = Column(TIMESTAMP, nullable=False, server_default=func.now())
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    
    # Table constraints
    __table_args__ = (
        CheckConstraint(
            progress_type.in_(['search', 'analysis', 'generation', 'processing', 'compilation']),
            name='workflow_progress_type_check'
        ),
        Index('idx_workflow_progress_workflow_timestamp', 'workflow_id', 'timestamp'),
    )
    
    def __repr__(self):
        return f"<WorkflowProgress(id={self.id}, workflow_id={self.workflow_id}, agent={self.agent_name}, type={self.progress_type})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'workflow_id': self.workflow_id,
            'agent_name': self.agent_name,
            'progress_type': self.progress_type,
            'title': self.title,
            'content': self.content,
            'metadata': self.work_metadata,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class DraftArticle(Base):
    """
    Draft article model
    Stores saved/declined articles for later editing
    """
    __tablename__ = "draft_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    workflow_id = Column(String(100), ForeignKey('workflow_state.workflow_id', ondelete='CASCADE'), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    content = Column(JSON, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), index=True)
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    workflow = relationship("WorkflowState", back_populates="drafts")
    
    def __repr__(self):
        return f"<DraftArticle(id={self.id}, user_id={self.user_id}, title={self.title[:50]})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'workflow_id': self.workflow_id,
            'title': self.title,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def get_preview(self, max_length: int = 200) -> str:
        """Get article preview text"""
        if self.content and 'introduction' in self.content:
            intro = self.content['introduction']
            if len(intro) > max_length:
                return intro[:max_length] + '...'
            return intro
        return ''
    
    def get_word_count(self) -> int:
        """Get article word count"""
        if self.content and 'word_count' in self.content:
            return self.content['word_count']
        return 0
