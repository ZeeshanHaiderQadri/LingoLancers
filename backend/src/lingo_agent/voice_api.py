from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging
import json
import asyncio
from typing import Dict, Optional
import azure.cognitiveservices.speech as speechsdk

from .intelligent_llm_handler import IntelligentLLMHandler, LLMProvider
from .conversation_state import conversation_manager
from ..voice_agent.service import AzureVoiceService

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
voice_service = AzureVoiceService()
llm_handler = IntelligentLLMHandler(LLMProvider.AZURE_OPENAI_GPT4O)

class VoiceConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"🔌 Voice client connected: {client_id}")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"🔌 Voice client disconnected: {client_id}")

manager = VoiceConnectionManager()

@router.websocket("/ws/voice/{client_id}")
async def voice_websocket(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    
    # Create Azure streams
    push_stream = voice_service.create_push_stream()
    recognizer = voice_service.create_recognizer(push_stream)
    
    if not recognizer:
        await websocket.close(code=1000, reason="Voice service not configured")
        return

    # State
    is_listening = True
    current_text = ""
    
    # Event handlers for ASR
    def recognizing_cb(evt):
        """Callback for partial results"""
        nonlocal current_text
        if evt.result.text:
            asyncio.run_coroutine_threadsafe(
                websocket.send_json({
                    "type": "transcription_partial",
                    "text": evt.result.text
                }),
                asyncio.get_event_loop()
            )

    def recognized_cb(evt):
        """Callback for final results"""
        nonlocal current_text
        if evt.result.text:
            current_text = evt.result.text
            logger.info(f"🎤 Recognized: {current_text}")
            asyncio.run_coroutine_threadsafe(
                process_voice_input(websocket, client_id, current_text),
                asyncio.get_event_loop()
            )

    # Connect callbacks
    recognizer.recognizing.connect(recognizing_cb)
    recognizer.recognized.connect(recognized_cb)
    
    # Start continuous recognition
    recognizer.start_continuous_recognition()
    
    try:
        while True:
            # Receive audio chunks from client
            data = await websocket.receive_bytes()
            
            # Push to Azure SDK
            push_stream.write(data)
            
    except WebSocketDisconnect:
        manager.disconnect(client_id)
        recognizer.stop_continuous_recognition()
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")
        manager.disconnect(client_id)
        recognizer.stop_continuous_recognition()

async def process_voice_input(websocket: WebSocket, client_id: str, text: str):
    """Process recognized text and stream response"""
    
    # Send final transcript to UI
    await websocket.send_json({
        "type": "transcription_final",
        "text": text
    })
    
    # Get conversation state
    state = conversation_manager.get_or_create(client_id)
    state.add_message("user", text)
    
    # Analyze intent (simplified for voice speed)
    # For full implementation, we might want to skip deep analysis for speed
    # or do it in parallel. For now, let's just generate a response.
    
    # Send "thinking" state
    await websocket.send_json({"type": "agent_state", "state": "thinking"})
    
    # Stream LLM response
    full_response = ""
    
    # Use the streaming method we added
    response_generator = llm_handler.generate_streaming_conversational_response(
        text,
        state.intent or "general",
        state.collected_data,
        state.conversation_history
    )
    
    await websocket.send_json({"type": "agent_state", "state": "speaking"})
    
    # Buffer for TTS (sentences or chunks)
    current_sentence = ""
    
    async for token in response_generator:
        full_response += token
        current_sentence += token
        
        # Send text chunk to UI
        await websocket.send_json({
            "type": "agent_text_chunk",
            "text": token
        })
        
        # Simple sentence detection for TTS streaming
        if any(punct in token for punct in [".", "!", "?", "\n"]):
            if len(current_sentence.strip()) > 5: # Avoid tiny chunks
                # Stream audio for this sentence
                async for audio_chunk in voice_service.text_to_speech_stream(current_sentence):
                    await websocket.send_bytes(audio_chunk)
                current_sentence = ""
    
    # Process remaining text
    if current_sentence.strip():
        async for audio_chunk in voice_service.text_to_speech_stream(current_sentence):
            await websocket.send_bytes(audio_chunk)
            
    # Update state
    state.add_message("assistant", full_response)
    await websocket.send_json({"type": "agent_state", "state": "listening"})
