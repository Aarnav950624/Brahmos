from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime
from enum import Enum

class PriorityEnum(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    EMERGENCY = "EMERGENCY"

class ReferralStatus(str, Enum):
    PENDING = "PENDING"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"

class RiskIndicatorBase(BaseModel):
    title: str
    priority: PriorityEnum
    reason: str
    evidence: List[str]
    suggested_action: str

class RiskIndicator(RiskIndicatorBase):
    id: str

class EscalationRequest(BaseModel):
    member_id: str
    risk_indicator_title: str
    reason: str
    priority: PriorityEnum

class EscalationResponse(BaseModel):
    id: str
    member_id: str
    risk_indicator_title: str
    reason: str
    priority: PriorityEnum
    status: ReferralStatus
    created_at: datetime
    message: str = "Referral successfully created."
