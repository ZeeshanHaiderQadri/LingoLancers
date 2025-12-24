# Blog Writing Team - Quick Start Guide 🚀

## Prerequisites

1. **Python 3.8+** installed
2. **PostgreSQL** database running
3. **API Keys** for:
   - OpenAI (GPT-4)
   - Tavily (Research)
   - Azure FLUX (Image generation)
   - Unsplash (Image search)

## Step 1: Environment Setup

### 1.1 Create `.env` file
```bash
cd backend
cp .env.example .env
```

### 1.2 Add your API keys to `.env`
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Tavily (Research)
TAVILY_API_KEY=tvly-...

# Azure FLUX (Feature Images)
AZURE_FLUX_API_KEY=...
AZURE_FLUX_ENDPOINT=https://...

# Unsplash (Supporting Images)
UNSPLASH_ACCESS_KEY=...

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lingo_master

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key-here
```

### 1.3 Generate Encryption Key
```bash
python generate_encryption_key.py
```

## Step 2: Database Setup

### 2.1 Run Migrations
```bash
python migrations/run_migrations.py
```

This creates 3 tables:
- `user_integrations` - API credentials
- `workflow_state` - Workflow tracking
- `draft_articles` - Article drafts

## Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

Required packages:
- fastapi
- uvicorn
- sqlalchemy
- psycopg2-binary
- openai
- httpx
- cryptography
- python-dotenv
- pydantic

## Step 4: Start the Backend

```bash
python src/main.py
```

The server will start on `http://localhost:8000`

You should see:
```
🚀 Starting Lingo Master Agent Backend
✓ Blog Team API registered
✓ WebSocket endpoint registered
INFO: Uvicorn running on http://0.0.0.0:8000
```

## Step 5: Test the API

### Option A: Use the Test UI (Easiest!)

1. Open `test_blog_workflow_ui.html` in your browser
2. Fill in the form:
   - Topic: "The Future of AI in Healthcare"
   - Word Count: 1500
   - Tone: Professional
3. Click "Create Blog Article"
4. Watch the real-time progress!

### Option B: Use curl

```bash
# Create a workflow
curl -X POST http://localhost:8000/api/blog/create \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "The Future of AI in Healthcare",
    "target_word_count": 1500,
    "tone": "professional"
  }'

# Response:
# {
#   "workflow_id": "abc-123-def-456",
#   "status": "starting",
#   "message": "Blog workflow started..."
# }

# Check status
curl http://localhost:8000/api/blog/abc-123-def-456/status

# Get drafts
curl http://localhost:8000/api/blog/drafts
```

### Option C: Use the Swagger UI

1. Open http://localhost:8000/docs
2. Try out the endpoints interactively
3. See request/response examples

## Step 6: Connect to WebSocket

### In Browser Console:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/blog/abc-123-def-456');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

### Events you'll receive:
- `connected` - Connection established
- `agent_started` - Agent begins
- `agent_progress` - Progress update
- `agent_completed` - Agent finishes
- `workflow_completed` - All done!

## What Happens During Workflow

### Phase 1: Research (0-20%)
```
Research Agent analyzes your topic
→ Searches multiple sources
→ Extracts key insights
→ Compiles research data
```

### Phase 2: SEO (20-35%)
```
SEO Agent optimizes for search
→ Identifies keywords
→ Suggests titles
→ Creates meta description
```

### Phase 3: Writing (35-55%)
```
Writer Agent creates article
→ Writes introduction
→ Creates sections
→ Writes conclusion
→ Incorporates SEO keywords
```

### Phase 4: Images (55-75%) - Parallel!
```
Feature Image Agent          Image Finder Agent
→ Generates AI image    ║    → Finds section images
→ Creates alt text      ║    → Adds attribution
```

### Phase 5: Compilation (75-100%)
```
Compiler Agent assembles everything
→ Inserts images
→ Generates HTML & Markdown
→ Calculates SEO score
→ Runs quality checks
→ Ready for review!
```

## Workflow Complete!

You'll get:
- ✅ Complete article (HTML & Markdown)
- ✅ SEO score (0-100)
- ✅ Readability score (0-100)
- ✅ Feature image
- ✅ Supporting images with attribution
- ✅ Quality check results

## Review the Article

```bash
# Approve
curl -X POST http://localhost:8000/api/blog/abc-123/review \
  -H "Content-Type: application/json" \
  -d '{"action": "approve"}'

# Request changes
curl -X POST http://localhost:8000/api/blog/abc-123/review \
  -H "Content-Type: application/json" \
  -d '{
    "action": "request_changes",
    "feedback": "Make it more casual and add examples"
  }'

# Decline
curl -X POST http://localhost:8000/api/blog/abc-123/review \
  -H "Content-Type: application/json" \
  -d '{"action": "decline"}'
```

## Troubleshooting

### Issue: "Connection refused"
**Solution:** Make sure PostgreSQL is running
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql
```

### Issue: "API key invalid"
**Solution:** Check your `.env` file has correct API keys

### Issue: "Module not found"
**Solution:** Install dependencies
```bash
pip install -r requirements.txt
```

### Issue: "WebSocket won't connect"
**Solution:** 
1. Make sure backend is running
2. Check the workflow_id is correct
3. Try refreshing the page

## API Endpoints Reference

```
POST   /api/blog/create              - Start workflow
GET    /api/blog/{id}/status         - Check status
POST   /api/blog/{id}/review         - Submit review
GET    /api/blog/drafts              - List drafts
DELETE /api/blog/drafts/{id}         - Delete draft
GET    /api/blog/health              - Health check

WS     /ws/blog/{workflow_id}        - Real-time updates
GET    /ws/blog/stats                - Connection stats
```

## Next Steps

1. **Test with different topics** - Try various subjects
2. **Experiment with tones** - Professional, casual, technical
3. **Try iterations** - Request changes and see agents re-run
4. **Check quality scores** - See SEO and readability metrics
5. **Review drafts** - Use the drafts endpoint

## Need Help?

- Check `BLOG_TEAM_BACKEND_COMPLETE.md` for full documentation
- See `TASK_*_IMPLEMENTATION_COMPLETE.md` for specific components
- Open the Swagger UI at http://localhost:8000/docs

## Success! 🎉

You now have a fully functional AI-powered blog writing system!

The agents will:
- Research your topic
- Optimize for SEO
- Write engaging content
- Generate beautiful images
- Compile everything perfectly

All with real-time progress updates! 🚀

---

*Happy Blog Writing!*
