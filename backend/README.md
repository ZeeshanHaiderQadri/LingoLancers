# Microsoft Agent Framework Backend

Clean, production-ready backend implementing Microsoft Agent Framework for intelligent travel planning.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── api/           # FastAPI endpoints
│   ├── maf_core/      # Microsoft Agent Framework implementation
│   ├── tools/         # External API integrations (SERP, Tavily)
│   ├── utils/         # Utilities and helpers
│   ├── models/        # Data models
│   ├── mcp/           # Model Context Protocol
│   └── agent_framework/ # Legacy team implementations
├── .env               # Environment variables
└── requirements.txt   # Dependencies
```

## 🚀 Quick Start

### ⚡ Automated Startup (Recommended)

```bash
cd backend
./start_backend.sh
```

This script automatically:
- Finds an available port
- Syncs backend and frontend configurations
- Starts the server

### 🔧 Manual Setup

1. **Setup Environment**:
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Configure API Keys**:
```bash
cp .env.example .env
# Add your API keys to .env
```

3. **Configure Ports** (Important!):
```bash
python3 port_config.py
```
This finds an available port and syncs both backend `.env` and frontend `.env.local`

4. **Start Server**:
```bash
python -m src.main
```

Server runs on the configured port (check `.env` for `PORT` value)

## 🤖 Microsoft Agent Framework

The core MAF implementation is in `src/maf_core/`:
- `proper_maf.py` - Main MAF travel team implementation
- `agents.py` - Base agent classes
- `workflows.py` - Workflow orchestration
- `orchestrator.py` - Team orchestration

## 🔧 API Endpoints

- `POST /api/tasks` - Create travel planning task
- `GET /api/tasks/{task_id}` - Get task status and results
- `POST /api/tasks/{task_id}/instruction` - Send additional instructions
- `GET /api/teams` - List available teams
- `GET /health` - Health check

## 🛠️ Tools & Integrations

- **SERP API** - Real-time flight and hotel search
- **Tavily API** - Web search and research
- **LangChain** - Tool orchestration
- **FastAPI** - Async web framework

## 📊 Features

✅ Real Microsoft Agent Framework workflow execution  
✅ Agent-to-agent communication  
✅ Step-by-step workflow progress  
✅ Real-time API integrations  
✅ Human-in-the-loop interactions  
✅ Booking widget generation  
✅ Intelligent travel planning