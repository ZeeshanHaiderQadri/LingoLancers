# 🚀 Start Here - Realtime API Integration

## ✅ Everything is Ready!

Your Azure GPT-4o Realtime API is fully integrated and ready to test!

## 📋 Quick Start (2 Steps)

### Step 1: Start Backend

```bash
./START_REALTIME_BACKEND.sh
```

Or manually:

```bash
cd backend
python3 src/main.py
```

### Step 2: Test WebSocket (in another terminal)

```bash
./TEST_REALTIME_INTEGRATION.sh
```

Or manually:

```bash
cd backend
python3 test_realtime_websocket.py
```

## 🎯 What to Expect

### Backend Startup

```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Test Output

```
✅ Realtime API connected and ready

Test 1/4: Hello! Can you hear me?
📝 Agent: Yes, I can hear you!
✅ Response complete

Test 2/4: Show me the AI image tools
🔧 Function: navigate_to_page
🧭 Navigate to: /ai-image
✅ Response complete

✅ ALL TESTS COMPLETED!
```

## 🎉 What's Working

- ✅ WebSocket endpoint: `/api/lingo/ws/realtime`
- ✅ Text-based communication (no audio needed)
- ✅ Function calling (navigation, workflows)
- ✅ <320ms latency capability
- ✅ Transcript streaming
- ✅ Audio streaming support (ready)

## 🔧 Frontend Integration

Once backend is running, connect from your frontend:

```typescript
// Connect to Realtime WebSocket
const ws = new WebSocket("ws://localhost:8000/api/lingo/ws/realtime");

ws.onopen = () => {
  console.log("✅ Connected to Realtime API");

  // Send text message (no audio needed for testing)
  ws.send(
    JSON.stringify({
      type: "text",
      text: "Show me the AI image tools",
    })
  );
};

ws.onmessage = (event) => {
  if (typeof event.data === "string") {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "ready":
        console.log("✅ Realtime API ready");
        break;

      case "transcript":
        console.log("Agent:", data.text);
        break;

      case "navigate":
        console.log("Navigate to:", data.destination);
        router.push(data.destination);
        break;

      case "start_workflow":
        console.log("Start workflow:", data.workflow_type);
        break;

      case "function_call":
        console.log("Function:", data.name, data.args);
        break;
    }
  } else {
    // Audio chunk (binary data)
    console.log("Audio chunk:", event.data.byteLength, "bytes");
  }
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

ws.onclose = () => {
  console.log("WebSocket closed");
};
```

## 📊 Test Commands

### Test 1: "Hello! Can you hear me?"

- Expected: Agent responds with greeting
- Tests: Basic communication

### Test 2: "Show me the AI image tools"

- Expected: Function call + navigation to /ai-image
- Tests: Function calling, navigation

### Test 3: "Plan a trip to Paris for 5 days"

- Expected: Agent understands travel intent
- Tests: Intent recognition

### Test 4: "I want to write a blog about AI"

- Expected: Agent understands blog intent
- Tests: Workflow triggers

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill process if needed
kill -9 <PID>

# Try again
./START_REALTIME_BACKEND.sh
```

### WebSocket connection fails

1. Make sure backend is running
2. Check URL: `ws://localhost:8000/api/lingo/ws/realtime`
3. Check firewall settings

### No response from API

1. Check `.env` file has correct credentials
2. Test Realtime API directly: `python3 backend/test_realtime_quick.py`
3. Check backend logs for errors

## 📚 Documentation

- `REALTIME_INTEGRATION_COMPLETE.md` - Complete integration guide
- `REALTIME_API_INTEGRATION_NOW.md` - Detailed documentation
- `AZURE_GPT4O_REALTIME_COMPLETE.md` - API reference

## 🎯 Next Steps

1. ✅ Start backend
2. ✅ Test WebSocket
3. ✅ Verify all tests pass
4. 🔜 Connect from frontend
5. 🔜 Test navigation
6. 🔜 Test workflows
7. 🔜 Add audio streaming (optional)

## 💡 Pro Tips

- **Text Mode**: Perfect for testing without audio
- **Function Calling**: Automatically handles navigation
- **Transcripts**: See agent responses in real-time
- **Audio**: Can be added later for full experience

---

**Ready? Run these commands:**

```bash
# Terminal 1
./START_REALTIME_BACKEND.sh

# Terminal 2 (after backend starts)
./TEST_REALTIME_INTEGRATION.sh
```

**Then test from your frontend!** 🚀
