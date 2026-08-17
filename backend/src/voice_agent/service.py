import os
import azure.cognitiveservices.speech as speechsdk
import logging
import asyncio
from typing import Optional, Callable, AsyncGenerator

logger = logging.getLogger(__name__)

class AzureVoiceService:
    """
    Wrapper for Azure Speech Services (ASR & TTS)
    """
    def __init__(self):
        self.speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.service_region = os.getenv("AZURE_SPEECH_REGION")
        
        if not self.speech_key or not self.service_region:
            logger.warning("⚠️ Azure Speech credentials not found. Voice features will be disabled.")
            self.is_configured = False
        else:
            self.speech_config = speechsdk.SpeechConfig(
                subscription=self.speech_key, 
                region=self.service_region
            )
            self.speech_config.speech_recognition_language = "en-US"
            self.speech_config.speech_synthesis_voice_name = "en-US-AvaMultilingualNeural" # Modern neural voice
            self.is_configured = True
            logger.info("✅ Azure Voice Service initialized")

    async def text_to_speech_stream(self, text: str) -> AsyncGenerator[bytes, None]:
        """
        Convert text to speech and yield audio chunks
        """
        if not self.is_configured:
            return

        # Create a push stream to capture audio data
        pull_stream = speechsdk.audio.PullAudioOutputStream()
        
        # Configure audio output to use the pull stream
        audio_config = speechsdk.audio.AudioOutputConfig(stream=pull_stream)
        
        # Create synthesizer
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=self.speech_config, 
            audio_config=audio_config
        )

        # Start synthesis
        result = synthesizer.speak_text_async(text).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            # Read from the stream
            audio_buffer = bytes(3200) # 100ms chunk at 16kHz 16-bit mono
            total_read = 0
            
            while True:
                read_bytes = pull_stream.read(audio_buffer)
                if read_bytes == 0:
                    break
                yield audio_buffer[:read_bytes]
                total_read += read_bytes
                # Small yield to allow event loop to run
                await asyncio.sleep(0.01)
                
        elif result.reason == speechsdk.ResultReason.Canceled:
            cancellation_details = result.cancellation_details
            logger.error(f"TTS Canceled: {cancellation_details.reason}")
            if cancellation_details.reason == speechsdk.CancellationReason.Error:
                logger.error(f"TTS Error details: {cancellation_details.error_details}")

    def create_push_stream(self):
        """Create a push audio stream for incoming audio"""
        return speechsdk.audio.PushAudioInputStream()

    def create_recognizer(self, push_stream: speechsdk.audio.PushAudioInputStream):
        """Create a speech recognizer using the push stream"""
        if not self.is_configured:
            return None
            
        audio_config = speechsdk.audio.AudioConfig(stream=push_stream)
        recognizer = speechsdk.SpeechRecognizer(
            speech_config=self.speech_config, 
            audio_config=audio_config
        )
        return recognizer
