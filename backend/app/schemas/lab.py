from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class DiagnosticStatus(str, Enum):
    REQUESTED = "REQUESTED"
    ACCEPTED = "ACCEPTED"
    SAMPLE_PENDING = "SAMPLE_PENDING"
    SAMPLE_COLLECTED = "SAMPLE_COLLECTED"
    PROCESSING = "PROCESSING"
    REPORT_READY = "REPORT_READY"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class DiagnosticRequestBase(BaseModel):
    patient_id: str
    patient_name: str
    doctor_name: Optional[str] = None
    consultation_id: Optional[str] = None
    test_name: str
    notes: Optional[str] = None

class DiagnosticRequestCreate(DiagnosticRequestBase):
    pass

class DiagnosticRequest(DiagnosticRequestBase):
    id: str
    status: DiagnosticStatus
    created_at: str
    updated_at: str
    result_value: Optional[str] = None

class DiagnosticResult(BaseModel):
    request_id: str
    result_text: str
