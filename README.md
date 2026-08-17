# LingoLancers - AI Agent Platform

> **Project direction:** See [UPGRADE_ROADMAP.md](UPGRADE_ROADMAP.md) for the authoritative plan to evolve Lingo into a voice-first Agentic Business Desk. Historical prototype documentation is in [docs/archive/2025-prototype](docs/archive/2025-prototype/).

A professional AI agent platform with conversational workflows, voice interaction, and multi-modal capabilities.

## 🚀 Quick Start

### Docker Deployment (Recommended)
```bash
# Start all services
docker-compose up -d

# Access the application
open http://localhost:3000
```

### Manual Setup
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000

# Frontend  
cd frontend
npm install
npm run build
npm start
```

## 🏗️ Architecture

- **Frontend**: Next.js with TypeScript
- **Backend**: FastAPI with Python
- **Database**: PostgreSQL
- **AI Services**: Azure OpenAI, Azure Speech
- **Deployment**: Docker + Azure

## 🔧 Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Backend
AZURE_OPENAI_API_KEY=your_key_here
AZURE_SPEECH_KEY=your_key_here

# Frontend
NEXT_PUBLIC_LINGO_API_URL=http://localhost:8000
```

## 📚 Features

- 🎙️ Voice-enabled AI conversations
- 🤖 Multi-agent workflows (Travel, Blog, AI Image)
- 💬 Real-time chat interface
- 🎨 AI image generation and editing
- ✈️ Travel planning automation
- 📝 Blog writing assistance

## 🛠️ Tech Stack

- **AI/ML**: Azure OpenAI GPT-4, Azure Speech Services
- **Backend**: FastAPI, SQLAlchemy, WebSockets
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Infrastructure**: Docker, Azure App Service

## 📄 License

Proprietary - All rights reserved

---
*Professional AI Agent Platform by LingoLancers*
