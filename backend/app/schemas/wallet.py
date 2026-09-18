from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from enum import Enum

class EventType(str, Enum):
    CONSULTATION = "CONSULTATION"
    REPORT = "REPORT"
    PRESCRIPTION = "PRESCRIPTION"
    MEDICINE = "MEDICINE"
    VACCINATION = "VACCINATION"
    FOLLOW_UP = "FOLLOW_UP"

class EventStatus(str, Enum):
    COMPLETED = "COMPLETED"
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    SCHEDULED = "SCHEDULED"

class FamilyMemberBase(BaseModel):
    name: str
    age: int
    gender: str
    relation: str
    village: str

class FamilyMember(FamilyMemberBase):
    id: str

class HealthTimelineEventBase(BaseModel):
    family_member_id: str
    date: date
    type: EventType
    title: str
    description: str
    status: Optional[EventStatus] = None
    details: Optional[dict] = None

class HealthTimelineEvent(HealthTimelineEventBase):
    id: str

class WalletOverview(BaseModel):
    last_consultation: Optional[date] = None
    upcoming_follow_up: Optional[date] = None
    active_medicines_count: int
    recent_reports_count: int
    vaccination_status: str

class HealthWalletResponse(BaseModel):
    member: FamilyMember
    overview: WalletOverview
    timeline: List[HealthTimelineEvent]
