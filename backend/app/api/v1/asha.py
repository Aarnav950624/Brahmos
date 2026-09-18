from fastapi import APIRouter, HTTPException
from app.schemas.asha import EscalationRequest, EscalationResponse, ReferralStatus
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/referrals", response_model=EscalationResponse)
async def create_referral(request: EscalationRequest):
    """
    Creates a synthetic escalation/referral record to a Doctor.
    """
    return EscalationResponse(
        id=f"ref-{uuid.uuid4().hex[:6]}",
        member_id=request.member_id,
        risk_indicator_title=request.risk_indicator_title,
        reason=request.reason,
        priority=request.priority,
        status=ReferralStatus.PENDING,
        created_at=datetime.utcnow(),
        message="Referral successfully created. The doctor has been notified."
    )
