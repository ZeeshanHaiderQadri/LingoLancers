# MAF Travel Agents Installation Guide

## What Changed

We've implemented proper Microsoft Agent Framework (MAF) agents with:

1. **LLM Integration**: All agents now use OpenAI's GPT models for intelligent reasoning
2. **Tool Integration**: Agents have access to real tools (SERP API, LangChain tools)
3. **Agent Executor**: Using LangChain's agent executor for function calling
4. **Proper MAF Patterns**: Following Microsoft's official MAF documentation

## New Files

- `backend/src/maf_core/maf_travel_agents.py` - LLM-powered MAF agents
- `backend/src/maf_core/maf_workflow.py` - Workflow orchestrator with new agents

## Installation Steps

### 1. Install New Dependencies

```bash
cd backend
source venv/bin/activate
pip install langchain-openai
```

Or install all requirements:

```bash
pip install -r requirements.txt
```

### 2. Verify API Keys

Make sure your `.env` file has:

```bash
OPENAI_API_KEY=your_openai_api_key
SERP_API_KEY=your_serp_api_key
TAVILY_API_KEY=your_tavily_api_key
```

### 3. Start the Backend

```bash
python -m src.main
```

## How It Works

### Travel Planner Agent
- Uses OpenAI GPT-3.5-turbo for intelligent planning
- Has access to tools: analyze_destination, create_itinerary, calculate_budget
- Uses LangChain's agent executor for function calling
- Provides detailed, LLM-generated travel plans

### Research Agent
- Integrates with SERP API for real destination research
- Falls back to LLM if API fails
- Provides attraction information and local insights

### Search Agent
- Uses SERP API for real flight and hotel searches
- Handles airport code mapping
- Returns actual pricing and availability data

## Workflow Execution

1. **User Request** → Travel Planner Agent (LLM analyzes request)
2. **Travel Planner** → Research Agent (gathers destination info)
3. **Travel Planner** → Search Agent (finds flights/hotels)
4. **Compilation** → Final travel plan with all data

## Testing

Test the workflow:

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "team_domain": "travel_planning",
    "request": "Plan a 14-day tour in Madinah Saudi Arabia with family"
  }'
```

## Key Improvements

✅ **Real LLM Reasoning**: Agents use GPT models for intelligent responses
✅ **Tool Integration**: Agents can call functions and use external APIs
✅ **Agent Executor**: Proper LangChain agent executor with function calling
✅ **Error Handling**: Graceful fallbacks if APIs fail
✅ **MAF Compliance**: Follows Microsoft Agent Framework patterns

## Troubleshooting

### "No module named 'langchain_openai'"
```bash
pip install langchain-openai
```

### "OpenAI API key not found"
Check your `.env` file has `OPENAI_API_KEY` set

### Agents not responding
Check logs for errors:
```bash
tail -f backend/logs/app.log
```

## Next Steps

1. Start backend: `python -m src.main`
2. Start frontend: `cd frontend && npm run dev`
3. Test travel planning workflow
4. Monitor agent communication in logs
