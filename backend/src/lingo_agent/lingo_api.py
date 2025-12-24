"""
API endpoints for Master Lingo Agent
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
import os
import openai
import asyncio
import json

from .master_lingo_agent import MasterLingoAgent
from .intelligent_intent_engine import get_intent_engine, IntentConfidence
from .ai_image_navigator import AIImageNavigator
from .prompt_filler import get_prompt_filler

logger = logging.getLogger(__name__)

# Import Agent Lightning Bridge
try:
    from agent_lightning import get_agent_lightning_bridge
    AGENT_LIGHTNING_AVAILABLE = True
    logger.info("✅ Agent Lightning integration available")
except ImportError as e:
    AGENT_LIGHTNING_AVAILABLE = False
    logger.warning(f"⚠️ Agent Lightning not available: {e}")


# Import MAF orchestrator for actual workflow execution
try:
    from maf_core.orchestrator import get_master_orchestrator
    from api.tasks_api import create_task
    MAF_AVAILABLE = True
    logger.info("✅ MAF orchestrator available")
except ImportError as e:
    MAF_AVAILABLE = False
    logger.warning(f"⚠️ MAF orchestrator not available: {e}")

router = APIRouter(prefix="/api/lingo", tags=["lingo"])

# Initialize OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Global agent instance and WebSocket state
lingo_agent: Optional[MasterLingoAgent] = None
active_websocket: Optional[WebSocket] = None
websocket_lock = asyncio.Lock()


class VoiceConfig(BaseModel):
    voice: str
    language: str = "en"


class StartAgentRequest(BaseModel):
    voice: Optional[str] = "aura-asteria-en"
    language: Optional[str] = "en"


@router.post("/start")
async def start_agent(request: StartAgentRequest):
    """Start the Master Lingo Agent with Azure Speech"""
    global lingo_agent
    
    try:
        # Check Azure Speech configuration
        azure_speech_key = os.getenv("AZURE_SPEECH_KEY")
        if not azure_speech_key:
            raise HTTPException(status_code=500, detail="AZURE_SPEECH_KEY not configured")
        
        # ✅ FIX: Always create a fresh agent instance to avoid stale WebSocket references
        # This prevents "websocket.send after websocket.close" errors
        if lingo_agent is not None:
            # Stop and cleanup old agent
            try:
                await lingo_agent.stop()
            except:
                pass
        
        # Create fresh agent instance
        lingo_agent = MasterLingoAgent()
        
        # Set voice configuration (Azure Speech voices)
        if request.voice:
            lingo_agent.set_voice(request.voice, request.language)
        
        # Start the agent
        await lingo_agent.start()
        
        return {
            "status": "started",
            "message": "Master Lingo Agent is now listening with Azure Speech"
        }
    
    except Exception as e:
        logger.error(f"Error starting agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stop")
async def stop_agent():
    """Stop the Master Lingo Agent"""
    global lingo_agent
    
    try:
        if lingo_agent:
            await lingo_agent.stop()
        
        return {
            "status": "stopped",
            "message": "Master Lingo Agent stopped"
        }
    
    except Exception as e:
        logger.error(f"Error stopping agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def get_voices():
    """Get available Azure Speech voice options"""
    try:
        azure_speech_key = os.getenv("AZURE_SPEECH_KEY")
        if not azure_speech_key:
            raise HTTPException(status_code=500, detail="AZURE_SPEECH_KEY not configured")
        
        if lingo_agent is None:
            temp_agent = MasterLingoAgent()
            voices = temp_agent.get_available_voices()
        else:
            voices = lingo_agent.get_available_voices()
        
        return voices
    
    except Exception as e:
        logger.error(f"Error getting voices: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice")
async def set_voice(config: VoiceConfig):
    """Change voice configuration"""
    global lingo_agent
    
    try:
        if lingo_agent is None:
            raise HTTPException(status_code=400, detail="Agent not started")
        
        lingo_agent.set_voice(config.voice, config.language)
        
        return {
            "status": "success",
            "voice": config.voice,
            "language": config.language
        }
    
    except Exception as e:
        logger.error(f"Error setting voice: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset")
async def reset_conversation():
    """Reset conversation state for the current user"""
    try:
        from .conversation_state import conversation_manager
        
        # Reset for default user (TODO: Get from session/auth)
        user_id = "default_user"
        conversation_manager.reset(user_id)
        
        logger.info(f"🔄 Conversation state reset for user: {user_id}")
        
        return {
            "status": "success",
            "message": "Conversation reset successfully"
        }
    
    except Exception as e:
        logger.error(f"Error resetting conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time communication with Master Lingo Agent
    """
    global lingo_agent, active_websocket
    
    # ✅ FIX: Accept WebSocket connection immediately without validation
    # This fixes the 403 Forbidden error
    try:
        await websocket.accept()
        logger.info("✅ WebSocket connection established for Lingo Agent")
    except Exception as e:
        logger.error(f"❌ Failed to accept WebSocket connection: {e}")
        return
    
    # ✅ FIX: Track active WebSocket to prevent stale references
    async with websocket_lock:
        # Close old WebSocket if exists
        if active_websocket is not None:
            try:
                await active_websocket.close()
                logger.info("🔄 Closed previous WebSocket connection")
            except:
                pass
        active_websocket = websocket
    
    try:
        # Register callbacks for UI updates
        async def on_navigate(destination, data: Dict[str, Any] = None):
            """Handle navigation - accepts both string and dict formats"""
            # Handle dict format from Agent Lightning
            if isinstance(destination, dict):
                route = destination.get('route', '/')
                mode = destination.get('mode', 'direct')
                nav_data = destination.get('data', {})
                auto = destination.get('auto', True)
                
                message = {
                    "type": "navigate",
                    "destination": route,
                    "mode": mode,
                    "data": nav_data,
                    "auto": auto
                }
            # Handle string format from legacy code
            else:
                message = {
                    "type": "navigate",
                    "destination": destination,
                    "auto": True
                }
                if data:
                    message["data"] = data
            
            logger.info(f"📤 Sending navigation to frontend: {message['destination']}")
            await websocket.send_json(message)
        
        async def on_start_workflow(workflow_type, data: Dict[str, Any] = None):
            """Handle workflow start - accepts both string and dict formats"""
            # Handle dict format from Agent Lightning
            if isinstance(workflow_type, dict):
                wf_type = workflow_type.get('type', 'unknown')
                wf_id = workflow_type.get('id', '')
                wf_data = workflow_type.get('data', {})
                
                message = {
                    "type": "start_workflow",
                    "workflow_type": wf_type,
                    "workflow_id": wf_id,
                    "data": wf_data
                }
            # Handle string format from legacy code
            else:
                message = {
                    "type": "start_workflow",
                    "workflow_type": workflow_type,
                    "data": data or {}
                }
            
            logger.info(f"📤 Sending workflow start to frontend: {message['workflow_type']}")
            
            
            # 🚀 ACTUALLY START THE REAL WORKFLOW
            if MAF_AVAILABLE:
                try:
                    logger.info(f"🚀 Starting real MAF workflow: {message['workflow_type']}")
                    
                    # Create task request for MAF
                    task_request = {
                        "user_id": "lingo_user",
                        "request": f"Start {message['workflow_type']} workflow",
                        "priority": "normal",
                        "workflow_data": message.get('data', {})
                    }
                    
                    # Actually create the task in MAF
                    task_response = await create_task(task_request)
                    
                    if task_response and task_response.get('task_id'):
                        # Update message with real task ID
                        message['workflow_id'] = task_response['task_id']
                        message['real_workflow_started'] = True
                        logger.info(f"✅ Real workflow started with ID: {task_response['task_id']}")
                    else:
                        logger.warning("⚠️ Failed to start real workflow")
                        message['real_workflow_started'] = False
                        
                except Exception as e:
                    logger.error(f"❌ Error starting real workflow: {e}")
                    message['real_workflow_started'] = False
            else:
                logger.warning("⚠️ MAF not available - sending frontend-only message")
                message['real_workflow_started'] = False

            await websocket.send_json(message)
        
        async def on_update_ui(update: Dict[str, Any]):
            await websocket.send_json({
                "type": "ui_update",
                "data": update
            })
        
        async def on_user_message(text: str):
            """Stream user messages to frontend chat"""
            # ✅ FIX: Check if WebSocket is still active before sending
            if active_websocket != websocket:
                logger.warning("⚠️ Skipping message - WebSocket no longer active")
                return
            
            try:
                await websocket.send_json({
                    "type": "chat_message",
                    "role": "user",
                    "content": text,
                    "timestamp": asyncio.get_event_loop().time()
                })
                logger.info(f"💬 User message sent to frontend: {text[:50]}...")
            except Exception as e:
                logger.error(f"Error sending user message: {e}")
        
        async def on_agent_message(text: str, intent: str = None, confidence: float = None):
            """Stream agent messages to frontend chat"""
            # ✅ FIX: Check if WebSocket is still active before sending
            if active_websocket != websocket:
                logger.warning("⚠️ Skipping message - WebSocket no longer active")
                return
            
            try:
                await websocket.send_json({
                    "type": "chat_message",
                    "role": "assistant",
                    "content": text,
                    "intent": intent,
                    "confidence": confidence,
                    "timestamp": asyncio.get_event_loop().time()
                })
                logger.info(f"🤖 Agent message sent to frontend: {text[:50]}...")
            except Exception as e:
                logger.error(f"Error sending agent message: {e}")
        
        # ✅ CRITICAL FIX: Initialize agent if not already started
        global lingo_agent
        if lingo_agent is None:
            logger.info("🚀 Auto-initializing Master Lingo Agent for WebSocket connection")
            try:
                lingo_agent = MasterLingoAgent()
                await lingo_agent.start()
                logger.info("✅ Master Lingo Agent auto-initialized successfully")
            except Exception as e:
                logger.error(f"❌ Failed to auto-initialize agent: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": "Failed to initialize voice agent. Please check configuration."
                })
                return
        
        # Register callbacks IMMEDIATELY when WebSocket connects
        if lingo_agent:
            logger.info("✅ Registering callbacks with Master Lingo Agent")
            lingo_agent.register_callbacks(
                on_navigate=on_navigate,
                on_start_workflow=on_start_workflow,
                on_update_ui=on_update_ui,
                on_user_message=on_user_message,
                on_agent_message=on_agent_message
            )
            logger.info("✅ All callbacks registered successfully (navigation, workflow, chat)")
        else:
            logger.warning("⚠️ lingo_agent is still None after initialization attempt")
        
        # Keep connection alive and handle messages
        while True:
            data = await websocket.receive_json()
            
            message_type = data.get("type")
            
            if message_type == "text_input":
                text = data.get("text")
                if text:
                    logger.info(f"💬 User message: {text}")
                    
                    # 🚀 TRY AGENT LIGHTNING FIRST (if available)
                    if AGENT_LIGHTNING_AVAILABLE:
                        try:
                            logger.info("⚡ Processing with Agent Lightning...")
                            bridge = get_agent_lightning_bridge()
                            al_response = await bridge.process_message(
                                text=text,
                                user_id="default_user",
                                use_agent_lightning=True
                            )
                            
                            # Send main response
                            await websocket.send_json({
                                "type": "ui_update",
                                "data": al_response
                            })
                            
                            # Handle workflow if triggered
                            if al_response.get("workflow_started"):
                                await websocket.send_json({
                                    "type": "workflow_started",
                                    "workflow_type": al_response.get("workflow_type"),
                                    "workflow_id": al_response.get("workflow_id"),
                                    "data": al_response.get("navigation_data", {})
                                })
                                logger.info(f"✅ Workflow started: {al_response.get('workflow_type')}")
                            
                            # Handle navigation if needed
                            if al_response.get("navigate_to"):
                                await websocket.send_json({
                                    "type": "navigate",
                                    "destination": al_response.get("navigate_to"),
                                    "data": al_response.get("navigation_data", {}),
                                    "auto": al_response.get("auto_redirect", True)
                                })
                                logger.info(f"🧭 Navigating to: {al_response.get('navigate_to')}")
                            
                            logger.info(f"⚡ Agent Lightning processed successfully (confidence: {al_response.get('confidence', 0):.2f})")
                            continue  # Skip legacy processing
                            
                        except Exception as e:
                            logger.error(f"❌ Agent Lightning error: {e}, falling back to legacy")
                            # Fall through to legacy processing
                    
                    # 🚀 SIMPLE FIX: Use Master Lingo Agent directly
                    if lingo_agent and hasattr(lingo_agent, '_process_user_input'):
                        try:
                            logger.info(f"🤖 Processing with Master Lingo Agent: {text}")
                            
                            # Process with the master lingo agent
                            await lingo_agent._process_user_input(text)
                            
                            logger.info("✅ Master Lingo Agent processed message successfully")
                            continue  # Skip other processing
                            
                        except Exception as e:
                            logger.error(f"❌ Master Lingo Agent error: {e}")
                            # Fall through to other processing
                    
                    # Check if this is an AI Image command first
                    if await handle_ai_image_command(text, websocket):
                        logger.info("✓ Handled as AI Image command")
                        continue
                    
                    try:
                        # Import conversation modules
                        from .conversation_state import conversation_manager, ConversationPhase
                        from .question_flows import get_next_question, extract_answer, should_ask_more_questions, generate_confirmation_message
                        from .workflow_trigger import workflow_trigger
                        
                        # Get or create conversation state
                        user_id = "default_user"  # TODO: Get from WebSocket session
                        state = conversation_manager.get_or_create(user_id)
                        
                        # Add user message to history
                        state.add_message("user", text)
                        
                        # Determine conversation context
                        conversation_context = ""
                        if state.phase != ConversationPhase.INITIAL:
                            conversation_context = f"""
Current conversation context:
- Intent: {state.intent}
- Phase: {state.phase.value}
- Information collected: {state.collected_data}
- Current question: {state.current_question}
- Conversation history: {state.conversation_history[-3:] if len(state.conversation_history) > 3 else state.conversation_history}
"""
                        
                        # Only use LLM for INITIAL phase (intent detection)
                        # For COLLECTING phase, use structured questions only (no LLM delay)
                        llm_response = None
                        use_llm = (state.phase == ConversationPhase.INITIAL)
                        
                        if use_llm:
                            # Use Intelligent LLM for advanced intent detection and response generation
                            logger.info("🧠 Using Intelligent LLM for advanced conversation management")
                            
                            try:
                                from .intelligent_llm_handler import IntelligentLLMHandler, LLMProvider
                                
                                # Initialize intelligent LLM handler (Azure-focused)
                                llm_handler = IntelligentLLMHandler(LLMProvider.AZURE_OPENAI_GPT4O)
                                
                                # Analyze user intent with advanced AI
                                analysis = await llm_handler.analyze_user_intent(
                                    text, 
                                    state.conversation_history
                                )
                                
                                logger.info(f"🎯 LLM Analysis: Intent={analysis.get('intent')}, Confidence={analysis.get('confidence')}")
                                
                                # Use LLM analysis for better intent detection
                                detected_intent = analysis.get('intent', 'unclear')
                                extracted_data = analysis.get('extracted_data', {})
                                llm_response = analysis.get('suggested_response', '')
                                
                                # Update state with extracted information
                                if detected_intent in ['blog', 'travel', 'social', 'avatar', 'product', 'web', 'marketing', 'code']:
                                    state.intent = detected_intent
                                    state.phase = ConversationPhase.COLLECTING
                                    
                                    # Merge extracted data intelligently
                                    for key, value in extracted_data.items():
                                        if value and key not in state.collected_data:
                                            state.collected_data[key] = value
                                
                                logger.info(f"🧠 Intelligent LLM Response: {llm_response[:100]}...")
                                
                            except Exception as e:
                                logger.error(f"❌ Intelligent LLM failed, using fallback: {e}")
                                # Fallback to simple response
                                llm_response = "I'm here to help! I can assist with blog writing, travel planning, and much more. What would you like to work on?"
                        else:
                            # Skip LLM for COLLECTING/CONFIRMING phases - use structured questions only
                            logger.info(f"⚡ Skipping LLM (phase: {state.phase.value}) - will use structured questions")
                        
                        # Handle conversation flow based on phase
                        if state.phase == ConversationPhase.INITIAL:
                            # Initial message - detect intent and extract basic info
                            text_lower = text.lower()
                            
                            # Blog intent detection
                            if any(word in text_lower for word in ["blog", "article", "write", "content", "post"]):
                                state.intent = "blog"
                                state.phase = ConversationPhase.COLLECTING
                                
                                # Extract topic
                                topic_indicators = ["about", "on", "regarding"]
                                topic = text
                                for indicator in topic_indicators:
                                    if indicator in text_lower:
                                        parts = text.split(indicator, 1)
                                        if len(parts) > 1:
                                            topic = parts[1].strip()
                                            break
                                
                                # Clean topic
                                for word in ["write", "blog", "article", "a", "an", "the"]:
                                    topic = topic.replace(word, "").strip()
                                
                                state.collected_data["topic"] = topic if topic and len(topic) > 3 else text
                            
                            # Travel intent detection
                            elif any(word in text_lower for word in ["travel", "trip", "vacation", "flight", "hotel", "plan"]):
                                state.intent = "travel"
                                state.phase = ConversationPhase.COLLECTING
                                
                                # Extract locations with improved logic
                                import re
                                
                                # Pattern 1: "from X to Y"
                                from_to_pattern = r"from\s+([^,\s]+(?:\s+[^,\s]+)*)\s+to\s+([^,\s]+(?:\s+[^,\s]+)*)"
                                from_to_match = re.search(from_to_pattern, text_lower)
                                if from_to_match:
                                    state.collected_data["from"] = from_to_match.group(1).strip()
                                    state.collected_data["to"] = from_to_match.group(2).strip()
                                else:
                                    # Pattern 2: "to X" (extract destination)
                                    to_pattern = r"to\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)"
                                    to_match = re.search(to_pattern, text_lower)
                                    if to_match:
                                        destination = to_match.group(1).strip()
                                        # Clean up common words that might be captured
                                        destination_words = destination.split()
                                        if destination_words and destination_words[0] not in ['for', 'with', 'and', 'the', 'a', 'an']:
                                            state.collected_data["to"] = destination_words[0].title()
                                
                                # Extract duration if mentioned
                                duration_pattern = r"(\d+)\s*days?"
                                duration_match = re.search(duration_pattern, text_lower)
                                if duration_match:
                                    state.collected_data["duration"] = int(duration_match.group(1))
                                
                                # Extract budget if mentioned
                                budget_pattern = r"\$(\d+(?:,\d+)*)"
                                budget_match = re.search(budget_pattern, text)
                                if budget_match:
                                    state.collected_data["budget"] = budget_match.group(0)
                        
                        elif state.phase == ConversationPhase.COLLECTING:
                            # User is answering a question - use intelligent extraction
                            if state.current_question:
                                # Use intelligent LLM to extract answer
                                try:
                                    from .intelligent_llm_handler import IntelligentLLMHandler, LLMProvider
                                    llm_handler = IntelligentLLMHandler(LLMProvider.AZURE_OPENAI_GPT4O)
                                    
                                    # Generate intelligent response for form collection
                                    intelligent_response = await llm_handler.generate_conversational_response(
                                        text, 
                                        state.intent, 
                                        state.collected_data,
                                        state.conversation_history
                                    )
                                    
                                    # Also extract answer intelligently
                                    analysis = await llm_handler.analyze_user_intent(text, state.conversation_history)
                                    extracted_data = analysis.get('extracted_data', {})
                                    
                                    # Update collected data with intelligent extraction
                                    for key, value in extracted_data.items():
                                        if value and value != "extracted topic if any":  # Skip template values
                                            state.collected_data[key] = value
                                    
                                    logger.info(f"🧠 Intelligent extraction: {extracted_data}")
                                    
                                except Exception as e:
                                    logger.error(f"❌ Intelligent extraction failed: {e}")
                                    # Fallback to original method
                                    answer = extract_answer(state.current_question, text, state)
                                    state.collected_data[state.current_question] = answer
                                
                                state.current_question = None
                        
                        # Determine next action
                        next_message = None
                        workflow_result = None
                        
                        if state.phase == ConversationPhase.COLLECTING:
                            logger.info(f"📊 State: {state.intent}, Collected: {state.collected_data}, Questions asked: {len(state.questions_asked)}")
                            
                            if should_ask_more_questions(state):
                                # Ask next question
                                next_question = get_next_question(state)
                                if next_question:
                                    next_message = next_question
                                    logger.info(f"❓ Asking next question: {state.current_question}")
                                else:
                                    # No more questions, confirm and start workflow
                                    logger.info("✅ All questions answered, starting workflow")
                                    state.phase = ConversationPhase.CONFIRMING
                                    next_message = generate_confirmation_message(state)
                                    
                                    # Trigger workflow
                                    logger.info(f"🚀 Triggering workflow for {state.intent}")
                                    workflow_result = await workflow_trigger.trigger_workflow(state)
                                    logger.info(f"📝 Workflow result: {workflow_result}")
                            else:
                                # Ready to start workflow
                                logger.info("✅ Ready to start workflow (no more questions needed)")
                                state.phase = ConversationPhase.CONFIRMING
                                next_message = generate_confirmation_message(state)
                                
                                # Trigger workflow
                                logger.info(f"🚀 Triggering workflow for {state.intent}")
                                workflow_result = await workflow_trigger.trigger_workflow(state)
                                logger.info(f"📝 Workflow result: {workflow_result}")
                        
                        # Determine which message to send
                        # Priority: structured question/confirmation > LLM response
                        if next_message:
                            final_message = next_message
                            logger.info(f"📤 Using structured message: {final_message[:100]}...")
                        elif llm_response:
                            final_message = llm_response
                            logger.info(f"📤 Using LLM response: {final_message[:100]}...")
                        else:
                            # Fallback - should never happen
                            final_message = "I'm here to help! What would you like to do?"
                            logger.warning("⚠️ No message generated, using fallback")
                        
                        # Add final message to history
                        state.add_message("agent", final_message)
                        
                        # Send response
                        response_data = {
                            "message": final_message,
                            "intent": state.intent,
                            "extracted_data": state.collected_data,
                            "phase": state.phase.value
                        }
                        
                        await websocket.send_json({
                            "type": "ui_update",
                            "data": response_data
                        })
                        
                        # Send workflow status if triggered
                        if workflow_result:
                            if workflow_result.get("success"):
                                await websocket.send_json({
                                    "type": "workflow_started",
                                    "workflow_type": state.intent,
                                    "workflow_id": workflow_result.get("workflow_id"),
                                    "data": workflow_result.get("data", {}),
                                    "navigate_to": workflow_result.get("navigate_to"),
                                    "auto_redirect": workflow_result.get("auto_redirect", False)
                                })
                                
                                # Also send navigation event if specified
                                if workflow_result.get("navigate_to") and workflow_result.get("auto_redirect"):
                                    await websocket.send_json({
                                        "type": "navigate",
                                        "destination": workflow_result.get("navigate_to"),
                                        "data": workflow_result.get("data", {}),
                                        "auto": True
                                    })
                            else:
                                # Send error message
                                await websocket.send_json({
                                    "type": "ui_update",
                                    "data": {
                                        "message": workflow_result.get("message", "Sorry, I couldn't start the workflow."),
                                        "intent": state.intent,
                                        "phase": "error"
                                    }
                                })
                    
                    except Exception as e:
                        logger.error(f"Error processing message with LLM: {e}")
                        # Fallback response
                        await websocket.send_json({
                            "type": "ui_update",
                            "data": {
                                "message": "I'm here to help! I can assist with blog writing, travel planning, and more. What would you like to do?",
                                "intent": None
                            }
                        })
            
            elif message_type == "agent_selected":
                # Handle agent selection from frontend
                agent_id = data.get("agent_id")
                request_form_questions = data.get("request_form_questions", False)
                
                if agent_id and request_form_questions:
                    try:
                        # Import conversation modules
                        from .conversation_state import conversation_manager, ConversationPhase
                        from .question_flows import get_next_question
                        
                        # Get or create conversation state
                        user_id = "default_user"  # TODO: Get from WebSocket session
                        state = conversation_manager.get_or_create(user_id)
                        
                        # Set agent and intent
                        state.intent = agent_id
                        state.phase = ConversationPhase.COLLECTING
                        
                        # Clear previous data
                        state.collected_data = {}
                        state.questions_asked = []
                        state.current_question = None
                        
                        # Add agent selection to history
                        state.add_message("system", f"Selected {agent_id} agent")
                        
                        # Get first question
                        first_question = get_next_question(state)
                        
                        if first_question:
                            # Send first question
                            await websocket.send_json({
                                "type": "ui_update",
                                "data": {
                                    "message": first_question,
                                    "intent": agent_id,
                                    "phase": "collecting",
                                    "current_question": state.current_question
                                }
                            })
                            
                            # Add to conversation history
                            state.add_message("agent", first_question)
                        else:
                            # No questions for this agent type
                            await websocket.send_json({
                                "type": "ui_update",
                                "data": {
                                    "message": f"Great! I'll help you with {agent_id}. This agent type doesn't need additional information. Starting workflow now!",
                                    "intent": agent_id,
                                    "phase": "ready"
                                }
                            })
                    
                    except Exception as e:
                        logger.error(f"Error handling agent selection: {e}")
                        await websocket.send_json({
                            "type": "ui_update",
                            "data": {
                                "message": f"I've selected the {agent_id} agent. How can I help you today?",
                                "intent": agent_id
                            }
                        })
            
            elif message_type == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected for Lingo Agent")
    
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass
    
    finally:
        # ✅ FIX: Cleanup WebSocket reference
        async with websocket_lock:
            if active_websocket == websocket:
                active_websocket = None
                logger.info("🧹 Cleaned up WebSocket reference")



@router.websocket("/ws/realtime")
async def realtime_websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for Azure GPT-4o Realtime API
    Handles bidirectional audio streaming with <320ms latency
    """
    await websocket.accept()
    logger.info("🔌 Realtime WebSocket connected")
    
    from .azure_gpt4o_realtime import get_azure_gpt4o_realtime
    
    realtime = get_azure_gpt4o_realtime()
    is_connected = False
    
    try:
        # Connect to Azure Realtime API
        is_connected = await realtime.connect()
        
        if not is_connected:
            await websocket.send_json({
                "type": "error",
                "message": "Failed to connect to Realtime API"
            })
            return
        
        # Register callbacks
        async def on_audio_chunk(audio_bytes):
            """Send audio to frontend"""
            try:
                await websocket.send_bytes(audio_bytes)
            except Exception as e:
                logger.error(f"Error sending audio: {e}")
        
        async def on_transcript(text, is_final):
            """Send transcript to frontend"""
            try:
                await websocket.send_json({
                    "type": "transcript",
                    "text": text,
                    "is_final": is_final
                })
            except Exception as e:
                logger.error(f"Error sending transcript: {e}")
        
        async def on_function_call(name, args):
            """Handle function calls for navigation and workflows"""
            logger.info(f"🔧 Function call: {name}({args})")
            
            try:
                # Send function call to frontend
                await websocket.send_json({
                    "type": "function_call",
                    "name": name,
                    "args": args
                })
                
                # Execute function
                if name == "navigate_to_page":
                    page = args.get("page")
                    data = args.get("data", {})
                    
                    # Send navigation event
                    await websocket.send_json({
                        "type": "navigate",
                        "destination": f"/{page}",
                        "data": data,
                        "auto": True
                    })
                    
                    return {"success": True, "navigated_to": page}
                
                elif name == "start_workflow":
                    workflow_type = args.get("workflow_type")
                    workflow_data = args.get("data", {})
                    
                    # Send workflow event
                    await websocket.send_json({
                        "type": "start_workflow",
                        "workflow_type": workflow_type,
                        "data": workflow_data
                    })
                    
                    return {"success": True, "workflow_started": workflow_type}
                
                return {"error": "Unknown function"}
                
            except Exception as e:
                logger.error(f"Function call error: {e}")
                return {"error": str(e)}
        
        async def on_response_done():
            """Response complete"""
            try:
                await websocket.send_json({
                    "type": "response_done"
                })
            except Exception as e:
                logger.error(f"Error sending response_done: {e}")
        
        # Register all callbacks
        realtime.register_callbacks(
            on_audio_chunk=on_audio_chunk,
            on_transcript=on_transcript,
            on_function_call=on_function_call,
            on_response_done=on_response_done
        )
        
        # Send ready message
        await websocket.send_json({
            "type": "ready",
            "message": "Realtime API connected and ready"
        })
        
        logger.info("✅ Realtime API ready for audio streaming")
        
        # Handle incoming messages
        while True:
            message = await websocket.receive()
            
            if "bytes" in message:
                # Audio data from frontend
                audio_data = message["bytes"]
                await realtime.send_audio(audio_data)
            
            elif "text" in message:
                # JSON message from frontend
                data = json.loads(message["text"])
                msg_type = data.get("type")
                
                if msg_type == "text":
                    # Text message (for testing without audio)
                    text = data.get("text")
                    await realtime.send_text(text)
                
                elif msg_type == "ping":
                    # Keep-alive ping
                    await websocket.send_json({"type": "pong"})
                
                elif msg_type == "disconnect":
                    # Client requested disconnect
                    break
    
    except WebSocketDisconnect:
        logger.info("🔌 Realtime WebSocket disconnected")
    except Exception as e:
        logger.error(f"❌ Realtime WebSocket error: {e}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass
    
    finally:
        # Cleanup
        if is_connected:
            await realtime.disconnect()
        logger.info("🔌 Realtime WebSocket closed")
