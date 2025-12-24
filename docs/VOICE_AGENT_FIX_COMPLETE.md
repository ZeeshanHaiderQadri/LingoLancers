# Voice Agent & Workflow Fixes

## Issues Addressed
1. **Voice Issue:** The agent was only talking with one voice despite selection.
   - **Root Cause:** Race condition in `AzureSpeechHandler` singleton where `set_voice` on the shared config could be overwritten or ignored if concurrent requests occurred, or if `synthesize_to_buffer` didn't use the updated config correctly in time.
   - **Fix:** Updated `synthesize_to_buffer` to accept `voice` and `language` arguments and create a request-specific `SpeechConfig`. Updated `voice_api.py` to pass these parameters.

2. **Workflow Issue:** Workflow started by voice didn't trigger the UI transition.
   - **Root Cause:** `FloatingLingoAgent` was emitting `onStartWorkflow` but `MainLayout` was not passing a handler for it.
   - **Fix:** Added `onStartWorkflow` handler in `MainLayout.tsx` to map workflow types to team names and call `handleLaunchWorkflow`.

3. **Chat Display Issue:** Voice interactions were not showing in the main chat box.
   - **Root Cause:** `FloatingLingoAgent` and `UnifiedChatInterface` are separate components with separate WebSocket connections (or at least separate state).
   - **Fix:** Implemented an event-based synchronization. `FloatingLingoAgent` dispatches `lingo-user-message` and `lingo-agent-message` events. `UnifiedChatInterface` listens for these events and updates its message list.

## Files Modified
- `backend/src/lingo_agent/azure_speech_handler.py`
- `backend/src/lingo_agent/voice_api.py`
- `frontend/src/components/main-layout.tsx`
- `frontend/src/components/floating-lingo-agent.tsx`
- `frontend/src/components/unified-chat-interface.tsx`

## Verification
- **Voice:** Select a voice in the agent settings and speak. The response should use the selected voice.
- **Workflow:** Say "Plan a trip to Paris". The Travel Planning workflow should start and the UI should switch to the workflow view.
- **Chat:** Speak to the agent. Your words and the agent's response should appear in the main chat window in real-time.
