"""
Agent Lightning Integration Layer for Lingo API
Bridges Agent Lightning capabilities with existing Lingo infrastructure
"""

import logging
from typing import Dict, Any, Optional
import asyncio

from .core import LingoAgentLightning

logger = logging.getLogger(__name__)


class LingoAgentLightningBridge:
    """
    Bridge between Agent Lightning and existing Lingo infrastructure
    
    This class provides:
    - Seamless integration with existing WebSocket API
    - Backward compatibility with current Lingo features
    - Enhanced capabilities through Agent Lightning
    - Gradual migration path
    """
    
    def __init__(self):
        """Initialize the bridge"""
        self.agent_lightning = LingoAgentLightning()
        self.enabled = True  # Feature flag for Agent Lightning
        logger.info("🌉 Agent Lightning Bridge initialized")
    
    async def process_message(
        self,
        text: str,
        user_id: str = "default_user",
        use_agent_lightning: bool = True
    ) -> Dict[str, Any]:
        """
        Process user message with optional Agent Lightning enhancement
        
        Args:
            text: User input text
            user_id: User identifier
            use_agent_lightning: Whether to use Agent Lightning (feature flag)
            
        Returns:
            Response dict compatible with existing Lingo API
        """
        try:
            if not self.enabled or not use_agent_lightning:
                # Fallback to existing Lingo logic
                return await self._process_with_legacy_lingo(text, user_id)
            
            # Use Agent Lightning for enhanced processing
            logger.info(f"⚡ Processing with Agent Lightning: '{text}'")
            
            # Get Agent Lightning response
            al_response = await self.agent_lightning.process_voice_command(
                text=text,
                user_id=user_id
            )
            
            # Convert Agent Lightning response to Lingo API format
            lingo_response = self._convert_to_lingo_format(al_response, user_id)
            
            return lingo_response
            
        except Exception as e:
            logger.error(f"❌ Bridge error: {e}, falling back to legacy")
            return await self._process_with_legacy_lingo(text, user_id)
    
    def _convert_to_lingo_format(
        self,
        al_response: Dict[str, Any],
        user_id: str
    ) -> Dict[str, Any]:
        """
        Convert Agent Lightning response to Lingo API format
        
        Args:
            al_response: Agent Lightning response
            user_id: User identifier
            
        Returns:
            Response in Lingo API format
        """
        # Import here to avoid circular dependency
        try:
            from lingo_agent.conversation_state import conversation_manager
            state = conversation_manager.get_or_create(user_id)
            phase = state.phase.value
        except ImportError:
            phase = "initial"
        
        # Base response
        lingo_response = {
            "message": al_response.get("message", ""),
            "intent": al_response.get("intent"),
            "confidence": al_response.get("confidence", 0.0),
            "phase": phase
        }
        
        # Add workflow information if present
        if "workflow" in al_response:
            workflow = al_response["workflow"]
            lingo_response["workflow_started"] = True
            lingo_response["workflow_id"] = workflow.get("id")
            lingo_response["workflow_type"] = al_response.get("intent")
            lingo_response["execution_time"] = workflow.get("execution_time")
            
            # Update conversation state if available
            try:
                from lingo_agent.conversation_state import ConversationPhase
                state.phase = ConversationPhase.CONFIRMING
            except (ImportError, NameError):
                pass
        
        # Add navigation information if present
        if "navigation" in al_response:
            navigation = al_response["navigation"]
            lingo_response["navigate_to"] = navigation.get("route")
            lingo_response["navigation_mode"] = navigation.get("mode")
            lingo_response["navigation_data"] = navigation.get("data", {})
            lingo_response["auto_redirect"] = True
        
        # Add clarification flag if needed
        if al_response.get("requires_clarification"):
            lingo_response["requires_clarification"] = True
            lingo_response["possible_intents"] = al_response.get("possible_intents", [])
        
        # Add extracted data if available
        if "extracted_data" in al_response:
            lingo_response["extracted_data"] = al_response["extracted_data"]
            # Also map to navigation_data as MasterLingoAgent uses this for workflow data
            if "navigation_data" not in lingo_response:
                lingo_response["navigation_data"] = al_response["extracted_data"]
        else:
            try:
                lingo_response["extracted_data"] = state.collected_data
            except (NameError, AttributeError):
                lingo_response["extracted_data"] = {}
        
        return lingo_response
    
    async def _process_with_legacy_lingo(
        self,
        text: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Fallback to legacy Lingo processing
        
        This maintains backward compatibility when Agent Lightning is disabled
        or encounters errors.
        """
        logger.info(f"🔄 Using legacy Lingo processing for: '{text}'")
        
        # Simple intent detection (legacy)
        text_lower = text.lower()
        intent = None
        
        if any(word in text_lower for word in ["blog", "article", "write"]):
            intent = "blog"
        elif any(word in text_lower for word in ["travel", "trip", "flight"]):
            intent = "travel"
        elif any(word in text_lower for word in ["image", "picture", "photo"]):
            intent = "ai_image"
        
        # Try to get conversation state
        try:
            from lingo_agent.conversation_state import conversation_manager
            state = conversation_manager.get_or_create(user_id)
            phase = state.phase.value
            extracted_data = state.collected_data
        except ImportError:
            phase = "initial"
            extracted_data = {}
        
        return {
            "message": "I'm here to help! What would you like to do?",
            "intent": intent,
            "phase": phase,
            "extracted_data": extracted_data
        }
    
    async def get_conversation_history(
        self,
        user_id: str,
        limit: int = 10
    ) -> list:
        """Get conversation history"""
        return await self.agent_lightning.get_conversation_history(user_id, limit)
    
    async def reset_conversation(self, user_id: str):
        """Reset conversation for user"""
        await self.agent_lightning.reset_conversation(user_id)
        try:
            from lingo_agent.conversation_state import conversation_manager
            conversation_manager.reset(user_id)
        except ImportError:
            pass
    
    def get_stats(self) -> Dict[str, Any]:
        """Get comprehensive statistics"""
        return {
            "agent_lightning_enabled": self.enabled,
            "agent_lightning_stats": self.agent_lightning.get_stats() if self.enabled else None
        }
    
    def enable_agent_lightning(self):
        """Enable Agent Lightning features"""
        self.enabled = True
        logger.info("✅ Agent Lightning enabled")
    
    def disable_agent_lightning(self):
        """Disable Agent Lightning features (use legacy only)"""
        self.enabled = False
        logger.info("⚠️ Agent Lightning disabled, using legacy mode")


# Global bridge instance
_bridge_instance: Optional[LingoAgentLightningBridge] = None


def get_agent_lightning_bridge() -> LingoAgentLightningBridge:
    """Get or create the Agent Lightning bridge singleton"""
    global _bridge_instance
    
    if _bridge_instance is None:
        _bridge_instance = LingoAgentLightningBridge()
    
    return _bridge_instance
