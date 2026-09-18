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

class RiskIndicatorRequest(BaseModel):
    member_id: str
    visit_data: dict

class RiskIndicatorOutput(BaseModel):
    title: str
    priority: str
    reason: str
    evidence: List[str]
    suggested_action: str

class RiskIndicatorResponse(BaseModel):
    overall_priority: str
    indicators: List[RiskIndicatorOutput]
    questions_for_professional: List[str] = []
    disclaimer: str = "This is general AI guidance and not a medical diagnosis."



class AskRequest(BaseModel):
    user_id: str
    role: str
    question: str
    language: str = "en"
    family_member_id: Optional[str] = None

class SourceContext(BaseModel):
    source_type: str
    source_id: str
    label: str

class AskResponse(BaseModel):
    answer: str
    key_points: List[str]
    source_context: List[SourceContext]
    suggested_action: Optional[str] = None
    action_label: Optional[str] = None
    action_url: Optional[str] = None
    safety_note: Optional[str] = None
    disclaimer: str
