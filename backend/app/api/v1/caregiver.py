from fastapi import APIRouter, HTTPException
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
