from pydantic import BaseModel, Field
from typing import List, Optional
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

class ReportAnalysisRequest(BaseModel):
    report_id: str
    language: str = Field("en", description="The language code (en, hi, gu)")
    include_comparison: bool = Field(False, description="Whether to compare with previous reports")

class ReportFinding(BaseModel):
    parameter: str
    value: str
    status: str # e.g., "NORMAL", "HIGH", "LOW"
    explanation: str

class ComparisonInsight(BaseModel):
    parameter: str
    previous_value: str
    current_value: str
    trend: str # e.g., "IMPROVED", "WORSENED", "STABLE"
    explanation: str

class ReportAnalysisResponse(BaseModel):
    report_name: str
    summary: str
    findings: List[ReportFinding]
    comparison: Optional[List[ComparisonInsight]] = None
    recommended_action: str
    disclaimer: str = Field(
        default="AI interpretation is for informational purposes only. Always consult a doctor for a definitive diagnosis."
    )

