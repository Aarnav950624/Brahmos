from pydantic import BaseModel
from typing import List, Optional

class VisitBriefRequest(BaseModel):
    user_id: str
    language: str = "en"

class QuestionItem(BaseModel):
    id: str
    text: str

class VisitBriefResponse(BaseModel):
    reason_for_visit: str
    recent_concerns: List[dict]
    recent_reports: List[dict]
    recent_changes: List[dict]
    current_medications: List[dict]
    recent_consultations: List[dict]
    upcoming_follow_up: Optional[dict]
    preventive_information: List[dict]
    questions_for_doctor: List[QuestionItem]
    ai_summary: Optional[dict]
