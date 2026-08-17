"""Typed contracts for the first Market Launch mission."""

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class MissionStatus(str, Enum):
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class MarketLaunchRequest(BaseModel):
    objective: str = Field(min_length=10, max_length=2_000)
    target_market: str = Field(min_length=2, max_length=120)
    audience: str = Field(min_length=2, max_length=240)
    budget_currency: str = Field(default="USD", min_length=3, max_length=3)
    budget_amount: float | None = Field(default=None, ge=0)
    deadline: str | None = Field(default=None, max_length=40)
    success_metric: str | None = Field(default=None, max_length=240)


class MissionEvent(BaseModel):
    type: Literal["mission.started", "agent.status", "mission.completed", "mission.failed"]
    message: str


class MarketLaunchResponse(BaseModel):
    mission_id: str
    status: MissionStatus
    manager_summary: str
    events: list[MissionEvent]


class MarketLaunchAccepted(BaseModel):
    mission_id: str
    status: MissionStatus
