"""
Azure Speech Voice API
Provides TTS endpoint using Microsoft Azure Speech Services
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64
import io
import logging
from .azure_speech_handler import get_azure_speech

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/voice", tags=["voice"])

class TTSRequest(BaseModel):
    text: str
    voice: str = "en-US-AriaNeural"
    language: str = "en-US"

class TTSResponse(BaseModel):
    audio: str  # base64 encoded audio
    voice: str
    language: str

@router.post("/tts", response_model=TTSResponse)
async def text_to_speech(request: TTSRequest):
    """
    Convert text to speech using Microsoft Azure Speech
    Returns base64-encoded WAV audio
    """
    try:
        logger.info(f"🔊 TTS Request: voice={request.voice}, text_length={len(request.text)}")
        
        speech_handler = get_azure_speech()
        
        if not speech_handler.available:
            raise HTTPException(
                status_code=503,
                detail="Azure Speech service not available. Please check AZURE_SPEECH_KEY environment variable."
            )
        
        # Synthesize to in‑memory buffer
        audio_bytes = await speech_handler.synthesize_to_buffer(
            request.text,
            voice=request.voice,
            language=request.language
        )
        
        # Encode to base64 for transport
        audio_b64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        logger.info(f"✅ TTS completed for voice: {request.voice}")
        
        return TTSResponse(
            audio=audio_b64,
            voice=request.voice,
            language=request.language
        )
        
    except Exception as e:
        logger.error(f"❌ TTS Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices")
async def get_available_voices():
    """
    Get all available Azure Neural voices (400+ voices, 140+ languages)
    
    Returns a dictionary organized by language/region with voice details
    """
    try:
        speech_handler = get_azure_speech()
        voices = speech_handler.get_available_voices()
        
        return {
            "success": True,
            "voice_count": sum(len(v) if isinstance(v, list) else sum(len(vv) for vv in v.values()) for v in voices.values()),
            "voices": voices
        }
    except Exception as e:
        logger.error(f"Error getting voices: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_voice_status():
    """Check Azure Speech service status"""
    try:
        speech_handler = get_azure_speech()
        return {
            "available": speech_handler.available,
            "region": speech_handler.speech_region if speech_handler.available else None,
            "service": "Microsoft Azure Speech Services"
        }
    except Exception as e:
        return {
            "available": False,
            "error": str(e)
        }
