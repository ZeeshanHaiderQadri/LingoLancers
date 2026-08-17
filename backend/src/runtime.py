"""Lean production API for the Vercel dashboard and Azure-hosted Lingo agents.

This avoids importing retired prototype teams when deploying Mission Control.
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from missions.api import router as missions_router

load_dotenv()

app = FastAPI(title="Lingo Agent Runtime", version="3.0.0")

origins = [
    value.strip()
    for value in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if value.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(missions_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "lingo-agent-runtime"}


@app.get("/api/voice-live/readiness")
async def voice_live_readiness() -> dict[str, object]:
    """Return non-secret voice configuration for the product UI."""
    return {
        "ready": bool(os.getenv("AZURE_VOICE_LIVE_ENDPOINT")),
        "provider": "Azure Voice Live",
        "model": os.getenv("AZURE_VOICE_LIVE_MODEL", "gpt-4.1-mini"),
        "languages": ["English", "Arabic", "Urdu", "Hindi", "French", "Spanish"],
        "note": "Live microphone sessions are served by the Azure runtime; browser credentials are never exposed.",
    }
