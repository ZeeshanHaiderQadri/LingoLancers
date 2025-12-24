"""
Intelligent Chat API for Master Lingo Agent
Connects unified chat interface to intelligent backend
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging

from .intelligent_llm_handler import IntelligentLLMHandler, LLMProvider
from .conversation_state import conversation_manager, ConversationPhase
from .question_flows import (
    get_next_question, 
    extract_answer, 
    generate_confirmation_message,
    should_ask_more_questions
)
from .workflow_trigger import workflow_trigger

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize LLM handler with Azure OpenAI
llm_handler = IntelligentLLMHandler(LLMProvider.AZURE_OPENAI_GPT4O)


class ChatRequest(BaseModel):
    message: str
    user_id: str = "default"


class ChatResponse(BaseModel):
    response: str
    intent: Optional[str] = None
    phase: str = "initial"
    collected_data: Dict[str, Any] = {}
    ready_to_start: bool = False
    workflow_started: bool = False
    workflow_id: Optional[str] = None
    navigate_to: Optional[str] = None
    auto_redirect: bool = False
    analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
async def intelligent_chat(request: ChatRequest):
    """
    Intelligent chat endpoint that:
    1. Analyzes user intent with LLM
    2. Manages conversation state
    3. Collects information systematically
    4. Triggers workflows when ready
    """
    
    try:
        user_message = request.message.strip()
        user_id = request.user_id
        
        logger.info(f"💬 Intelligent chat request from {user_id}: {user_message}")
        
        # Get or create conversation state
        state = conversation_manager.get_or_create(user_id)
        state.add_message("user", user_message)
        
        # Analyze intent with LLM
        logger.info("🧠 Analyzing intent with Azure OpenAI...")
        analysis = await llm_handler.analyze_user_intent(
            user_message, 
            state.conversation_history
        )
        
        logger.info(f"📊 Intent analysis: {analysis['intent']} (confidence: {analysis['confidence']})")
        
        # Handle different conversation phases
        if state.phase == ConversationPhase.CONFIRMING:
            # User is confirming to start workflow
            return await handle_confirmation(state, user_message, analysis)
        
        elif state.phase == ConversationPhase.COLLECTING:
            # Collecting information for workflow
            return await handle_collecting(state, user_message, analysis)
        
        elif state.phase == ConversationPhase.EXECUTING:
            # Workflow is running
            return ChatResponse(
                response="Your workflow is currently running! Check the dashboard for progress.",
                intent=state.intent,
                phase=state.phase.value,
                collected_data=state.collected_data,
                workflow_started=True,
                workflow_id=state.workflow_id
            )
        
        else:
            # Initial phase - detect intent and start collecting
            return await handle_initial(state, user_message, analysis)
    
    except Exception as e:
        logger.error(f"❌ Error in intelligent chat: {e}", exc_info=True)
        return ChatResponse(
            response="I apologize, but I encountered an error. Could you try rephrasing that?",
            error=str(e)
        )


async def handle_initial(state, user_message: str, analysis: Dict[str, Any]) -> ChatResponse:
    """Handle initial phase - detect intent and start collecting info"""
    
    # Check if intent is clear enough
    if analysis["intent"] != "unclear" and analysis["confidence"] > 0.7:
        # Clear intent detected!
        state.intent = analysis["intent"]
        state.phase = ConversationPhase.COLLECTING
        
        # Update collected data from initial message
        if analysis.get("extracted_data"):
            state.collected_data.update(analysis["extracted_data"])
        
        logger.info(f"✅ Intent detected: {state.intent}")
        
        # Check if we already have enough info to start
        if state.is_complete():
            state.phase = ConversationPhase.CONFIRMING
            response_text = generate_confirmation_message(state)
            
            return ChatResponse(
                response=response_text,
                intent=state.intent,
                phase=state.phase.value,
                collected_data=state.collected_data,
                ready_to_start=True,
                navigate_to=f"{state.intent}-team",
                analysis=analysis
            )
        
        # Ask next question
        next_question = get_next_question(state)
        if next_question:
            response_text = f"{analysis['suggested_response']}\n\n{next_question}"
        else:
            response_text = analysis["suggested_response"]
        
        state.add_message("assistant", response_text)
        
        return ChatResponse(
            response=response_text,
            intent=state.intent,
            phase=state.phase.value,
            collected_data=state.collected_data,
            analysis=analysis
        )
    
    else:
        # Intent unclear - have a conversation
        response_text = await llm_handler.generate_conversational_response(
            user_message,
            "general",
            {},
            state.conversation_history
        )
        
        state.add_message("assistant", response_text)
        
        return ChatResponse(
            response=response_text,
            phase="initial",
            analysis=analysis
        )


async def handle_collecting(state, user_message: str, analysis: Dict[str, Any]) -> ChatResponse:
    """Handle collecting phase - gather information for workflow"""
    
    # Extract and store answer
    if state.current_question:
        answer = extract_answer(state.current_question, user_message, state)
        if answer:
            state.collected_data[state.current_question] = answer
            logger.info(f"📝 Collected {state.current_question}: {answer}")
    
    # Also merge any additional extracted data from LLM
    if analysis.get("extracted_data"):
        for key, value in analysis["extracted_data"].items():
            if value and key not in state.collected_data:
                state.collected_data[key] = value
    
    # Check if we have enough info
    if state.is_complete():
        # Check if we should ask more optional questions
        if should_ask_more_questions(state):
            # Ask one more optional question
            next_question = get_next_question(state)
            if next_question:
                response_text = f"Great! {next_question}"
                state.add_message("assistant", response_text)
                
                return ChatResponse(
                    response=response_text,
                    intent=state.intent,
                    phase=state.phase.value,
                    collected_data=state.collected_data,
                    analysis=analysis
                )
        
        # We have enough info - move to confirmation
        state.phase = ConversationPhase.CONFIRMING
        response_text = generate_confirmation_message(state)
        state.add_message("assistant", response_text)
        
        return ChatResponse(
            response=response_text,
            intent=state.intent,
            phase=state.phase.value,
            collected_data=state.collected_data,
            ready_to_start=True,
            navigate_to=f"{state.intent}-team",
            analysis=analysis
        )
    
    else:
        # Still need more info - ask next question
        next_question = get_next_question(state)
        if next_question:
            response_text = next_question
        else:
            # Generate conversational response
            response_text = await llm_handler.generate_conversational_response(
                user_message,
                state.intent,
                state.collected_data,
                state.conversation_history
            )
        
        state.add_message("assistant", response_text)
        
        return ChatResponse(
            response=response_text,
            intent=state.intent,
            phase=state.phase.value,
            collected_data=state.collected_data,
            analysis=analysis
        )


async def handle_confirmation(state, user_message: str, analysis: Dict[str, Any]) -> ChatResponse:
    """Handle confirmation phase - start workflow if user confirms"""
    
    user_lower = user_message.lower()
    
    # Check for confirmation
    if any(word in user_lower for word in ["yes", "start", "go", "proceed", "ok", "sure", "yeah"]):
        logger.info(f"🚀 Starting {state.intent} workflow...")
        
        # Trigger workflow
        result = await workflow_trigger.trigger_workflow(state)
        
        if result["success"]:
            state.phase = ConversationPhase.EXECUTING
            
            return ChatResponse(
                response=result["message"],
                intent=state.intent,
                phase=state.phase.value,
                collected_data=state.collected_data,
                workflow_started=True,
                workflow_id=result["workflow_id"],
                navigate_to=result.get("navigate_to"),
                auto_redirect=result.get("auto_redirect", False)
            )
        else:
            # Workflow start failed
            error_msg = result.get("message", "Failed to start workflow")
            
            return ChatResponse(
                response=error_msg,
                intent=state.intent,
                phase=state.phase.value,
                collected_data=state.collected_data,
                error=result.get("error")
            )
    
    # Check for cancellation
    elif any(word in user_lower for word in ["no", "cancel", "stop", "nevermind", "abort"]):
        # Reset conversation
        conversation_manager.reset(state.user_id)
        
        return ChatResponse(
            response="No problem! Let me know if you'd like to try something else.",
            phase="initial"
        )
    
    else:
        # User said something else - clarify
        response_text = "I'm ready to start your workflow. Would you like me to proceed? (yes/no)"
        state.add_message("assistant", response_text)
        
        return ChatResponse(
            response=response_text,
            intent=state.intent,
            phase=state.phase.value,
            collected_data=state.collected_data,
            ready_to_start=True
        )


@router.post("/reset")
async def reset_conversation(user_id: str = "default"):
    """Reset conversation state for a user"""
    conversation_manager.reset(user_id)
    return {"message": "Conversation reset successfully"}


@router.get("/status")
async def get_conversation_status(user_id: str = "default"):
    """Get current conversation status"""
    state = conversation_manager.get(user_id)
    
    if not state:
        return {
            "exists": False,
            "phase": "initial"
        }
    
    return {
        "exists": True,
        "intent": state.intent,
        "phase": state.phase.value if state.phase else "initial",
        "collected_data": state.collected_data,
        "message_count": len(state.conversation_history)
    }
