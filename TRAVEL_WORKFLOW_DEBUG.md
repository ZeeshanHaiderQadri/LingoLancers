# Travel Workflow Debugging Guide

## Current Status

The backend has been updated with:
1. **Fixed import paths** - Removed `src.` prefix to ensure singleton behavior of the tasks dictionary
2. **Added debug logging** - Both in the API and WebSocket to track what's happening
3. **Enhanced WebSocket response** - Added `workflow_id` and `websocket_url` to help frontend connect correctly

## How to Test

### Via Chat Interface:
1. Open the chat at `http://localhost:3000`
2. Type: **"plan me a travel trip from sweden to Nathya Gail Pakistan let me know the best places to visit and hotels to stay"**
3. Watch the "Workflow in Progress" panel on the right

### Via API (Direct Test):
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "request": "[TEAM: travel_planning] Plan a trip to London for 7 days with a budget of $2000",
    "user_id": "test_user",
    "priority": "normal",
    "voice_input": null
  }'
```

## What to Check in Logs

```bash
# Watch the backend logs in real-time
docker logs -f lingo_backend

# Look for these key messages:
# ✅ Task created with ID
# 🔍 DEBUG: tasks dict ID - should be SAME across all modules
# 🔍 Poll #N: Task found - WebSocket is finding the task
# 📤 Sent WebSocket update - Progress is being sent
```

## Expected Behavior

1. **Initial Status (0%)**: "Initial Planning" should show as "pending"
2. **After ~10s**: "Initial Planning" completes (25% progress)
3. **After ~20s**: "Destination Research" completes (50% progress)
4. **After ~30s**: "Real-time Search" completes (75% progress)
5. **After ~40s**: "Final Compilation" completes (100% progress)

##Known Issues

### If Workflow Stays at 0%:
- **Cause**: WebSocket not connecting or tasks dictionary mismatch
- **Check**: Look for `Task {workflow_id} not found in tasks dict` in logs
- **Fix**: Verify the `workflow_id` from the API response matches what WebSocket is looking for

### If Workflow Completes But No Updates:
- **Cause**: WebSocket polling not finding the task updates
- **Check**: Look for `Poll #N: Task found` but no "Results keys" messages
- **Fix**: The `_update_task_progress` method in maf_workflow.py might not be firing

## Debugging Commands

```bash
# Check if Docker is using latest code
docker-compose ps
docker images | grep newlingofrontend

# Rebuild if needed
docker-compose build backend
docker-compose up -d backend

# Check task creation
docker logs lingo_backend 2>&1 | grep "Added task"

# Check WebSocket connection
docker logs lingo_backend 2>&1 | grep "WebSocket connected"

# Check task polling
docker logs lingo_backend 2>&1 | grep "Poll #"
```

## Architecture

```
User Chat Request
    ↓
workflow_trigger.py (lingo_agent)
    ↓
POST /api/tasks (tasks_api.py)
    ↓
Creates TaskStatus in tasks{} dictionary
    ↓
Calls process_task_async() with team="travel_planning"
    ↓
travel_planning_team.process_request()
    ↓
MAFTravelWorkflow.execute()
    ↓
_update_task_progress() updates tasks{} dictionary
    ↓
WebSocket at /ws/travel/{task_id} polls tasks{} dictionary
    ↓
Frontend receives real-time updates
```

## Next Steps

1. **Test via chat** - Try requesting a travel plan
2. **Watch logs** - Use `docker logs -f lingo_backend` to see real-time output
3. **Check WebSocket** - Open browser DevTools → Network → WS to see WebSocket messages
4. **Report back** - Let me know what messages you see in the workflow panel
