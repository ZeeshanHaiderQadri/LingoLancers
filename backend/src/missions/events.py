"""In-process mission event fan-out for the first Mission Control release."""

import asyncio
from collections import defaultdict

from .models import MarketLaunchResponse, MissionEvent, MissionStatus


class MissionEventBroker:
    def __init__(self) -> None:
        self._events: dict[str, list[MissionEvent]] = defaultdict(list)
        self._subscribers: dict[str, list[asyncio.Queue[MissionEvent]]] = defaultdict(list)
        self._results: dict[str, MarketLaunchResponse] = {}

    async def publish(self, mission_id: str, event: MissionEvent) -> None:
        self._events[mission_id].append(event)
        for queue in list(self._subscribers[mission_id]):
            await queue.put(event)

    async def subscribe(self, mission_id: str) -> tuple[asyncio.Queue[MissionEvent], list[MissionEvent]]:
        queue: asyncio.Queue[MissionEvent] = asyncio.Queue()
        self._subscribers[mission_id].append(queue)
        return queue, list(self._events[mission_id])

    def unsubscribe(self, mission_id: str, queue: asyncio.Queue[MissionEvent]) -> None:
        if queue in self._subscribers[mission_id]:
            self._subscribers[mission_id].remove(queue)

    def set_result(self, result: MarketLaunchResponse) -> None:
        self._results[result.mission_id] = result

    def get_result(self, mission_id: str) -> MarketLaunchResponse | None:
        return self._results.get(mission_id)

    def get_status(self, mission_id: str) -> MissionStatus | None:
        result = self.get_result(mission_id)
        return result.status if result else (MissionStatus.RUNNING if mission_id in self._events else None)


broker = MissionEventBroker()
