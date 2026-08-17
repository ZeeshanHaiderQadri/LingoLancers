"""HTTP API for the Market Launch mission vertical slice."""

import asyncio
import os

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from .events import broker
from .models import MarketLaunchAccepted, MarketLaunchRequest, MarketLaunchResponse, MissionStatus
from .service import MarketLaunchMissionService


router = APIRouter(prefix="/api/missions", tags=["missions"])
service = MarketLaunchMissionService()


@router.get("/readiness")
async def mission_readiness() -> dict[str, bool]:
    """Expose configuration readiness without returning secrets."""
    return {
        "foundry_project_endpoint_configured": bool(os.getenv("FOUNDRY_PROJECT_ENDPOINT")),
        "foundry_model_configured": bool(os.getenv("FOUNDRY_MODEL")),
    }


async def _run_market_launch(mission_id: str, request: MarketLaunchRequest) -> None:
    result = await service.run(request, mission_id, lambda event: broker.publish(mission_id, event))
    broker.set_result(result)


@router.post("/market-launch", response_model=MarketLaunchAccepted, status_code=202)
async def create_market_launch_mission(request: MarketLaunchRequest) -> MarketLaunchAccepted:
    """Start a mission and stream its agent events to Mission Control."""
    mission_id = __import__("uuid").uuid4().hex
    asyncio.create_task(_run_market_launch(mission_id, request))
    return MarketLaunchAccepted(mission_id=mission_id, status=MissionStatus.RUNNING)


@router.get("/{mission_id}", response_model=MarketLaunchResponse)
async def get_market_launch_mission(mission_id: str) -> MarketLaunchResponse:
    result = broker.get_result(mission_id)
    if not result:
        raise HTTPException(status_code=404, detail="Mission is still running or was not found.")
    return result


@router.websocket("/{mission_id}/events")
async def stream_mission_events(websocket: WebSocket, mission_id: str) -> None:
    await websocket.accept()
    queue, history = await broker.subscribe(mission_id)
    try:
        for event in history:
            await websocket.send_json(event.model_dump())
        while True:
            event = await queue.get()
            await websocket.send_json(event.model_dump())
    except WebSocketDisconnect:
        pass
    finally:
        broker.unsubscribe(mission_id, queue)
