"""
Azure OpenAI GPT-4o Realtime API Integration
This is the BEST solution for voice - < 300ms latency with native voice
"""

import os
import asyncio
import json
import websockets
import base64
from typing import Optional, Callable
import logging

logger = logging.getLogger(__name__)


class AzureRealtimeVoice:
    """
    Azure OpenAI GPT-4o Realtime API
    
    Features:
    - < 300ms latency (vs 3-5s with regular GPT)
    - Built-in STT + TTS (no Deepgram needed)
    - Native interruption handling
    - Streaming audio in/out
    - Voice-optimized responses
    """
    
    def __init__(
        self,
        endpoint: Optional[str] = None,
        api_key: Optional[str] = None
    ):
        self.endpoint = endpoint or os.getenv("AZURE_OPENAI_REALTIME_ENDPOINT")
        self.api_key = api_key or os.getenv("AZURE_OPENAI_REALTIME_KEY")
        
        if not self.endpoint or not self.api_key:
            logger.error("Azure Realtime credentials not configured")
            self.available = False
        else:
            self.available = True
        
        self.ws = None
        self.is_connected = False
        self.is_speaking = False
        
        # Callbacks
        self.on_transcript: Optional[Callable] = None
        self.on_audio_chunk: Optional[Callable] = None
        self.on_response_done: Optional[Callable] = None
        
        # Voice settings
        self.voice = "alloy"  # Options: alloy, echo, fable, onyx, nova, shimmer
        self.instructions = """You are a helpful voice assistant.
Keep responses concise and conversational.
Speak naturally as if talking to a friend.
Maximum 2-3 sentences unless asked for more."""
    
    async def connect(self):
        """Connect to Azure Realtime API via WebSocket"""
        if not self.available:
            logger.error("Azure Realtime not available")
            return False
        
        try:
            # Build WebSocket URL
            ws_url = self.endpoint.replace("https://", "wss://")
            
            # Connect with API key in header
            self.ws = await websockets.connect(
                ws_url,
                additional_headers={
                    "api-key": self.api_key
                }
            )
            
            self.is_connected = True
            logger.info("✓ Connected to Azure Realtime API")
            
            # Send session configuration
            await self._configure_session()
            
            # Start listening for responses
            asyncio.create_task(self._listen_for_responses())
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Azure Realtime: {e}")
            self.is_connected = False
            return False
    
    async def _configure_session(self):
        """Configure the realtime session"""
        config = {
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": self.instructions,
                "voice": self.voice,
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "input_audio_transcription": {
                    "model": "whisper-1"
                },
                "turn_detection": {
                    "type": "server_vad",  # Voice Activity Detection
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 500
                },
                "temperature": 0.7,
                "max_response_output_tokens": 150
            }
        }
        
        await self.ws.send(json.dumps(config))
        logger.info("✓ Session configured")
    
    async def send_audio(self, audio_data: bytes):
        """
        Send audio data to the API
        
        Args:
            audio_data: Raw PCM16 audio bytes
        """
        if not self.is_connected:
            logger.error("Not connected to Azure Realtime")
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
            logger.error(f"Error sending audio: {e}")
    
    async def commit_audio(self):
        """Commit audio buffer and trigger response"""
        if not self.is_connected:
            return
        
        try:
            message = {
                "type": "input_audio_buffer.commit"
            }
            await self.ws.send(json.dumps(message))
            
            # Create response
            message = {
                "type": "response.create",
                "response": {
                    "modalities": ["text", "audio"],
                    "instructions": "Respond naturally and concisely."
                }
            }
            await self.ws.send(json.dumps(message))
            
        except Exception as e:
            logger.error(f"Error committing audio: {e}")
    
    async def send_text(self, text: str):
        """
        Send text message (for testing without audio)
        
        Args:
            text: User's text message
        """
        if not self.is_connected:
            logger.error("Not connected")
            return
        
        try:
            # Add user message
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
            
            # Create response
            message = {
                "type": "response.create",
                "response": {
                    "modalities": ["text", "audio"]
                }
            }
            await self.ws.send(json.dumps(message))
            
        except Exception as e:
            logger.error(f"Error sending text: {e}")
    
    async def _listen_for_responses(self):
        """Listen for responses from the API"""
        try:
            async for message in self.ws:
                data = json.loads(message)
                await self._handle_message(data)
                
        except Exception as e:
            logger.error(f"Error listening for responses: {e}")
            self.is_connected = False
    
    async def _handle_message(self, data: dict):
        """Handle incoming messages from the API"""
        msg_type = data.get("type")
        
        if msg_type == "response.audio.delta":
            # Streaming audio chunk
            if self.on_audio_chunk:
                audio_b64 = data.get("delta", "")
                audio_bytes = base64.b64decode(audio_b64)
                await self.on_audio_chunk(audio_bytes)
        
        elif msg_type == "response.audio_transcript.delta":
            # Transcript of what agent is saying
            transcript = data.get("delta", "")
            if transcript and self.on_transcript:
                await self.on_transcript(transcript, False)
        
        elif msg_type == "response.audio_transcript.done":
            # Complete transcript
            transcript = data.get("transcript", "")
            if transcript and self.on_transcript:
                await self.on_transcript(transcript, True)
        
        elif msg_type == "response.done":
            # Response complete
            if self.on_response_done:
                await self.on_response_done()
        
        elif msg_type == "input_audio_buffer.speech_started":
            # User started speaking (interruption detection)
            logger.info("User started speaking")
            if self.is_speaking:
                # Cancel current response
                await self.cancel_response()
        
        elif msg_type == "input_audio_buffer.speech_stopped":
            # User stopped speaking
            logger.info("User stopped speaking")
            await self.commit_audio()
        
        elif msg_type == "error":
            # Error occurred
            error = data.get("error", {})
            logger.error(f"API error: {error}")
    
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
            logger.info("Response cancelled")
            
        except Exception as e:
            logger.error(f"Error cancelling response: {e}")
    
    async def disconnect(self):
        """Disconnect from the API"""
        if self.ws:
            await self.ws.close()
            self.is_connected = False
            logger.info("Disconnected from Azure Realtime")
    
    def set_voice(self, voice: str):
        """
        Change voice
        
        Options:
        - alloy: Neutral, balanced
        - echo: Male, clear
        - fable: British accent
        - onyx: Deep male
        - nova: Female, energetic
        - shimmer: Female, warm
        """
        self.voice = voice
        logger.info(f"Voice changed to: {voice}")
    
    def set_instructions(self, instructions: str):
        """Update system instructions"""
        self.instructions = instructions
        logger.info("Instructions updated")


# Singleton instance
_realtime_instance: Optional[AzureRealtimeVoice] = None


def get_realtime_voice() -> AzureRealtimeVoice:
    """Get or create Azure Realtime Voice instance"""
    global _realtime_instance
    
    if _realtime_instance is None:
        _realtime_instance = AzureRealtimeVoice()
    
    return _realtime_instance
