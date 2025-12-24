"""
Azure OpenAI GPT-4o Realtime API - Complete Human-Like Voice Experience
Ultra-low latency (<320ms), natural conversations, interruption support
"""

import os
import asyncio
import json
import websockets
import base64
from typing import Optional, Callable, Dict, Any
import logging
import struct
import numpy as np

logger = logging.getLogger(__name__)


class AzureGPT4oRealtime:
    """
    Azure OpenAI GPT-4o Realtime API Integration
    
    Features:
    - <320ms end-to-end latency (vs 3-5s traditional pipeline)
    - Built-in Speech-to-Text + Text-to-Speech (no separate services needed)
    - Native interruption handling (user can interrupt agent mid-sentence)
    - Streaming audio in/out for natural conversation flow
    - Voice Activity Detection (VAD) for automatic turn-taking
    - Function calling support for navigation and workflows
    """
    
    def __init__(self):
        """Initialize Azure GPT-4o Realtime API"""
        # Azure OpenAI Realtime credentials
        self.endpoint = os.getenv("AZURE_OPENAI_REALTIME_ENDPOINT")
        self.api_key = os.getenv("AZURE_OPENAI_REALTIME_KEY")
        self.deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-realtime-preview")
        
        if not self.endpoint or not self.api_key:
            logger.error("❌ Azure Realtime API credentials not configured")
            logger.error("   Set AZURE_OPENAI_REALTIME_ENDPOINT and AZURE_OPENAI_REALTIME_KEY")
            self.available = False
        else:
            self.available = True
            logger.info("✅ Azure GPT-4o Realtime API configured")
        
        # WebSocket connection
        self.ws = None
        self.is_connected = False
        self.is_speaking = False
        self.is_listening = True
        
        # Callbacks
        self.on_transcript: Optional[Callable] = None  # (text, is_final) -> None
        self.on_audio_chunk: Optional[Callable] = None  # (audio_bytes) -> None
        self.on_response_done: Optional[Callable] = None  # () -> None
        self.on_function_call: Optional[Callable] = None  # (function_name, args) -> result
        self.on_interrupt: Optional[Callable] = None  # () -> None
        
        # Voice settings
        self.voice = "alloy"  # Options: alloy, echo, fable, onyx, nova, shimmer
        self.temperature = 0.8  # Higher = more creative, lower = more focused
        self.max_response_tokens = 4096
        
        # System instructions
        self.instructions = """You are Master Lingo, a helpful voice assistant.

Your capabilities:
- Help users plan trips and book travel
- Write blog articles and content
- Create AI-generated images
- Navigate the dashboard and start workflows

Communication style:
- Keep responses concise (2-3 sentences max unless asked for more)
- Speak naturally and conversationally
- Be friendly and helpful
- Ask clarifying questions when needed
- Confirm before taking actions

When users ask you to do something:
1. Confirm you understand what they want
2. Use function calls to navigate or start workflows
3. Provide clear feedback on what's happening"""
        
        # Audio buffer for incoming audio
        self.audio_buffer = bytearray()
        
        # Session state
        self.session_id = None
        self.conversation_id = None
    
    async def connect(self) -> bool:
        """Connect to Azure GPT-4o Realtime API"""
        if not self.available:
            logger.error("❌ Azure Realtime API not available")
            return False
        
        try:
            # Build WebSocket URL
            ws_url = self.endpoint.replace("https://", "wss://").replace("http://", "ws://")
            if not ws_url.startswith("wss://"):
                ws_url = f"wss://{ws_url}"
            
            logger.info(f"🔌 Connecting to Azure Realtime API...")
            
            # Connect with API key in header
            import ssl
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            self.ws = await websockets.connect(
                ws_url,
                additional_headers={
                    "api-key": self.api_key,
                    "OpenAI-Beta": "realtime=v1"
                },
                ssl=ssl_context,
                ping_interval=20,
                ping_timeout=10
            )
            
            self.is_connected = True
            logger.info("✅ Connected to Azure GPT-4o Realtime API")
            
            # Configure session
            await self._configure_session()
            
            # Start listening for responses
            asyncio.create_task(self._listen_for_responses())
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Azure Realtime API: {e}")
            self.is_connected = False
            return False
    
    async def _configure_session(self):
        """Configure the realtime session with optimal settings"""
        config = {
            "type": "session.update",
            "session": {
                # Enable both text and audio modalities
                "modalities": ["text", "audio"],
                
                # System instructions
                "instructions": self.instructions,
                
                # Voice settings
                "voice": self.voice,
                
                # Audio format (PCM16 at 24kHz)
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                
                # Enable input audio transcription
                "input_audio_transcription": {
                    "model": "whisper-1"
                },
                
                # Voice Activity Detection for automatic turn-taking
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,  # Sensitivity (0.0-1.0)
                    "prefix_padding_ms": 300,  # Audio before speech starts
                    "silence_duration_ms": 700  # Silence to end turn
                },
                
                # Response generation settings
                "temperature": self.temperature,
                "max_response_output_tokens": self.max_response_tokens,
                
                # Function calling tools
                "tools": [
                    {
                        "type": "function",
                        "name": "navigate_to_page",
                        "description": "Navigate to a specific page or dashboard in the application",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "page": {
                                    "type": "string",
                                    "enum": ["blog-team", "travel-team", "ai-image", "ai-chat", "dashboard"],
                                    "description": "The page to navigate to"
                                },
                                "data": {
                                    "type": "object",
                                    "description": "Optional data to pass to the page"
                                }
                            },
                            "required": ["page"]
                        }
                    },
                    {
                        "type": "function",
                        "name": "start_workflow",
                        "description": "Start a workflow (blog writing, travel planning, etc.)",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "workflow_type": {
                                    "type": "string",
                                    "enum": ["blog", "travel", "ai_image"],
                                    "description": "Type of workflow to start"
                                },
                                "data": {
                                    "type": "object",
                                    "description": "Workflow data (topic, destination, etc.)"
                                }
                            },
                            "required": ["workflow_type", "data"]
                        }
                    }
                ],
                
                # Enable tool choice
                "tool_choice": "auto"
            }
        }
        
        await self.ws.send(json.dumps(config))
        logger.info("✅ Session configured with function calling support")
    
    async def send_audio(self, audio_data: bytes):
        """
        Send audio data to the API
        
        Args:
            audio_data: Raw PCM16 audio bytes (24kHz, mono, 16-bit)
        """
        if not self.is_connected or not self.is_listening:
            return
        
        try:
            # Encode audio as base64
            audio_b64 = base64.b64encode(audio_data).decode('utf-8')
            
            # Send audio chunk
            message = {
                "type": "input_audio_buffer.append",
                "audio": audio_b64
            }
            
            await self.ws.send(json.dumps(message))
            
        except Exception as e:
            logger.error(f"❌ Error sending audio: {e}")
    
    async def send_text(self, text: str):
        """
        Send text message (for testing or text-only mode)
        
        Args:
            text: User's text message
        """
        if not self.is_connected:
            logger.error("❌ Not connected to Realtime API")
            return
        
        try:
            # Create conversation item
            message = {
                "type": "conversation.item.create",
                "item": {
                    "type": "message",
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": text
                        }
                    ]
                }
            }
            await self.ws.send(json.dumps(message))
            
            # Trigger response
            message = {
                "type": "response.create"
            }
            await self.ws.send(json.dumps(message))
            
            logger.info(f"📤 Sent text: {text[:50]}...")
            
        except Exception as e:
            logger.error(f"❌ Error sending text: {e}")
    
    async def _listen_for_responses(self):
        """Listen for responses from the API"""
        try:
            async for message in self.ws:
                data = json.loads(message)
                await self._handle_message(data)
                
        except websockets.exceptions.ConnectionClosed:
            logger.warning("⚠️ WebSocket connection closed")
            self.is_connected = False
        except Exception as e:
            logger.error(f"❌ Error listening for responses: {e}")
            self.is_connected = False
    
    async def _handle_message(self, data: dict):
        """Handle incoming messages from the API"""
        msg_type = data.get("type")
        
        # Session events
        if msg_type == "session.created":
            self.session_id = data.get("session", {}).get("id")
            logger.info(f"✅ Session created: {self.session_id}")
        
        elif msg_type == "session.updated":
            logger.info("✅ Session updated")
        
        # Input audio events
        elif msg_type == "input_audio_buffer.speech_started":
            logger.info("🎤 User started speaking")
            if self.is_speaking:
                # User interrupted - cancel current response
                await self.cancel_response()
                if self.on_interrupt:
                    await self.on_interrupt()
        
        elif msg_type == "input_audio_buffer.speech_stopped":
            logger.info("🎤 User stopped speaking")
            # VAD detected end of speech - response will be generated automatically
        
        elif msg_type == "input_audio_buffer.committed":
            logger.info("✅ Audio buffer committed")
        
        # Conversation events
        elif msg_type == "conversation.item.created":
            item = data.get("item", {})
            logger.info(f"💬 Conversation item created: {item.get('type')}")
        
        elif msg_type == "conversation.item.input_audio_transcription.completed":
            # User's speech transcribed
            transcript = data.get("transcript", "")
            if transcript and self.on_transcript:
                await self.on_transcript(transcript, True)
                logger.info(f"📝 User said: {transcript}")
        
        # Response events
        elif msg_type == "response.created":
            response_id = data.get("response", {}).get("id")
            logger.info(f"🤖 Response created: {response_id}")
            self.is_speaking = True
        
        elif msg_type == "response.output_item.added":
            item = data.get("item", {})
            logger.info(f"📦 Output item added: {item.get('type')}")
        
        elif msg_type == "response.content_part.added":
            part = data.get("part", {})
            logger.info(f"📄 Content part added: {part.get('type')}")
        
        elif msg_type == "response.audio.delta":
            # Streaming audio chunk from agent
            if self.on_audio_chunk:
                audio_b64 = data.get("delta", "")
                if audio_b64:
                    audio_bytes = base64.b64decode(audio_b64)
                    await self.on_audio_chunk(audio_bytes)
        
        elif msg_type == "response.audio_transcript.delta":
            # Transcript of what agent is saying (streaming)
            transcript = data.get("delta", "")
            if transcript and self.on_transcript:
                await self.on_transcript(transcript, False)
        
        elif msg_type == "response.audio_transcript.done":
            # Complete transcript of agent's response
            transcript = data.get("transcript", "")
            if transcript:
                logger.info(f"🗣️ Agent said: {transcript}")
        
        elif msg_type == "response.function_call_arguments.delta":
            # Function call arguments streaming
            delta = data.get("delta", "")
            logger.info(f"🔧 Function call args delta: {delta}")
        
        elif msg_type == "response.function_call_arguments.done":
            # Function call complete
            call_id = data.get("call_id")
            name = data.get("name")
            arguments = data.get("arguments", "{}")
            
            logger.info(f"🔧 Function call: {name}({arguments})")
            
            # Execute function call
            if self.on_function_call:
                try:
                    args = json.loads(arguments)
                    result = await self.on_function_call(name, args)
                    
                    # Send function result back
                    await self._send_function_result(call_id, result)
                except Exception as e:
                    logger.error(f"❌ Function call error: {e}")
                    await self._send_function_result(call_id, {"error": str(e)})
        
        elif msg_type == "response.done":
            # Response complete
            logger.info("✅ Response done")
            self.is_speaking = False
            if self.on_response_done:
                await self.on_response_done()
        
        # Error events
        elif msg_type == "error":
            error = data.get("error", {})
            logger.error(f"❌ API error: {error}")
        
        # Rate limit events
        elif msg_type == "rate_limits.updated":
            limits = data.get("rate_limits", [])
            for limit in limits:
                logger.debug(f"📊 Rate limit: {limit.get('name')} = {limit.get('remaining')}/{limit.get('limit')}")
    
    async def _send_function_result(self, call_id: str, result: Any):
        """Send function call result back to the API"""
        try:
            message = {
                "type": "conversation.item.create",
                "item": {
                    "type": "function_call_output",
                    "call_id": call_id,
                    "output": json.dumps(result)
                }
            }
            await self.ws.send(json.dumps(message))
            
            # Trigger next response
            message = {
                "type": "response.create"
            }
            await self.ws.send(json.dumps(message))
            
        except Exception as e:
            logger.error(f"❌ Error sending function result: {e}")
    
    async def cancel_response(self):
        """Cancel current response (for interruptions)"""
        if not self.is_connected:
            return
        
        try:
            message = {
                "type": "response.cancel"
            }
            await self.ws.send(json.dumps(message))
            self.is_speaking = False
            logger.info("🛑 Response cancelled")
            
        except Exception as e:
            logger.error(f"❌ Error cancelling response: {e}")
    
    async def disconnect(self):
        """Disconnect from the API"""
        if self.ws:
            try:
                await self.ws.close()
            except:
                pass
            self.is_connected = False
            logger.info("👋 Disconnected from Azure Realtime API")
    
    def set_voice(self, voice: str):
        """
        Change voice
        
        Options:
        - alloy: Neutral, balanced (default)
        - echo: Male, clear
        - fable: British accent
        - onyx: Deep male
        - nova: Female, energetic
        - shimmer: Female, warm
        """
        self.voice = voice
        logger.info(f"🎙️ Voice changed to: {voice}")
    
    def set_instructions(self, instructions: str):
        """Update system instructions"""
        self.instructions = instructions
        logger.info("📝 Instructions updated")
    
    def register_callbacks(
        self,
        on_transcript: Optional[Callable] = None,
        on_audio_chunk: Optional[Callable] = None,
        on_response_done: Optional[Callable] = None,
        on_function_call: Optional[Callable] = None,
        on_interrupt: Optional[Callable] = None
    ):
        """Register callbacks for events"""
        self.on_transcript = on_transcript
        self.on_audio_chunk = on_audio_chunk
        self.on_response_done = on_response_done
        self.on_function_call = on_function_call
        self.on_interrupt = on_interrupt
        logger.info("✅ Callbacks registered")


# Singleton instance
_realtime_instance: Optional[AzureGPT4oRealtime] = None


def get_azure_gpt4o_realtime() -> AzureGPT4oRealtime:
    """Get or create Azure GPT-4o Realtime instance"""
    global _realtime_instance
    
    if _realtime_instance is None:
        _realtime_instance = AzureGPT4oRealtime()
    
    return _realtime_instance
