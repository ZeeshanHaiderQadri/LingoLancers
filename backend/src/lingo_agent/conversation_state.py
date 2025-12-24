"""
Conversation State Management for Multi-Turn Conversations
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum


class ConversationPhase(Enum):
    """Phases of conversation"""
    INITIAL = "initial"  # Just started
    COLLECTING = "collecting"  # Collecting information
    CONFIRMING = "confirming"  # Confirming before workflow
    EXECUTING = "executing"  # Workflow running
    COMPLETE = "complete"  # Workflow complete


@dataclass
class ConversationState:
    """Stores conversation state for a user"""
    user_id: str
    intent: Optional[str] = None  # blog, travel, product, etc.
    phase: ConversationPhase = ConversationPhase.INITIAL
    collected_data: Dict[str, Any] = field(default_factory=dict)
    questions_asked: List[str] = field(default_factory=list)
    current_question: Optional[str] = None
    workflow_id: Optional[str] = None
    conversation_history: List[Dict[str, str]] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    
    def add_message(self, role: str, content: str):
        """Add message to conversation history"""
        self.conversation_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        self.updated_at = datetime.now()
    
    def is_complete(self) -> bool:
        """Check if we have enough information to start workflow"""
        if self.intent == "blog":
            # Minimum: topic
            return "topic" in self.collected_data and self.collected_data["topic"]
        
        elif self.intent == "travel":
            # Minimum: destination (to)
            return "to" in self.collected_data and self.collected_data["to"]
        
        return False
    
    def get_missing_fields(self) -> List[str]:
        """Get list of missing optional fields"""
        missing = []
        
        if self.intent == "blog":
            if "keywords" not in self.collected_data:
                missing.append("keywords")
            if "tone" not in self.collected_data:
                missing.append("tone")
            if "length" not in self.collected_data:
                missing.append("length")
        
        elif self.intent == "travel":
            if "when" not in self.collected_data:
                missing.append("when")
            if "duration" not in self.collected_data:
                missing.append("duration")
            if "travelers" not in self.collected_data:
                missing.append("travelers")
            if "budget" not in self.collected_data:
                missing.append("budget")
        
        return missing


class ConversationManager:
    """Manages multiple conversation states"""
    
    def __init__(self):
        self.states: Dict[str, ConversationState] = {}
    
    def get_or_create(self, user_id: str) -> ConversationState:
        """Get existing state or create new one"""
        if user_id not in self.states:
            self.states[user_id] = ConversationState(user_id=user_id)
        return self.states[user_id]
    
    def reset(self, user_id: str):
        """Reset conversation state"""
        if user_id in self.states:
            del self.states[user_id]
    
    def get(self, user_id: str) -> Optional[ConversationState]:
        """Get existing state"""
        return self.states.get(user_id)


# Global conversation manager
conversation_manager = ConversationManager()
