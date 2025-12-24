# Blog Writing Team Module

This module implements the Blog Writing Team feature using Microsoft Agent Framework (MAF).

## Directory Structure

```
blog_team/
├── __init__.py              # Module initialization
├── agents/                  # Individual specialized agents
│   ├── __init__.py
│   ├── research_agent.py    # Tavily-based research agent
│   ├── seo_agent.py         # SEO optimization agent
│   ├── writer_agent.py      # Content writing agent (OpenAI)
│   ├── feature_image_agent.py  # Azure FLUX image generation
│   ├── image_finder_agent.py   # Unsplash image search
│   ├── compiler_agent.py    # Article assembly agent
│   └── publisher_agent.py   # Multi-platform publishing
├── orchestration/           # Workflow orchestration
│   ├── __init__.py
│   ├── orchestrator.py      # MAF orchestrator (Magentic pattern)
│   └── state_manager.py     # Workflow state management
├── integrations/            # Platform integration management
│   ├── __init__.py
│   ├── credential_manager.py  # Secure credential encryption
│   └── validators.py        # Platform connection validators
├── publishers/              # Platform-specific publishers
│   ├── __init__.py
│   ├── wordpress_publisher.py
│   ├── shopify_publisher.py
│   ├── facebook_publisher.py
│   └── twitter_publisher.py
├── models/                  # Data models
│   ├── __init__.py
│   ├── blog_models.py       # Pydantic models
│   └── db_models.py         # SQLAlchemy models
├── api/                     # API endpoints
│   ├── __init__.py
│   ├── blog_router.py       # REST endpoints
│   ├── integration_router.py  # Integration management
│   └── websocket.py         # WebSocket for progress updates
└── utils/                   # Utilities
    ├── __init__.py
    ├── quality_checks.py    # Content quality validation
    └── helpers.py           # Helper functions
```

## Dependencies

### Required Python Packages
- `fastapi` - Web framework
- `openai` - GPT-3.5-Turbo for content writing
- `httpx` - Async HTTP client
- `cryptography` - Credential encryption
- `pydantic` - Data validation
- `sqlalchemy` - Database ORM
- `psycopg2-binary` - PostgreSQL adapter
- `tavily-python` - Research API
- `websockets` - Real-time updates

### External APIs
- **OpenAI API** - Content generation
- **Tavily API** - Web research
- **Azure FLUX API** - Feature image generation
- **Unsplash API** - Supporting images
- **WordPress REST API** - WordPress publishing
- **Shopify Admin API** - Shopify publishing
- **Facebook Graph API** - Facebook publishing
- **Twitter API v2** - Twitter publishing

## Environment Variables

See `backend/.env.example` for required configuration:
- `OPENAI_API_KEY` - OpenAI API key
- `TAVILY_API_KEY` - Tavily API key
- `AZURE_FLUX_ENDPOINT` - Azure FLUX endpoint
- `AZURE_FLUX_API_KEY` - Azure FLUX API key
- `UNSPLASH_ACCESS_KEY` - Unsplash API key
- `ENCRYPTION_KEY` - Fernet encryption key
- `POSTGRES_*` - PostgreSQL connection details

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. Run database migrations:
   ```bash
   python -m alembic upgrade head
   ```

4. Start the server:
   ```bash
   uvicorn src.main:app --reload --port 8002
   ```

## Usage

See the design document at `.kiro/specs/blog-writing-team/design.md` for detailed architecture and usage information.
