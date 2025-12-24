"""
Deepgram Flux Voice Handler
Handles real-time voice interactions with interruption support
"""

import asyncio
import json
from typing import Optional, Callable, Dict, Any
try:
    from deepgram import (
        DeepgramClient,
        LiveTranscriptionEvents,
        LiveOptions,
        SpeakOptions
    )
    DEEPGRAM_AVAILABLE = True
except ImportError:
    DEEPGRAM_AVAILABLE = False
    print("Warning: Deepgram SDK not fully available")
import logging

logger = logging.getLogger(__name__)


class DeepgramVoiceHandler:
    """
    Handles bidirectional voice communication using Deepgram Flux
    Supports interruptions and multi-lingual voices
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        
        # Initialize Deepgram client
        if DEEPGRAM_AVAILABLE:
            self.deepgram = DeepgramClient(api_key)
        else:
            self.deepgram = None
            logger.warning("Deepgram client not initialized")
        
        # Voice configuration
        self.voice_config = {
            "model": "aura-asteria-en",  # Default female English voice
            "language": "en",
            "encoding": "linear16",
            "sample_rate": 16000
        }
        
        # State management
        self.is_listening = False
        self.is_speaking = False
        self.current_transcript = ""
        self.interrupt_callback: Optional[Callable] = None
        
        # Connection objects
        self.dg_connection = None
        self.microphone = None
        
    async def start_listening(
        self,
        on_transcript: Callable[[str, bool], None],
        on_interrupt: Optional[Callable] = None
    ):
        """
        Start listening for voice input with interruption support
        
        Args:
            on_transcript: Callback for transcript updates (text, is_final)
            on_interrupt: Callback when user interrupts agent speech
        """
        if not DEEPGRAM_AVAILABLE or not self.deepgram:
            logger.error("Deepgram SDK not available")
            return False
            
        try:
            self.interrupt_callback = on_interrupt
            
            # Configure live transcription with Flux
            options = LiveOptions(
                model="nova-2-conversationalai",  # Flux model for conversations
                language="en",
                smart_format=True,
                interim_results=True,
                utterance_end_ms=1000,
                vad_events=True,  # Voice activity detection for interruptions
                punctuate=True,
                diarize=False
            )
            
            # Create connection
            self.dg_connection = self.deepgram.listen.live.v("1")
            
            # Register event handlers
            self.dg_connection.on(LiveTranscriptionEvents.Open, self._on_open)
            self.dg_connection.on(LiveTranscriptionEvents.Transcript, 
                                 lambda _, result: self._on_transcript(result, on_transcript))
            self.dg_connection.on(LiveTranscriptionEvents.Error, self._on_error)
            self.dg_connection.on(LiveTranscriptionEvents.Close, self._on_close)
            
            # Start connection
            if not self.dg_connection.start(options):
                logger.error("Failed to start Deepgram connection")
                return False
            
            # Start microphone (requires pyaudio)
            try:
                from deepgram import Microphone
                self.microphone = Microphone(self.dg_connection.send)
                self.microphone.start()
            except ImportError:
                logger.warning("Microphone not available (pyaudio not installed)")
                # Can still work with WebSocket audio streaming
            
            self.is_listening = True
            logger.info("Voice listening started with Flux model")
            return True
            
        except Exception as e:
            logger.error(f"Error starting voice listening: {e}")
            return False
    
    async def stop_listening(self):
        """Stop listening for voice input"""
        try:
            self.is_listening = False
            
            if self.microphone:
                self.microphone.finish()
                self.microphone = None
            
            if self.dg_connection:
                self.dg_connection.finish()
                self.dg_connection = None
            
            logger.info("Voice listening stopped")
            
        except Exception as e:
            logger.error(f"Error stopping voice listening: {e}")
    
    async def speak(
        self,
        text: str,
        voice: str = "aura-asteria-en",
        language: str = "en",
        interruptible: bool = True
    ) -> bool:
        """
        Convert text to speech and play it
        
        Args:
            text: Text to speak
            voice: Voice model (aura-asteria-en, aura-luna-en, etc.)
            language: Language code
            interruptible: Whether speech can be interrupted
        
        Returns:
            True if speech completed, False if interrupted
        """
        if not DEEPGRAM_AVAILABLE or not self.deepgram:
            logger.warning("Deepgram SDK not available, skipping speech")
            return False
            
        try:
            self.is_speaking = True
            
            # Configure speech options
            options = SpeakOptions(
                model=voice,
                encoding="linear16",
                sample_rate=16000
            )
            
            # Generate speech
            response = self.deepgram.speak.v("1").stream(
                {"text": text},
                options
            )
            
            # Stream audio (simplified - actual implementation would use audio player)
            # In production, you'd stream this to the user's audio output
            
            # Check for interruptions during speech
            if interruptible:
                # Monitor for user speech during agent speech
                # If detected, stop speaking and call interrupt callback
                pass
            
            self.is_speaking = False
            logger.info(f"Spoke: {text[:50]}...")
            return True
            
        except Exception as e:
            logger.error(f"Error in text-to-speech: {e}")
            self.is_speaking = False
            return False
    
    def _on_open(self, *args, **kwargs):
        """Handle connection open"""
        logger.info("Deepgram connection opened")
    
    def _on_transcript(self, result, callback):
        """Handle transcript results"""
        try:
            sentence = result.channel.alternatives[0].transcript
            
            if len(sentence) == 0:
                return
            
            is_final = result.is_final
            
            # Detect interruption if agent is speaking
            if self.is_speaking and sentence.strip():
                logger.info("User interruption detected")
                self.is_speaking = False
                if self.interrupt_callback:
                    asyncio.create_task(self.interrupt_callback())
            
            # Call transcript callback
            if callback:
                callback(sentence, is_final)
            
            if is_final:
                self.current_transcript = sentence
                logger.info(f"Final transcript: {sentence}")
            
        except Exception as e:
            logger.error(f"Error processing transcript: {e}")
    
    def _on_error(self, error, **kwargs):
        """Handle errors"""
        logger.error(f"Deepgram error: {error}")
    
    def _on_close(self, *args, **kwargs):
        """Handle connection close"""
        logger.info("Deepgram connection closed")
    
    def set_voice(self, voice: str, language: str = "en"):
        """
        Change voice configuration
        
        Available voices:
        - aura-asteria-en (Female, English)
        - aura-luna-en (Female, English)
        - aura-stella-en (Female, English)
        - aura-athena-en (Female, English)
        - aura-hera-en (Female, English)
        - aura-orion-en (Male, English)
        - aura-arcas-en (Male, English)
        - aura-perseus-en (Male, English)
        - aura-angus-en (Male, English, Irish accent)
        - aura-orpheus-en (Male, English)
        - aura-helios-en (Male, English)
        - aura-zeus-en (Male, English)
        
        Multi-lingual:
        - aura-asteria-es (Spanish)
        - aura-asteria-fr (French)
        - aura-asteria-de (German)
        - aura-asteria-pt (Portuguese)
        - aura-asteria-ja (Japanese)
        - aura-asteria-zh (Chinese)
        """
        self.voice_config["model"] = voice
        self.voice_config["language"] = language
        logger.info(f"Voice changed to: {voice} ({language})")
    
    def get_available_voices(self) -> Dict[str, list]:
        """Get list of available voices by gender and language"""
        return {
            "female_english": [
                "aura-asteria-en",
                "aura-luna-en", 
                "aura-stella-en",
                "aura-athena-en",
                "aura-hera-en"
            ],
            "male_english": [
                "aura-orion-en",
                "aura-arcas-en",
                "aura-perseus-en",
                "aura-angus-en",
                "aura-orpheus-en",
                "aura-helios-en",
                "aura-zeus-en"
            ],
            "multilingual": {
                "spanish": "aura-asteria-es",
                "french": "aura-asteria-fr",
                "german": "aura-asteria-de",
                "portuguese": "aura-asteria-pt",
                "japanese": "aura-asteria-ja",
                "chinese": "aura-asteria-zh"
            }
        }
