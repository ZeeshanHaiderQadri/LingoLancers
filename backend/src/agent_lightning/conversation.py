"""
Conversation Management System
Handles multi-turn dialogues with context retention
"""

import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
import json

logger = logging.getLogger(__name__)


@dataclass
class ConversationContext:
    """Conversation context for a user"""
    user_id: str
    history: List[Dict[str, str]] = field(default_factory=list)
    current_intent: Optional[str] = None
    collected_data: Dict[str, Any] = field(default_factory=dict)
    last_updated: datetime = field(default_factory=datetime.now)
    turn_count: int = 0
    
    def add_turn(self, role: str, content: str):
        """Add a conversation turn"""
        self.history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        self.turn_count += 1
        self.last_updated = datetime.now()
    
    def get_recent_history(self, n: int = 5) -> List[Dict[str, str]]:
        """Get recent conversation history"""
        return self.history[-n:] if len(self.history) > n else self.history
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "user_id": self.user_id,
            "history": self.history,
            "current_intent": self.current_intent,
            "collected_data": self.collected_data,
            "last_updated": self.last_updated.isoformat(),
            "turn_count": self.turn_count
        }


@dataclass
class ConversationTurn:
    """A single conversation turn"""
    input: str
    context: ConversationContext
    timestamp: datetime = field(default_factory=datetime.now)


class ShortTermMemory:
    """Short-term memory for recent conversations"""
    
    def __init__(self, window_size: int = 10):
        self.window_size = window_size
        self.memory: Dict[str, List[str]] = {}
    
    async def get(self, user_id: str) -> List[str]:
        """Get recent conversation for user"""
        return self.memory.get(user_id, [])
    
    async def add(self, user_id: str, message: str):
        """Add message to short-term memory"""
        if user_id not in self.memory:
            self.memory[user_id] = []
        
        self.memory[user_id].append(message)
        
        # Keep only recent messages
        if len(self.memory[user_id]) > self.window_size:
            self.memory[user_id] = self.memory[user_id][-self.window_size:]


class LongTermMemory:
    """Long-term memory for persistent context"""
    
    def __init__(self):
        self.memory: Dict[str, List[Dict[str, Any]]] = {}
    
    async def retrieve(
        self,
        user_id: str,
        query: str
    ) -> Dict[str, Any]:
        """Retrieve relevant long-term context"""
        # TODO: Implement semantic search with embeddings
        # For now, return recent context
        if user_id in self.memory:
            return {
                "previous_intents": [m.get("intent") for m in self.memory[user_id][-5:]],
                "previous_topics": [m.get("topic") for m in self.memory[user_id][-5:]]
            }
        return {}
    
    async def index(
        self,
        user_id: str,
        message: str,
        context: ConversationContext
    ):
        """Index message for long-term retrieval"""
        if user_id not in self.memory:
            self.memory[user_id] = []
        
        self.memory[user_id].append({
            "message": message,
            "intent": context.current_intent,
            "timestamp": datetime.now().isoformat(),
            "data": context.collected_data
        })


class ContextWindow:
    """Manages context window with token limits"""
    
    def __init__(self, max_tokens: int = 4096):
        self.max_tokens = max_tokens
    
    def build(
        self,
        current_input: str,
        short_term: List[str],
        long_term: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Build context window within token limits"""
        # Simple implementation - can be enhanced with token counting
        return {
            "current_input": current_input,
            "recent_messages": short_term[-5:],  # Last 5 messages
            "long_term_context": long_term
        }


class ConversationManager:
    """
    Manages multi-turn conversations with context retention
    
    Features:
    - Short-term memory (last 10 turns)
    - Long-term memory (persistent storage)
    - Context window management
    - Per-user conversation state
    """
    
    def __init__(self):
        self.contexts: Dict[str, ConversationContext] = {}
        self.short_term_memory = ShortTermMemory(window_size=10)
        self.long_term_memory = LongTermMemory()
        self.context_window = ContextWindow(max_tokens=4096)
        
        logger.info("✅ Conversation Manager initialized")
    
    async def process_turn(
        self,
        user_input: str,
        user_id: str
    ) -> ConversationTurn:
        """
        Process a conversation turn with full context
        
        Args:
            user_input: User's input text
            user_id: User identifier
            
        Returns:
            ConversationTurn with context
        """
        # Get or create context
        if user_id not in self.contexts:
            self.contexts[user_id] = ConversationContext(user_id=user_id)
        
        context = self.contexts[user_id]
        
        # Add user input to history
        context.add_turn("user", user_input)
        
        # Get short-term memory
        short_term = await self.short_term_memory.get(user_id)
        
        # Get long-term context
        long_term = await self.long_term_memory.retrieve(user_id, user_input)
        
        # Build context window
        context_window = self.context_window.build(
            current_input=user_input,
            short_term=short_term,
            long_term=long_term
        )
        
        # Update short-term memory
        await self.short_term_memory.add(user_id, user_input)
        
        # Index for long-term
        await self.long_term_memory.index(user_id, user_input, context)
        
        return ConversationTurn(
            input=user_input,
            context=context
        )
    
    async def add_response(
        self,
        user_id: str,
        response: Dict[str, Any]
    ):
        """Add agent response to conversation history"""
        if user_id in self.contexts:
            context = self.contexts[user_id]
            context.add_turn("agent", response.get("message", ""))
            
            # Update intent if present
            if response.get("intent"):
                context.current_intent = response["intent"]
    
    async def get_history(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Dict[str, str]]:
        """Get conversation history for user"""
        if user_id in self.contexts:
            return self.contexts[user_id].get_recent_history(limit)
        return []
    
    async def reset(self, user_id: str):
        """Reset conversation for user"""
        if user_id in self.contexts:
            del self.contexts[user_id]
        
        if user_id in self.short_term_memory.memory:
            del self.short_term_memory.memory[user_id]
        
        logger.info(f"🔄 Reset conversation for user: {user_id}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get conversation statistics"""
        return {
            "active_conversations": len(self.contexts),
            "total_turns": sum(c.turn_count for c in self.contexts.values()),
            "avg_turns_per_user": (
                sum(c.turn_count for c in self.contexts.values()) / len(self.contexts)
                if self.contexts else 0
            )
        }
