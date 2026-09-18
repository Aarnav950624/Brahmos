from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class UrgencyLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    EMERGENCY = "EMERGENCY"

class SymptomCheckRequest(BaseModel):
    symptoms: str = Field(..., description="The symptoms described by the user")
    language: str = Field("en", description="The language code (en, hi, gu)")

class SymptomCheckResponse(BaseModel):
    urgency: UrgencyLevel
    summary: str
    possible_concerns: List[str]
    recommended_action: str
    red_flags: List[str]
    when_to_seek_help: str
    disclaimer: str = Field(
        default="This is general AI guidance and not a medical diagnosis."
    )
