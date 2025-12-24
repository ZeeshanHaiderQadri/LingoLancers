# Voice Agent Integration Fix - Implementation Plan

## Current Status
✅ **Already Working:**
- Microsoft Azure Speech Services configured (400+ voices, 140+ languages)
- Backend `/api/lingo/ws` WebSocket endpoint ready
- Master Lingo Agent with workflow triggering capability
- Azure TTS (Text-to-Speech) integration exists
- Voice selection modal UI exists

❌ **Not Working:**
- Voice button doesn't start listening
- Microphone permissions not requested
- No speech-to-text (STT) transcription happening
- Voice conversations not appearing in chat
- TTS responses not playing

## Root Cause Analysis

The system has **two separate voice implementations** that aren't connected:

1. **Azure Speech Implementation** (`azure_speech_handler.py`):
   - Full-featured Azure STT + TTS
   - Not connected to the chat interface
   - Used in `streamlined_lingo_agent.py` (not in use)

2. **Deepgram Implementation** (`lingo-voice-integration.tsx`):
   - Frontend component with UI
   - Calls non-existent `sendVoiceMessage` API
   - Not connected to Azure backend

## Solution Architecture

### Workflow:
```
User clicks "Talk"
  ↓
Request microphone permission
  ↓
Use browser Web Speech API for STT (no API key needed!)
  ↓
Transcribed text sent to `/api/lingo/ws` (existing WebSocket)
  ↓
Master Lingo Agent processes (triggers workflows if needed)
  ↓
Response comes back via WebSocket
  ↓
Azure TTS converts response to speech
  ↓
Audio plays in browser
```

## Implementation Steps

### Step 1: Add Web Speech API STT to Chat Interface
**File:** `frontend/src/components/unified-chat-interface.tsx`

Add microphone button with browser's native Speech Recognition API:
- No API keys required
- Supports 100+ languages
- Built into Chrome/Edge browsers
- Fallback to text input if not supported

### Step 2: Add Azure TTS API Endpoint
**File:** `backend/src/lingo_agent/voice_api.py` (NEW)

Create endpoint: `POST /api/voice/tts`
```python
@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    speech_handler = get_azure_speech()
    audio_data = await speech_handler.synthesize(
        text=request.text,
        voice=request.voice or "en-US-AriaNeural"
    )
    return {"audio": base64.b64encode(audio_data)}
```

### Step 3: Integrate Voice into Chat
**File:** `frontend/src/components/unified-chat-interface.tsx`

Add voice features:
1. Microphone button (floating or in input area)
2. Voice activity indicator
3. Auto-send transcribed text to WebSocket
4. Auto-play TTS responses from Azure
5. Display both user speech and agent responses in chat

### Step 4: Voice Settings Modal
Keep existing voice selection modal, add:
- Language selection
- Auto-speak toggle
- Voice preview

## Language Support

### Speech-to-Text (Browser Web Speech API):
- English (US, UK, AU, IN, etc.)
- Arabic (all dialects)
- Chinese (Mandarin, Cantonese)
- Spanish (all variants)
- French, German, Hindi, Urdu
- Japanese, Korean, Portuguese
- Russian, Italian, and 100+ more

### Text-to-Speech (Microsoft Azure):
- 400+ neural voices
- 140+ languages and locales
- See `azure_speech_handler.py` line 371-680 for complete listComplete list

##Files to Modify

###Backend:
1.`backend/src/lingo_agent/voice_api.py` (CREATE NEW)
   - TTS endpoint using Azure Speech
   - Voice list endpoint (already exists in `simple_lingo_api.py`)

2. `backend/src/main.py`
   - Add voice_api router

### Frontend:
1. `frontend/src/components/unified-chat-interface.tsx`
   - Add microphone button
   - Integrate Web Speech API
   - Add TTS playback

2. `frontend/src/lib/speech-recognition-service.ts` (CREATE NEW)
   - Web Speech API wrapper
   - TypeScript types
   - Error handling

3. `frontend/src/lib/azure-tts-service.ts` (CREATE NEW)
   - Call backend TTS endpoint
   - Audio playback
   - Queue management

## Environment Variables Required

Already configured:
```env
AZURE_SPEECH_KEY=*** (already set)
AZURE_SPEECH_REGION=swedencentral (already set)
```

No additional environment variables needed!

## Testing Plan

1. **Basic Voice Input:**
   - Click Talk button
   - Speak: "Hello Lingo"
   - Verify transcription appears in chat
   - Verify agent responds in chat
   - Verify TTS plays response

2. **Workflow Triggering:**
   - Speak: "Write a blog about AI"
   - Verify blog workflow starts
   - Verify split-screen shows progress

3. **Multi-language:**
   - Select Arabic voice
   - Speak in Arabic
   - Verify transcription
   - Verify Arabic TTS response

4. **Long Conversation:**
   - Have back-and-forth conversation
   - Verify all messages appear in chat
   - Verify conversation history persists

## Benefits of This Approach

✅ **No additional API costs** - Web Speech API is free
✅ **Already configured** - Azure TTS credentials exist
✅ **Reuses existing infrastructure** - Same WebSocket, same agent
✅ **Shows in chat** - Voice conversations visible as text
✅ **Triggers workflows** - Voice can start blog/travel workflows
✅ **Multi-language** - 100+ languages for STTfor STT, 400+ voices for TTS
✅ **Easy to implement** - ~200 lines of code total

## Implementation Priority

### Phase 1 (Essential - 2 hours):
1. Add Web Speech API to chat
2. Add Azure TTS endpoint
3. Connect voice to chat interface

### Phase 2 (Enhanced - 1 hour):
4. Add voice settings
5. Add language selection
6. Add visual feedback

### Phase 3 (Polish - 30 min):
7. Error handling
8. Browser compatibility fallbacks
9. Mobile optimization

## Next Action

Would you like me to:
1. **Implement this solution** (recommended - clean, simple, reuses existing code)
2. **Fix the existing separate voice components** (complex - two parallel systems)
3. **Create a hybrid approach** (use Deepgram for STT, Azure for TTS)

Recommendation: **Option 1** - Integrate voice into the existing chat interface using Web Speech API + Azure TTS. This is the cleanest solution that provides the best user experience.
