# IMMEDIATE VOICE FIX - Action Plan

## Problem
The beautiful Lingo Voice Bot widget exists but doesn't work because:
- Uses Deepgram service (requires API key)
- Not connected to Master Lingo Agent WebSocket
- Not using Microsoft Azure Speech (which is already configured)

## Solution: 3-Step Quick Fix

### Step 1: Use Web Speech API instead of Deepgram
**File:** `frontend/src/components/lingo-agent-widget.tsx`
**Line 690-720:** Replace Deepgram initialization with browser Web Speech API

```typescript
// Replace this:
const stream = await deepgramServiceRef.current.startListening(...)

// With this:
const recognition = new ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US'; // Will make this dynamic based on voice selection

recognition.onresult = (event: any) => {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript;
    const isFinal = event.results[last].isFinal;
    
    setCurrentTranscript(transcript);
    
    if (isFinal) {
        // Send to Master Lingo Agent
        sendToLingoAgent(transcript);
    }
};

recognition.start();
```

### Step 2: Connect to Master Lingo Agent WebSocket
**File:** `frontend/src/components/lingo-agent-widget.tsx`  
**Add new function around line 490:**

```typescript
const sendToLingoAgent = useCallback(async (transcript: string) => {
    setIsProcessing(true);
    
    try {
        // Connect to existing Master Lingo WebSocket
        const apiUrl = process.env.NEXT_PUBLIC_LINGO_API_URL || 'http://localhost:8001';
        const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
        const ws = new WebSocket(`${wsUrl}/api/lingo/ws`);
        
        ws.onopen = () => {
            // Send message to Master Lingo Agent
            ws.send(JSON.stringify({
                type: 'text_input',
                text: transcript
            }));
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'ui_update') {
                const response = data.data.message || data.data;
                setLingoResponse(response);
                
                // Use Azure TTS to speak the response
                speakWithAzure(response);
            }
            
            if (data.type === 'workflow_started') {
                // Workflow was triggered!
                toast({
                    title: `🚀 ${data.workflow_type} Workflow Started`,
                    description: `Workflow ID: ${data.workflow_id}`
                });
            }
        };
        
    } catch (error) {
        console.error('Error sending to Lingo Agent:', error);
        toast({
            title: "Error",
            description: "Failed to process voice input",
            variant: "destructive"
        });
    } finally {
        setIsProcessing(false);
    }
}, [toast]);
```

### Step 3: Use Azure TTS for Responses
**File:** `frontend/src/components/lingo-agent-widget.tsx`
**Add new function:**

```typescript
const speakWithAzure = useCallback(async (text: string) => {
    setIsSpeaking(true);
    
    try {
        // Call backend Azure TTS endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_LINGO_API_URL}/api/voice/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                voice: selectedVoice.azureVoice || 'en-US-AriaNeural',
                language: selectedLanguage || 'en-US'
            })
        });
        
        const data = await response.json();
        
        // Play the audio
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        audio.play();
        
        audio.onended = () => {
            setIsSpeaking(false);
        };
        
    } catch (error) {
        console.error('TTS error:', error);
        setIsSpeaking(false);
    }
}, [selectedVoice]);
```

### Step 4: Create Azure TTS Backend Endpoint
**File:** `backend/src/lingo_agent/voice_api.py` (NEW FILE)

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import base64
from .azure_speech_handler import get_azure_speech

router = APIRouter(prefix="/api/voice", tags=["voice"])

class TTSRequest(BaseModel):
    text: str
    voice: str = "en-US-AriaNeural"
    language: str = "en-US"

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """
    Convert text to speech using Microsoft Azure Speech
    Returns base64-encoded audio
    """
    try:
        speech_handler = get_azure_speech()
        
        if not speech_handler.available:
            raise HTTPException(
                status_code=503,
                detail="Azure Speech service not available"
            )
        
        # Set voice and language
        speech_handler.set_voice(request.voice, request.language)
        
        # Generate speech (this returns audio buffer)
        # We need to modify azure_speech_handler to return audio data instead of playing
        audio_data = await speech_handler.synthesize_to_buffer(request.text)
        
        return {
            "audio": base64.b64encode(audio_data).decode('utf-8'),
            "voice": request.voice,
            "language": request.language
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices")
async def get_voices():
    """Get all available Azure voices"""
    speech_handler = get_azure_speech()
    return speech_handler.get_available_voices()
```

**File:** `backend/src/main.py`
**Add to main.py around line 200:**

```python
from lingo_agent.voice_api import router as voice_router
app.include_router(voice_router)
```

### Step 5: Map Voice UI to Azure Voices
**File:** `frontend/src/components/lingo-agent-widget.tsx`  
**Update deepgramVoices array (line 37-168):**

```typescript
const azureVoices = [
    {
        name: 'Aria',
        azureVoice: 'en-US-AriaNeural',
        gender: 'Female',
        ethnicity: 'American',
        type: 'Professional',
        languages: ['English'],
        characteristics: 'Clear, Confident, Professional',
        useCases: 'Business, Professional'
    },
   {
        name: 'Jenny',
        azureVoice: 'en-US-JennyNeural',
        gender: 'Female',
        ethnicity: 'American',
        type: 'Friendly',
        languages: ['English'],
        characteristics: 'Warm, Friendly, Conversational',
        useCases: 'Casual chat, Customer service'
    },
    {
        name: 'Guy',
        azureVoice: 'en-US-GuyNeural',
        gender: 'Male',
        ethnicity: 'American',
        type: 'Professional',
        languages: ['English'],
        characteristics: 'Professional, Clear, Trustworthy',
        useCases: 'Business, Informative'
    },
    {
        name: 'Sonia',
        azureVoice: 'en-GB-SoniaNeural',
        gender: 'Female',
        ethnicity: 'British',
        type: 'Elegant',
        languages: ['English'],
        characteristics: 'Elegant, British, Sophisticated',
        useCases: 'Professional, Refined'
    },
    {
        name: 'Zariyah',
        azureVoice: 'ar-SA-ZariyahNeural',
        gender: 'Female',
        ethnicity: 'Arabic',
        type: 'Clear',
        languages: ['Arabic', 'English'],
        characteristics: 'Clear Arabic voice',
        useCases: 'Arabic conversations'
    },
    {
        name: 'Xiaoxiao',
        azureVoice: 'zh-CN-XiaoxiaoNeural',
        gender: 'Female',
        ethnicity: 'Chinese',
        type: 'Friendly',
        languages: ['Chinese'],
        characteristics: 'Warm Chinese voice',
        useCases: 'Chinese conversations'
    },
    {
        name: 'Uzma',
        azureVoice: 'ur-PK-UzmaNeural',
        gender: 'Female',
        ethnicity: 'Pakistani',
        type: 'Clear',
        languages: ['Urdu'],
        characteristics: 'Clear Urdu voice',
        useCases: 'Urdu conversations'
    },
    {
        name: 'Swara',
        azureVoice: 'hi-IN-SwaraNeural',
        gender: 'Female',
        ethnicity: 'Indian',
        type: 'Friendly',
        languages: ['Hindi'],
        characteristics: 'Friendly Hindi voice',
        useCases: 'Hindi conversations'
    }
    // Add more as needed from azure_speech_handler.py line 371-680
];
```

## Testing Checklist

1. **Click Talk button:**
   - ✅ Browser asks for microphone permission
   - ✅ Status shows "Listening"
   - ✅ Speak: "Hello Lingo"
   - ✅ Transcript appears
   - ✅ Lingo responds via Azure TTS

2. **Workflow triggering:**
   - ✅ Say: "Write a blog about AI"
   - ✅ Blog workflow starts
   - ✅ Split-screen shows progress

3. **Multi-language:**
   - ✅ Select Arabic voice
   - ✅ Say something in Arabic
   - ✅ Azure TTS responds in Arabic

4. **Conversation flow:**
   - ✅ Back-and-forth works
   - ✅ Can interrupt Lingo while speaking
   - ✅ Continuous conversation

## Implementation Time
- Step 1-3 (Frontend): 30 minutes
- Step 4 (Backend): 15 minutes
- Step 5 (Voice mapping): 15 minutes
- Testing: 15 minutes
**Total: ~75 minutes**

## Benefits
✅ Beautiful UI kept intact
✅ Works with 400+ Azure voices
✅ No Deepgram API key needed for STT
✅ Connects to existing Master Lingo Agent
✅ Triggers workflows (blog, travel)
✅ Multi-language support
✅ Already configured Azure credentials

## Next Action
Shall I implement this fix now? It will make the voice bot fully functional with all languages and workflow triggering capabilities!
