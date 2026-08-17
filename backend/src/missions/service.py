"""Official Microsoft Agent Framework entry point for Market Launch missions."""

import os
import uuid
import logging
from collections.abc import Awaitable, Callable

from agent_framework.foundry import FoundryChatClient
from azure.identity import DefaultAzureCredential

from .models import MarketLaunchRequest, MarketLaunchResponse, MissionEvent, MissionStatus


logger = logging.getLogger(__name__)


MISSION_MANAGER_INSTRUCTIONS = """
You are Lingo's Market Launch Mission Manager. Convert a business objective into a
concise, evidence-first launch brief. State assumptions explicitly. Do not claim
that research has been verified unless sources were supplied by a tool. Do not
recommend publishing, spending, or contacting third parties without a human
approval step. Return a practical plan with: goal, audience, market hypotheses,
evidence needed, offer questions, creative requirements, approval gates, and
the next three actions.
""".strip()


class MissionConfigurationError(RuntimeError):
    """Raised when the Foundry project is not configured for mission execution."""


class MarketLaunchMissionService:
    """Runs the first isolated official-MAF mission manager agent."""

    def _create_agent(self):
        project_endpoint = os.getenv("FOUNDRY_PROJECT_ENDPOINT")
        model = os.getenv("FOUNDRY_MODEL")
        if not project_endpoint or not model:
            raise MissionConfigurationError(
                "Market Launch missions require FOUNDRY_PROJECT_ENDPOINT and FOUNDRY_MODEL."
            )

        client = FoundryChatClient(
            project_endpoint=project_endpoint,
            model=model,
            credential=DefaultAzureCredential(),
        )
        return client.as_agent(
            name="market_launch_manager",
            instructions=MISSION_MANAGER_INSTRUCTIONS,
        )

    async def run(
        self,
        request: MarketLaunchRequest,
        mission_id: str | None = None,
        emit: Callable[[MissionEvent], Awaitable[None]] | None = None,
    ) -> MarketLaunchResponse:
        mission_id = mission_id or str(uuid.uuid4())
        events: list[MissionEvent] = []

        async def add_event(event: MissionEvent) -> None:
            events.append(event)
            if emit:
                await emit(event)

        await add_event(MissionEvent(type="mission.started", message="Market Launch mission accepted."))
        await add_event(MissionEvent(type="agent.status", message="Mission Manager is preparing the launch brief."))

        try:
            agent = self._create_agent()
            response = await agent.run(
                "Create a Market Launch mission brief from this structured input:\n"
                f"{request.model_dump_json(indent=2)}"
            )
        except Exception:
            logger.exception("Market Launch mission %s failed", mission_id)
            await add_event(
                MissionEvent(
                    type="mission.failed",
                    message="Mission execution failed. Check server logs and retry.",
                )
            )
            return MarketLaunchResponse(
                mission_id=mission_id,
                status=MissionStatus.FAILED,
                manager_summary="Mission could not start. Resolve the configuration error and retry.",
                events=events,
            )

        await add_event(MissionEvent(type="mission.completed", message="Mission Manager produced a launch brief."))
        return MarketLaunchResponse(
            mission_id=mission_id,
            status=MissionStatus.COMPLETED,
            manager_summary=response.text,
            events=events,
        )
