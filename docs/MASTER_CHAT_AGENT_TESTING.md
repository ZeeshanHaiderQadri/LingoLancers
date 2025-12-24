# Master Chat Agent - Testing Guide

## Issue Fixed
**Problem:** Master Chat Agent was stuck showing a loading spinner and not responding to messages  
**Root Cause:** The `_speak` method was sending UI updates in the wrong format - the frontend expected `type: "ui_update"` with a nested `data.message`, but was receiving a flat object  
**Fix:** Updated the UI update format in `master_lingo_agent.py:1338-1352`

## How to Test

### 1. Refresh the Frontend
- Go to `http://localhost:3000`
- Hard refresh (Cmd+Shift+R on Mac or Ctrl+Shift+R on Windows)
- Click "Dashboard" in the sidebar

### 2. Test Basic Greetings
Try these messages in the chat:
- `hi`
- `hello`
- `hey there`

**Expected Response:** Agent should greet you back immediately (e.g., "Hello! How can I help you today?")

### 3. Test General Questions
Try asking:
- `what can you do?`
- `help me`
- `what is artificial intelligence?`

**Expected Response:** Agent should answer helpfully or show capability cards

### 4. Test Team Selection - Blog Writing
Say:
- `I want to write a blog about cooking`
- `write an article about AI`
- `create a blog post`

**Expected Behavior:**
1. Agent acknowledges: "Perfect! I'll help you create an amazing blog article..."
2. Shows a "Blog Writing Team" suggestion card
3. OR automatically starts asking questions like:
   - "What topic would you like to write about?"
   - "What tone should the article have?"
   - "How long should it be?"

### 5. Test Team Selection - Travel Planning
Say:
- `plan a trip to Paris`
- `I want to travel to Japan`
- `help me plan a vacation`

**Expected Behavior:**
1. Agent acknowledges: "Great! I'll help you plan your perfect trip..."
2. Shows a "Travel Planning Team" suggestion card
3. OR starts asking questions about the trip

### 6. Test Split-Screen Workflow
After selecting a team:
1. Answer the agent's questions
2. Once all info is collected, the workflow should start
3. **Split-screen should appear** showing real-time progress:
   - Left side: Your chat continues
   - Right side: Workflow progress with agent statuses

### 7. Test Workflow Progress Display
When workflow runs, you should see:
- ✅ Agent cards showing status (Pending → Running → Completed)
- Progress percentages (0% → 100%)
- Real-time work updates
- Final article/result when complete

## Expected WebSocket Messages

### From Frontend to Backend:
```json
{
  "type": "text_input",
  "text": "hi"
}
```

### From Backend to Frontend (UI Update):
```json
{
  "type": "ui_update",
  "data": {
    "message": "Hello! How can I help you today?",
    "intent": null,
    "phase": "listening",
    "agent_type": "master_lingo"
  }
}
```

### Suggestion Cards:
```json
{
  "type": "show_suggestion_cards",
  "message": "I can help you with:",
  "cards": [
    {
      "id": "blog-card",
      "title": "Blog Writing",
      "description": "Create SEO-optimized blog articles",
      "icon": "pen",
      "action": "navigate",
      "destination": "blog-team"
    }
  ]
}
```

### Workflow Started:
```json
{
  "type": "workflow_started",
  "workflow_type": "blog",
  "workflow_id": "workflow_123...",
  "data": {
    "topic": "cooking tips",
    "tone": "friendly",
    "word_count": 1500
  }
}
```

## Debugging Tips

### Check Browser Console
Open DevTools (F12) and look for:
- ✅ `✅ Connected to Lingo Agent`
- ✅ `📨 Received: ...` messages
- ❌ Any WebSocket errors

### Check Backend Logs
```bash
docker logs lingo_backend --tail 50 | grep -i "lingo\|chat"
```

Look for:
- ✅ `✅ WebSocket connected`
- ✅ `🧠 Processing with Master Lingo Agent: ...`
- ✅ `✅ Message processed by Master Lingo Agent`
- ❌ Any errors with "websocket.send"

### Common Issues

**Issue:** Still seeing loading spinner  
**Solution:** 
1. Clear browser cache
2. Hard refresh (Cmd+Shift+R)
3. Check DevTools console for errors

**Issue:** No response to greetings  
**Solution:**
1. Check backend logs for errors
2. Verify WebSocket connection in Network tab
3. Try clicking "Clear Chat" button

**Issue:** Suggestion cards not appearing  
**Solution:**
1. Check that frontend is handling `type: "show_suggestion_cards"`
2. Verify cards array has proper structure
3. Check console for JavaScript errors

## Quick Test Commands (Backend)

### Test WebSocket Endpoint
```bash
# Check if Lingo Agent is ready
curl http://localhost:8000/api/lingo/status

# Expected response:
{
  "status": "active",
  "websocket_connected": false,  # true when connected
  "agent_ready": true
}
```

### Monitor WebSocket Communication
```bash
# Watch logs in real-time
docker logs -f lingo_backend | grep -i "lingo\|websocket"
```

## Success Criteria

✅ **Level 1: Basic Chat**
- Agent responds to greetings
- Agent answers general questions
- No loading spinner stuck

✅ **Level 2: Team Selection**
- Agent shows suggestion cards
- Agent asks relevant questions
- User can provide information via chat

✅ **Level 3: Workflow Execution**
- Workflow starts after collecting info
- Split-screen appears automatically
- Progress updates show in real-time

✅ **Level 4: Completion**
- Final result displays correctly
- User can review/approve/decline
- Drafts are saved to database

---

**After Fix Applied:** The Master Chat Agent should now respond immediately to all messages without getting stuck on the loading spinner. The conversation flow should work smoothly from greeting → question collection → workflow start → split-screen progress → final result.
