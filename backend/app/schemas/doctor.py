from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum
from app.schemas.asha import PriorityEnum

class QueueStatus(str, Enum):
    WAITING = "WAITING"
    IN_REVIEW = "IN_REVIEW"
    IN_CONSULTATION = "IN_CONSULTATION"
    COMPLETED = "COMPLETED"
    FOLLOW_UP = "FOLLOW_UP"

class DoctorQueueItem(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    age: int
    source: str
    reason: str
    priority: PriorityEnum
    status: QueueStatus
    waiting_time_minutes: int

class Medicine(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class PrescriptionRequest(BaseModel):
    patient_id: str
    consultation_id: str
    medicines: List[Medicine]

class FollowUpRequest(BaseModel):
    patient_id: str
    consultation_id: str
    follow_up_required: bool
    follow_up_date: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None

class ConsultationNoteRequest(BaseModel):
    patient_id: str
    referral_id: str
    chief_concern: str
    observations: str
    assessment: str
    plan: str
    additional_notes: Optional[str] = None

class ConsultationResponse(BaseModel):
    id: str
    status: str
    message: str
