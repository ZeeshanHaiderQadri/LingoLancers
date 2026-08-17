"""
Main application entry point for the Lingo Master Agent Backend
Built with Microsoft Agent Framework
"""

import os
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Optional
import logging

# Add src directory to Python path to make blog_team importable
src_dir = os.path.dirname(os.path.abspath(__file__))
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Import API modules
import api.tools_api as tools_api
import api.mcp_api as mcp_api
import api.tasks_api as tasks_api
import api.teams_api as teams_api
import api.teams_launch_api as teams_launch_api
import api.tasks_websocket_router as tasks_websocket_router
from missions.api import router as missions_router

# Import Microsoft Agent Framework components
from maf_core.orchestrator import initialize_master_orchestrator, get_master_orchestrator
from maf_core.maf_workflow import ProperMAFTravelTeam

# Legacy team implementations have been removed.
# Use Microsoft Agent Framework (MAF) for all new teams.

# Import LangChain tools
try:
    from tools.langchain_tools import langchain_tools_manager
except Exception as e:
    logger.warning(f"Could not import langchain_tools: {e}")
    langchain_tools_manager = None

app = FastAPI(
    title="Lingo Master Agent Backend",
    description="Backend API for Lingo Master Agent with Microsoft Agent Framework integration",
    version="1.0.0"
)

# Add CORS middleware. Wildcard origins cannot safely be combined with credentials.
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Microsoft Agent Framework team instances
maf_travel_team: Optional['ProperMAFTravelTeam'] = None

# Import team instances module
from team_instances import set_team_instances

# Import Blog Team API
try:
    from blog_team.api import blog_router, websocket_router
    BLOG_TEAM_AVAILABLE = True
    logger.info("✓ Blog Team module loaded successfully")
except ImportError as e:
    logger.warning(f"Blog Team module not available - skipping blog team routes: {e}")
    BLOG_TEAM_AVAILABLE = False
    blog_router = None
    websocket_router = None
except Exception as e:
    logger.error(f"Blog Team initialization failed - skipping blog team routes: {e}")
    BLOG_TEAM_AVAILABLE = False
    blog_router = None
    websocket_router = None

# Import Travel Team API
try:
    from travel_team.api import router as travel_router
    from travel_team.websocket_router import router as travel_websocket_router
    TRAVEL_TEAM_AVAILABLE = True
    logger.info("✓ Travel Team module loaded successfully")
except ImportError as e:
    logger.warning(f"Travel Team module not available: {e}")
    TRAVEL_TEAM_AVAILABLE = False
    travel_router = None
    travel_websocket_router = None
except Exception as e:
    logger.error(f"Travel Team initialization failed: {e}")
    TRAVEL_TEAM_AVAILABLE = False
    travel_router = None
    travel_websocket_router = None

# Import Master Lingo Agent API
try:
    from lingo_agent.simple_lingo_api import router as lingo_router
    LINGO_AGENT_AVAILABLE = True
    logger.info("✓ Master Lingo Agent module loaded successfully")
except ImportError as e:
    logger.warning(f"Master Lingo Agent module not available: {e}")
    LINGO_AGENT_AVAILABLE = False
    lingo_router = None
except Exception as e:
    logger.error(f"Master Lingo Agent initialization failed: {e}")
    LINGO_AGENT_AVAILABLE = False
    lingo_router = None

# Import Intelligent Chat API
try:
    from lingo_agent.intelligent_chat_api import router as intelligent_chat_router
    INTELLIGENT_CHAT_AVAILABLE = True
    logger.info("✓ Intelligent Chat API module loaded successfully")
except ImportError as e:
    logger.warning(f"Intelligent Chat API module not available: {e}")
    INTELLIGENT_CHAT_AVAILABLE = False
    intelligent_chat_router = None
except Exception as e:
    logger.error(f"Intelligent Chat API initialization failed: {e}")
    INTELLIGENT_CHAT_AVAILABLE = False
    intelligent_chat_router = None

# Import Nano Banana Image Generation API (Complete Implementation)
try:
    from nano_banana.complete_api import router as nano_banana_router
    NANO_BANANA_AVAILABLE = True
    logger.info("✓ Complete Nano Banana Image Generation API loaded (ALL capabilities)")
except ImportError as e:
    logger.warning(f"Nano Banana API module not available: {e}")
    NANO_BANANA_AVAILABLE = False
    nano_banana_router = None
except Exception as e:
    logger.error(f"Nano Banana API initialization failed: {e}")
    NANO_BANANA_AVAILABLE = False
    nano_banana_router = None

# Import Virtual Try-On API
try:
    from virtual_tryon.api import router as virtual_tryon_router
    VIRTUAL_TRYON_AVAILABLE = True
    logger.info("✓ Virtual Try-On API loaded")
except ImportError as e:
    logger.warning(f"Virtual Try-On API module not available: {e}")
    VIRTUAL_TRYON_AVAILABLE = False
    virtual_tryon_router = None
except Exception as e:
    logger.error(f"Virtual Try-On API initialization failed: {e}")
    VIRTUAL_TRYON_AVAILABLE = False
    virtual_tryon_router = None

# Import AI Image Suite API
try:
    from ai_image.api import router as ai_image_router
    AI_IMAGE_AVAILABLE = True
    logger.info("✓ AI Image Suite API loaded (Remove Background, Vision, Combine, Product Shot)")
except ImportError as e:
    logger.warning(f"AI Image Suite API module not available: {e}")
    AI_IMAGE_AVAILABLE = False
    ai_image_router = None
except Exception as e:
    logger.error(f"AI Image Suite API initialization failed: {e}")
    AI_IMAGE_AVAILABLE = False
    ai_image_router = None

# Include API routers
app.include_router(tools_api.router, prefix="/api", tags=["tools"])
app.include_router(mcp_api.router, prefix="/api", tags=["mcp"])
app.include_router(tasks_api.router, prefix="/api", tags=["tasks"])
app.include_router(teams_api.router, prefix="/api", tags=["teams"])
app.include_router(teams_launch_api.router, prefix="/api", tags=["teams"])
app.include_router(tasks_websocket_router.router, tags=["websocket"])
app.include_router(missions_router)
if BLOG_TEAM_AVAILABLE and blog_router and websocket_router:
    app.include_router(blog_router)  # blog_router already has /api/blog prefix
    app.include_router(websocket_router, tags=["websocket"])
    logger.info("✓ Blog Team API registered")
else:
    logger.warning("⚠ Blog Team API not registered")

# Include Travel Team API
if TRAVEL_TEAM_AVAILABLE and travel_router:
    app.include_router(travel_router)  # travel_router already has /api/travel prefix
    if travel_websocket_router:
        app.include_router(travel_websocket_router, tags=["websocket"])
    logger.info("✓ Travel Team API registered")
else:
    logger.warning("⚠ Travel Team API not registered")

# Include Master Lingo Agent API
if LINGO_AGENT_AVAILABLE and lingo_router:
    app.include_router(lingo_router)  # lingo_router already has /api/lingo prefix
    logger.info("✓ Master Lingo Agent API registered")
else:
    logger.warning("⚠ Master Lingo Agent API not registered")

# Include Voice API (Azure Speech TTS)
try:
    from lingo_agent.voice_api import router as voice_router
    app.include_router(voice_router)
    logger.info("✓ Azure Voice API registered")
except Exception as e:
    logger.warning(f"⚠ Voice API not registered: {e}")

# Include Intelligent Chat API
if INTELLIGENT_CHAT_AVAILABLE and intelligent_chat_router:
    app.include_router(intelligent_chat_router, prefix="/api/lingo", tags=["intelligent-chat"])
    logger.info("✓ Intelligent Chat API registered")
else:
    logger.warning("⚠ Intelligent Chat API not registered")

# Include Nano Banana Image Generation API
if NANO_BANANA_AVAILABLE and nano_banana_router:
    app.include_router(nano_banana_router, tags=["nano-banana"])
    logger.info("✓ Nano Banana Image Generation API registered")
else:
    logger.warning("⚠ Nano Banana API not registered")

# Include Virtual Try-On API
if VIRTUAL_TRYON_AVAILABLE and virtual_tryon_router:
    app.include_router(virtual_tryon_router, tags=["virtual-tryon"])
    logger.info("✓ Virtual Try-On API registered")
else:
    logger.warning("⚠ Virtual Try-On API not registered")

# Include AI Image Suite API
if AI_IMAGE_AVAILABLE and ai_image_router:
    app.include_router(ai_image_router, tags=["ai-image"])
    logger.info("✓ AI Image Suite API registered")
else:
    logger.warning("⚠ AI Image Suite API not registered")


@app.on_event("startup")
async def startup_event():
    """Initialize teams and MCP servers on startup"""
    global maf_travel_team
    
    try:
        logger.info("=" * 60)
        logger.info("🚀 Starting Lingo Master Agent Backend")
        logger.info("=" * 60)
        
        logger.info("Initializing Microsoft Agent Framework system...")
        
        # Initialize Microsoft Agent Framework Master Orchestrator
        try:
            maf_success = await initialize_master_orchestrator()
            if not maf_success:
                logger.warning("⚠️ Master Orchestrator initialization failed, continuing...")
        except Exception as e:
            logger.warning(f"⚠️ Master Orchestrator error: {e}, continuing...")
        
        logger.info("Microsoft Agent Framework initialized successfully")
        
        # Initialize Microsoft Agent Framework Travel Team
        logger.info("🧳 Initializing MAF Travel Planning Team...")
        try:
            maf_travel_team = ProperMAFTravelTeam()
            success = await maf_travel_team.initialize()
            if success:
                logger.info("✅ MAF Travel Planning Team initialized successfully")
            else:
                logger.error("❌ MAF Travel Planning Team initialization failed")
        except Exception as e:
            logger.error(f"❌ Error initializing MAF Travel Team: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
    
        # Set team instances in the global module
        logger.info("📝 Setting team instances...")
        set_team_instances(
            travel_planning_team=maf_travel_team  # Use MAF implementation
        )
        logger.info("✅ Team instances set")
        
        # Initialize LangChain tools
        logger.info("🔧 Initializing LangChain tools...")
        try:
            langchain_tools_manager.initialize()
            logger.info("✅ LangChain tools initialized")
        except Exception as e:
            logger.warning(f"⚠️ LangChain tools error: {e}")
        
        logger.info("=" * 60)
        logger.info("✅ All systems initialized successfully")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"❌ Fatal error during startup: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown teams and MCP servers on shutdown"""
    global maf_travel_team
    
    logger.info("Shutting down all systems...")
    
    # Shutdown Microsoft Agent Framework teams
    if maf_travel_team:
        await maf_travel_team.shutdown()
    
    # Shutdown Microsoft Agent Framework Master Orchestrator
    orchestrator = await get_master_orchestrator()
    if orchestrator:
        await orchestrator.shutdown()
    

    
    logger.info("All systems shutdown completed")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "service": "Lingo Master Agent Backend"
    }

@app.get("/status")
async def system_status():
    """System status endpoint"""
    return {
        "system": "Lingo Master Agent",
        "status": "operational",
        "timestamp": "2024-01-01T00:00:00Z",
        "master_agent": "Lingo Master",
        "specialist_teams": 9,
        "available_domains": [
            "web_design",
            "web_development",
            "ecommerce",
            "social_media",
            "blog_writing",
            "research",
            "finance_advisor",
            "marketing_agency",
            "travel_planning"
        ],
        "tasks": {
            "total": 0,
            "completed": 0,
            "failed": 0,
            "by_team": {}
        },
        "users": 1,
        "voice_capability": True,
        "intelligent_routing": True
    }

if __name__ == "__main__":
    host = os.getenv("HOST", "localhost")
    port = int(os.getenv("PORT", 8000))  # Changed to 8000 (standard port)
    uvicorn.run(app, host=host, port=port)  # Pass app object directly instead of string
