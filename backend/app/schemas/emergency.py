from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime

class EmergencyStatus(str, Enum):
    CREATED = "CREATED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"

class EmergencyPriority(str, Enum):
    EMERGENCY = "EMERGENCY"
    HIGH = "HIGH"

class EmergencyEvent(BaseModel):
    id: str
    source: str
    member_id: Optional[str] = None
    priority: EmergencyPriority
    status: EmergencyStatus
    facility_id: Optional[str] = None
    created_at: str
    demo: bool = True
    context: str

class EmergencyEventCreate(BaseModel):
    source: str
    member_id: Optional[str] = None
    priority: EmergencyPriority = EmergencyPriority.EMERGENCY
    facility_id: Optional[str] = None
    context: str

class EmergencyStatusUpdate(BaseModel):
    status: EmergencyStatus
