"""
Core Agent Lightning Integration
Main orchestrator that brings together all Agent Lightning capabilities
"""

import logging
from typing import Dict, Any, Optional
import asyncio

from .nlu_engine import AgentLightningNLU
from .conversation import ConversationManager
from .orchestrator import MagenticOrchestrator
from .navigator import IntelligentNavigator

logger = logging.getLogger(__name__)


class LingoAgentLightning:
    """
    Master Lingo Agent powered by Microsoft Agent Lightning
    
    This is the main entry point that orchestrates:
    - Advanced NLU for intent understanding
    - Conversation management for context
    - Magentic orchestration for parallel workflows
    - Intelligent navigation for dashboard routing
    """
    
    def __init__(self):
        """Initialize Agent Lightning components"""
        logger.info("🚀 Initializing Lingo Agent Lightning...")
        
        # Core components
        self.nlu_engine = AgentLightningNLU()
        self.conversation_manager = ConversationManager()
        self.orchestrator = MagenticOrchestrator()
        self.navigator = IntelligentNavigator()
        
        logger.info("✅ Lingo Agent Lightning initialized successfully")
    
    async def process_voice_command(
        self,
        text: str,
        user_id: str = "default_user",
        audio_data: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """
        Process a voice command end-to-end
        
        Args:
            text: Transcribed text from speech
            user_id: User identifier
            audio_data: Optional raw audio for analysis
            
        Returns:
            Complete response with:
            - message: Text response
            - navigation: Navigation action if needed
            - workflow: Workflow result if triggered
            - confidence: Overall confidence score
        """
        try:
            logger.info(f"🎤 Processing voice command: '{text}' for user: {user_id}")
            
            # Step 1: Get conversation context
            conversation_turn = await self.conversation_manager.process_turn(
                user_input=text,
                user_id=user_id
            )
            
            # Step 2: Advanced NLU analysis
            understanding = await self.nlu_engine.understand(
                text=text,
                context=conversation_turn.context
            )
            
            logger.info(f"🧠 Intent: {understanding.primary_intent} "
                       f"(confidence: {understanding.confidence:.2f})")
            
            # Step 3: Determine action based on intent
            if understanding.confidence < 0.6:
                # Low confidence - ask for clarification
                return await self._handle_low_confidence(understanding, text)
            
            # Step 4: Execute workflow if needed
            workflow_result = None
            if understanding.requires_workflow:
                workflow_result = await self.orchestrator.execute_workflow(
                    workflow_type=understanding.primary_intent,
                    data=understanding.extracted_data
                )
            
            # Step 5: Determine navigation
            navigation_action = None
            if understanding.requires_navigation:
                navigation_action = await self.navigator.navigate(
                    intent=understanding.primary_intent,
                    context=conversation_turn.context,
                    user_id=user_id
                )
            
            # Step 6: Generate response
            response = await self._generate_response(
                understanding=understanding,
                workflow_result=workflow_result,
                navigation_action=navigation_action
            )
            
            # Step 7: Update conversation history
            await self.conversation_manager.add_response(
                user_id=user_id,
                response=response
            )
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Error processing voice command: {e}")
            return {
                "success": False,
                "message": "I encountered an error processing your request. Could you please try again?",
                "error": str(e)
            }
    
    async def _handle_low_confidence(
        self,
        understanding: Any,
        original_text: str
    ) -> Dict[str, Any]:
        """Handle low confidence scenarios with clarifying questions"""
        
        # Generate clarifying question
        clarifying_question = await self._generate_clarifying_question(
            understanding, original_text
        )
        
        return {
            "success": True,
            "message": clarifying_question,
            "requires_clarification": True,
            "confidence": understanding.confidence,
            "possible_intents": [
                understanding.primary_intent,
                *understanding.secondary_intents
            ]
        }
    
    async def _generate_clarifying_question(
        self,
        understanding: Any,
        original_text: str
    ) -> str:
        """Generate intelligent clarifying questions"""
        
        if understanding.primary_intent and understanding.secondary_intents:
            # Multiple possible intents
            return (
                f"I'm not quite sure what you'd like to do. "
                f"Did you want to {understanding.primary_intent} "
                f"or {understanding.secondary_intents[0]}?"
            )
        elif understanding.primary_intent:
            # Unclear parameters
            return (
                f"I think you want to {understanding.primary_intent}, "
                f"but I need a bit more information. Could you provide more details?"
            )
        else:
            # No clear intent
            return (
                "I'm not sure I understood that correctly. "
                "Could you rephrase what you'd like me to do?"
            )
    
    async def _generate_response(
        self,
        understanding: Any,
        workflow_result: Optional[Any],
        navigation_action: Optional[Any]
    ) -> Dict[str, Any]:
        """Generate comprehensive response"""
        
        response = {
            "success": True,
            "confidence": understanding.confidence,
            "intent": understanding.primary_intent,
            "extracted_data": understanding.extracted_data
        }
        
        # Add workflow result
        if workflow_result:
            response["workflow"] = {
                "id": workflow_result.workflow_id,
                "status": workflow_result.status,
                "execution_time": workflow_result.execution_time,
                "parallel_speedup": workflow_result.parallel_speedup
            }
            # Simple, clear message without confusing timing info
            # Simple, clear message without confusing timing info
            response["message"] = (
                f"Great! I've started the {understanding.primary_intent} workflow. "
                f"You'll see the progress in real-time!"
            )
        
        # Add navigation
        if navigation_action:
            response["navigation"] = {
                "route": navigation_action.route,
                "mode": navigation_action.mode,
                "data": navigation_action.data
            }
            if not workflow_result:
                response["message"] = (
                    f"Taking you to {understanding.primary_intent} now."
                )
        
        # Default message if no workflow or navigation
        if "message" not in response:
            response["message"] = (
                f"I understand you want to {understanding.primary_intent}. "
                f"How can I help with that?"
            )
        
        return response
    
    async def get_conversation_history(
        self,
        user_id: str,
        limit: int = 10
    ) -> list:
        """Get conversation history for a user"""
        return await self.conversation_manager.get_history(user_id, limit)
    
    async def reset_conversation(self, user_id: str):
        """Reset conversation state for a user"""
        await self.conversation_manager.reset(user_id)
        logger.info(f"🔄 Reset conversation for user: {user_id}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get Agent Lightning statistics"""
        return {
            "nlu_engine": self.nlu_engine.get_stats(),
            "orchestrator": self.orchestrator.get_stats(),
            "navigator": self.navigator.get_stats(),
            "conversation_manager": self.conversation_manager.get_stats()
        }
