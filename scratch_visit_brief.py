import os

schema_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/app/schemas/visit_brief.py'
os.makedirs(os.path.dirname(schema_path), exist_ok=True)
with open(schema_path, 'w', encoding='utf-8') as f:
    f.write('''from pydantic import BaseModel
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
''')

api_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/app/api/v1/visit_brief.py'
with open(api_path, 'w', encoding='utf-8') as f:
    f.write('''from fastapi import APIRouter, HTTPException, Depends
from app.schemas.visit_brief import VisitBriefRequest, VisitBriefResponse, QuestionItem

router = APIRouter()

@router.get("/summary", response_model=VisitBriefResponse)
async def get_visit_brief(user_id: str, language: str = "en"):
    # Mock deterministic visit brief retrieval
    return VisitBriefResponse(
        reason_for_visit="Follow-up for my recent blood report.",
        recent_concerns=[
            {"symptom": "Headache", "date": "Yesterday", "urgency": "LOW"}
        ],
        recent_reports=[
            {"name": "Complete Blood Count (CBC)", "date": "2026-10-15", "url": "/citizen/health-wallet"}
        ],
        recent_changes=[
            {"parameter": "Hemoglobin", "previous": "12.0 g/dL", "current": "11.2 g/dL", "change": "-0.8 g/dL"}
        ],
        current_medications=[
            {"name": "Paracetamol (500mg)", "dosage": "As needed", "date": "2026-10-10"}
        ],
        recent_consultations=[
            {"date": "2026-10-10", "doctor": "Dr. Sharma", "type": "General Checkup", "status": "COMPLETED"}
        ],
        upcoming_follow_up={"date": "2026-10-18", "type": "Consultation Review"},
        preventive_information=[
            {"name": "Flu Vaccine", "status": "Pending", "dueDate": "2026-11-01"}
        ],
        questions_for_doctor=[
            QuestionItem(id="q1", text="What does the change in my latest report mean?"),
            QuestionItem(id="q2", text="Should I repeat this test?"),
            QuestionItem(id="q3", text="When should I return for follow-up?")
        ],
        ai_summary={
            "summary": "The patient has a slightly low hemoglobin count and reported a recent headache. They are currently taking Paracetamol as needed. A follow-up is scheduled for October 18.",
            "safety_note": "This is an AI-generated summary of recorded information. It is not a clinical diagnosis."
        }
    )
''')

main_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/main.py'
with open(main_path, 'r', encoding='utf-8') as f:
    main_content = f.read()

if 'visit_brief' not in main_content:
    main_content = main_content.replace('from app.api.v1 import ai, wallet, asha, doctor, pharmacy, lab, citizen, scheme, caremap, emergency, nudge, panchayat', 'from app.api.v1 import ai, wallet, asha, doctor, pharmacy, lab, citizen, scheme, caremap, emergency, nudge, panchayat, visit_brief')
    main_content = main_content.replace('app.include_router(nudge.router, prefix="/api/v1/nudge", tags=["Nudge Engine"])', 'app.include_router(nudge.router, prefix="/api/v1/nudge", tags=["Nudge Engine"])\napp.include_router(visit_brief.router, prefix="/api/v1/visit-brief", tags=["Visit Brief"])')
    
    with open(main_path, 'w', encoding='utf-8') as f:
        f.write(main_content)

print("Created backend schema and API for Visit Brief")
