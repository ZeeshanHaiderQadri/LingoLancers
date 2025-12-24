"""
WebSocket Manager for Blog Workflow
Handles real-time progress updates for blog writing workflows
Requirements: 10.1, 10.2, 10.3, 1.5
"""
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set, Any
import json
import logging
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections for workflow updates
    """
    
    def __init__(self):
        # Map of workflow_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket, workflow_id: str):
        """
        Accept and register a new WebSocket connection
        
        Args:
            websocket: WebSocket connection
            workflow_id: Workflow ID to subscribe to
        """
        await websocket.accept()
        
        async with self._lock:
            if workflow_id not in self.active_connections:
                self.active_connections[workflow_id] = set()
            
            self.active_connections[workflow_id].add(websocket)
        
        logger.info(f"WebSocket connected for workflow {workflow_id}. Total connections: {len(self.active_connections[workflow_id])}")
        
        # Send connection confirmation
        await self.send_personal_message(
            {
                "type": "connected",
                "workflow_id": workflow_id,
                "message": "Connected to workflow updates",
                "timestamp": datetime.now().isoformat()
            },
            websocket
        )
    
    async def disconnect(self, websocket: WebSocket, workflow_id: str):
        """
        Remove a WebSocket connection
        
        Args:
            websocket: WebSocket connection to remove
            workflow_id: Workflow ID
        """
        async with self._lock:
            if workflow_id in self.active_connections:
                self.active_connections[workflow_id].discard(websocket)
                
                # Clean up empty sets
                if not self.active_connections[workflow_id]:
                    del self.active_connections[workflow_id]
        
        logger.info(f"WebSocket disconnected for workflow {workflow_id}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """
        Send a message to a specific WebSocket connection
        
        Args:
            message: Message dictionary to send
            websocket: Target WebSocket connection
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
    
    async def broadcast_to_workflow(self, workflow_id: str, message: Dict[str, Any]):
        """
        Broadcast a message to all connections subscribed to a workflow
        
        Args:
            workflow_id: Workflow ID
            message: Message dictionary to broadcast
        """
        if workflow_id not in self.active_connections:
            logger.debug(f"No active connections for workflow {workflow_id}")
            return
        
        # Add timestamp if not present
        if "timestamp" not in message:
            message["timestamp"] = datetime.now().isoformat()
        
        # Get connections (copy to avoid modification during iteration)
        async with self._lock:
            connections = list(self.active_connections.get(workflow_id, []))
        
        # Send to all connections
        disconnected = []
        for connection in connections:
            try:
                # Check if connection is still open before sending
                if connection.client_state.name == "CONNECTED":
                    await connection.send_json(message)
                else:
                    logger.warning(f"WebSocket not in CONNECTED state for workflow {workflow_id}")
                    disconnected.append(connection)
            except WebSocketDisconnect:
                disconnected.append(connection)
                logger.warning(f"WebSocket disconnected during broadcast for workflow {workflow_id}")
            except RuntimeError as e:
                if "not connected" in str(e).lower():
                    logger.warning(f"WebSocket not connected yet for workflow {workflow_id}, skipping message")
                    # Don't add to disconnected - connection might still be establishing
                else:
                    disconnected.append(connection)
                    logger.error(f"Runtime error broadcasting to WebSocket: {e}")
            except Exception as e:
                disconnected.append(connection)
                logger.error(f"Error broadcasting to WebSocket: {e}")
        
        # Clean up disconnected connections
        if disconnected:
            async with self._lock:
                for conn in disconnected:
                    if workflow_id in self.active_connections:
                        self.active_connections[workflow_id].discard(conn)
    
    async def send_agent_started(self, workflow_id: str, agent_name: str, message: str = ""):
        """
        Send agent_started event
        
        Args:
            workflow_id: Workflow ID
            agent_name: Name of the agent
            message: Optional message
        """
        await self.broadcast_to_workflow(
            workflow_id,
            {
                "type": "agent_started",
                "workflow_id": workflow_id,
                "agent_name": agent_name,
                "message": message or f"{agent_name} started",
                "status": "running"
            }
        )
    
    async def send_agent_progress(
        self,
        workflow_id: str,
        agent_name: str,
        progress_percentage: int,
        message: str = ""
    ):
        """
        Send agent_progress event
        
        Args:
            workflow_id: Workflow ID
            agent_name: Name of the agent
            progress_percentage: Progress percentage (0-100)
            message: Progress message
        """
        await self.broadcast_to_workflow(
            workflow_id,
            {
                "type": "agent_progress",
                "workflow_id": workflow_id,
                "agent_name": agent_name,
                "progress_percentage": progress_percentage,
                "message": message,
                "status": "running"
            }
        )
    
    async def send_agent_completed(
        self,
        workflow_id: str,
        agent_name: str,
        result: Any = None,
        message: str = ""
    ):
        """
        Send agent_completed event
        
        Args:
            workflow_id: Workflow ID
            agent_name: Name of the agent
            result: Agent result (optional)
            message: Completion message
        """
        await self.broadcast_to_workflow(
            workflow_id,
            {
                "type": "agent_completed",
                "workflow_id": workflow_id,
                "agent_name": agent_name,
                "message": message or f"{agent_name} completed",
                "result": result,
                "status": "completed"
            }
        )
    
    async def send_agent_failed(
        self,
        workflow_id: str,
        agent_name: str,
        error: str,
        message: str = ""
    ):
        """
        Send agent_failed event
        
        Args:
            workflow_id: Workflow ID
            agent_name: Name of the agent
            error: Error message
            message: Optional additional message
        """
        await self.broadcast_to_workflow(
            workflow_id,
            {
                "type": "agent_failed",
                "workflow_id": workflow_id,
                "agent_name": agent_name,
                "error": error,
                "message": message or f"{agent_name} failed",
                "status": "failed"
            }
        )
    
    async def send_workflow_completed(
        self,
        workflow_id: str,
        status: str,
        message: str = ""
    ):
        """
        Send workflow_completed event
        
        Args:
            workflow_id: Workflow ID
            status: Final workflow status
            message: Completion message
        """
        await self.broadcast_to_workflow(
            workflow_id,
            {
                "type": "workflow_completed",
                "workflow_id": workflow_id,
                "status": status,
                "message": message or f"Workflow completed with status: {status}"
            }
        )
    
    async def send_workflow_error(
        self,
        workflow_id: str,
        error: str,
        message: str = ""
    ):
        """
        Send workflow_error event
        
        Args:
            workflow_id: Workflow ID
            error: Error message
            message: Optional additional message
        """
        await self.broadcast_to_workflow(
            workflow_id,
            {
                "type": "workflow_error",
                "workflow_id": workflow_id,
                "error": error,
                "message": message or "Workflow encountered an error",
                "status": "failed"
            }
        )
    
    # Enhanced Work Progress Methods
    # ==============================
    
    async def send_agent_search(
        self,
        workflow_id: str,
        agent_name: str,
        query: str,
        source: str = "",
        url: str = "",
        source_count: int = 0
    ):
        """
        Send detailed search progress for research agent
        
        Args:
            workflow_id: Workflow ID
            agent_name: Name of the agent (usually 'research')
            query: Search query being executed
            source: Source being searched (e.g., 'Google', 'Academic Papers')
            url: URL being analyzed
            source_count: Number of sources found so far
        """
        await self.broadcast_to_workflow(
            workflow_id,
            {
                "type": "agent_search",
                "workflow_id": workflow_id,
                "agent_name": agent_name,
                "query": query,
                "source": source,
                "url": url,
                "source_count": source_count,
                "work_type": "search"
            }
        )
    
    async def send_agent_analysis(
        self,
        workflow_id: str,
        agent_name: str,
        focus_keyword: str = "",
        keywords_count: int = 0,
        difficulty: str = "",
        search_volume: str = ""
    ):
        """
        Send detailed analysis progress for SEO agent
        
        Args:
            workflow_id: Workflow ID
            agent_name: Name of the agent (usually 'seo')
            focus_keyword: Primary keyword being analyzed
            keywords_count: Number of keywords found
            difficulty: SEO difficulty level
            search_volume: Search volume data
        """
        await self.broadcast_to_workflow(
            workflow_id,
            {
                "type": "agent_analysis",
                "workflow_id": workflow_id,
                "agent_name": agent_name,
                "focus_keyword": focus_keyword,
                "keywords_count": keywords_count,
                "difficulty": difficulty,
                "search_volume": search_volume,
                "work_type": "analysis"
            }
        )
    
    async def send_agent_generation(
        self,
        workflow_id: str,
        agent_name: str,
        content_type: str = "",
        description: str = "",
        progress: int = 0,
        word_count: int = 0,
        style: str = ""
    ):
        """
        Send detailed generation progress for writer/image agents
        
        Args:
            workflow_id: Workflow ID
            agent_name: Name of the agent
            content_type: Type of content being generated
            description: Description of the generation process
            progress: Generation progress (0-100)
            word_count: Current word count (for writer)
            style: Writing/image style
        """
        await self.broadcast_to_workflow(
            workflow_id,
            {
                "type": "agent_generation",
                "workflow_id": workflow_id,
                "agent_name": agent_name,
                "content_type": content_type,
                "description": description,
                "progress": progress,
                "word_count": word_count,
                "style": style,
                "work_type": "generation"
            }
        )
    
    async def send_agent_detailed_progress(
        self,
        workflow_id: str,
        agent_name: str,
        progress_percentage: int,
        message: str,
        work_type: str = "processing",
        details: Dict[str, Any] = None
    ):
        """
        Send detailed progress with work information
        
        Args:
            workflow_id: Workflow ID
            agent_name: Name of the agent
            progress_percentage: Progress percentage (0-100)
            message: Progress message
            work_type: Type of work ('search', 'analysis', 'generation', 'processing', 'compilation')
            details: Additional details about the work
        """
        message_data = {
            "type": "agent_progress",
            "workflow_id": workflow_id,
            "agent_name": agent_name,
            "progress_percentage": progress_percentage,
            "message": message,
            "work_type": work_type,
            "status": "running"
        }
        
        if details:
            message_data["details"] = details
        
        # Save progress to database for historical viewing
        await self._save_progress_to_db(
            workflow_id=workflow_id,
            agent_name=agent_name,
            progress_type=work_type,
            title=details.get('title', message) if details else message,
            content=details.get('content', message) if details else message,
            metadata=details.get('metadata') if details else None
        )
        
        await self.broadcast_to_workflow(workflow_id, message_data)
    
    async def _save_progress_to_db(
        self,
        workflow_id: str,
        agent_name: str,
        progress_type: str,
        title: str,
        content: str,
        metadata: Dict[str, Any] = None
    ):
        """Save progress entry to database"""
        try:
            from blog_team.models.database import get_db
            from blog_team.models.orm_models import WorkflowProgress
            
            db = next(get_db())
            
            progress_entry = WorkflowProgress(
                workflow_id=workflow_id,
                agent_name=agent_name,
                progress_type=progress_type,
                title=title,
                content=content,
                work_metadata=metadata or {}
            )
            
            db.add(progress_entry)
            db.commit()
            
        except Exception as e:
            logger.error(f"Error saving progress to database: {e}")
    
    def get_connection_count(self, workflow_id: str) -> int:
        """
        Get number of active connections for a workflow
        
        Args:
            workflow_id: Workflow ID
            
        Returns:
            Number of active connections
        """
        return len(self.active_connections.get(workflow_id, set()))
    
    def get_total_connections(self) -> int:
        """
        Get total number of active connections across all workflows
        
        Returns:
            Total number of connections
        """
        return sum(len(conns) for conns in self.active_connections.values())


# Global connection manager instance
manager = ConnectionManager()


def get_connection_manager() -> ConnectionManager:
    """Get the global connection manager instance"""
    return manager
