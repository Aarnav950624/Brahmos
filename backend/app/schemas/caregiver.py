from pydantic import BaseModel
from typing import List, Optional

class CareTask(BaseModel):
    id: str
    type: str
    title: str
    description: str
    action_label: str
    action_url: str
    status: str

class AiCareSummary(BaseModel):
    priority: str
    evidence: str
    suggested_action: str
    summary_audio_text: str

class CaregiverSummaryResponse(BaseModel):
    member_id: str
    member_name: str
    tasks: List[CareTask]
    ai_summary: Optional[AiCareSummary] = None
    has_emergency: bool = False
