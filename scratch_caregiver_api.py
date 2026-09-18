import os

schema_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/app/schemas/caregiver.py'
os.makedirs(os.path.dirname(schema_path), exist_ok=True)
with open(schema_path, 'w', encoding='utf-8') as f:
    f.write('''from pydantic import BaseModel
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
''')

api_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/app/api/v1/caregiver.py'
with open(api_path, 'w', encoding='utf-8') as f:
    f.write('''from fastapi import APIRouter, HTTPException
from app.schemas.caregiver import CaregiverSummaryResponse, CareTask, AiCareSummary

router = APIRouter()

@router.get("/{member_id}/summary", response_model=CaregiverSummaryResponse)
async def get_caregiver_summary(member_id: str, user_id: str, language: str = "en"):
    # Mock deterministic logic verifying the user_id (Citizen) has access to member_id
    if user_id != "citizen-1" and not user_id.startswith("demo"):
        raise HTTPException(status_code=403, detail="Not authorized to view this family member")

    # Deterministic mock based on member_id
    if member_id == "sita":
        return CaregiverSummaryResponse(
            member_id="sita",
            member_name="Sita Patel",
            has_emergency=False,
            tasks=[
                CareTask(
                    id="task-1",
                    type="FOLLOW_UP",
                    title="Follow-up Due",
                    description="Doctor follow-up is scheduled for next week.",
                    action_label="View Follow-up",
                    action_url="/citizen/health-wallet?member=sita",
                    status="UPCOMING"
                ),
                CareTask(
                    id="task-2",
                    type="REPORT",
                    title="New Report Available",
                    description="Recent CBC diagnostic report is available for review.",
                    action_label="View Report",
                    action_url="/citizen/health-wallet?member=sita",
                    status="PENDING"
                )
            ],
            ai_summary=AiCareSummary(
                priority="Follow-up approaching.",
                evidence="An upcoming follow-up is recorded next week along with a recent CBC report.",
                suggested_action="Review the Visit Brief before the consultation.",
                summary_audio_text="Sita has an upcoming doctor follow-up next week. A new blood report is also available to review."
            )
        )
    elif member_id == "aarav":
        return CaregiverSummaryResponse(
            member_id="aarav",
            member_name="Aarav Patel",
            has_emergency=False,
            tasks=[
                CareTask(
                    id="task-3",
                    type="VACCINATION",
                    title="Vaccination Due",
                    description="Routine vaccination follow-up is pending.",
                    action_label="View Vaccination",
                    action_url="/citizen/health-wallet?member=aarav",
                    status="PENDING"
                )
            ],
            ai_summary=AiCareSummary(
                priority="Vaccination pending.",
                evidence="A routine child vaccination is due soon.",
                suggested_action="Schedule or review the vaccination in the health wallet.",
                summary_audio_text="Aarav is due for a routine vaccination soon."
            )
        )
    else:
        raise HTTPException(status_code=404, detail="Family member not found in your wallet.")
''')

main_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/main.py'
with open(main_path, 'r', encoding='utf-8') as f:
    main_content = f.read()

if 'caregiver' not in main_content:
    main_content = main_content.replace('from app.api.v1 import ai, wallet, asha, doctor, pharmacy, lab, citizen, scheme, caremap, emergency, nudge, panchayat, visit_brief, asha_sync', 'from app.api.v1 import ai, wallet, asha, doctor, pharmacy, lab, citizen, scheme, caremap, emergency, nudge, panchayat, visit_brief, asha_sync, caregiver')
    main_content = main_content.replace('app.include_router(asha_sync.router, prefix="/api/v1/asha", tags=["ASHA Sync"])', 'app.include_router(asha_sync.router, prefix="/api/v1/asha", tags=["ASHA Sync"])\napp.include_router(caregiver.router, prefix="/api/v1/caregiver", tags=["Caregiver Mode"])')
    
    with open(main_path, 'w', encoding='utf-8') as f:
        f.write(main_content)

print("Created backend schema and API for Caregiver Mode")
