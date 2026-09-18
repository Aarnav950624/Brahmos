from typing import Any

from pydantic import BaseModel, Field

from app.schemas.common import AiMeta


class VisitBriefRequest(BaseModel):
    """Structured patient context prepared by the webapp."""

    patient: dict[str, Any] = Field(default_factory=dict)
    period: dict[str, Any] = Field(default_factory=dict)
    medications: list[dict[str, Any]] = Field(default_factory=list)
    adherence: dict[str, Any] = Field(default_factory=dict)
    checkIns: list[dict[str, Any]] = Field(default_factory=list)
    vitals: list[dict[str, Any]] = Field(default_factory=list)
    carePlan: dict[str, Any] = Field(default_factory=dict)
    escalations: list[dict[str, Any]] = Field(default_factory=list)
    appointments: list[dict[str, Any]] = Field(default_factory=list)
    recentEvents: list[str] = Field(default_factory=list)
    investigations: list[dict[str, Any]] = Field(default_factory=list)
    local_draft: dict[str, Any] = Field(default_factory=dict)


class MedicationBrief(BaseModel):
    adherence_percent: float | None = None
    missed_doses: int = 0
    notes: list[str] = Field(default_factory=list)


class CheckInBriefOut(BaseModel):
    completed: int = 0
    expected: int = 0
    notes: list[str] = Field(default_factory=list)


class ConcernItem(BaseModel):
    topic: str
    mentions: int


class VitalItem(BaseModel):
    label: str
    latest: str
    trend: str = "insufficient"
    recorded_at: str | None = None


class CarePlanItem(BaseModel):
    title: str
    status: str = "unknown"


class VisitBriefResponse(BaseModel):
    period_days: int
    period_label: str
    overview: str
    care_plan_progress_percent: float | None = None
    medication: MedicationBrief = Field(default_factory=MedicationBrief)
    check_ins: CheckInBriefOut = Field(default_factory=CheckInBriefOut)
    concerns: list[ConcernItem] = Field(default_factory=list)
    vitals: list[VitalItem] = Field(default_factory=list)
    care_plan_items: list[CarePlanItem] = Field(default_factory=list)
    recent_events: list[str] = Field(default_factory=list)
    discussion_points: list[str] = Field(default_factory=list)
    missing_information: list[str] = Field(default_factory=list)
    source: str = "ai"
    generated_at: str | None = None
    disclaimer: str
    meta: AiMeta
