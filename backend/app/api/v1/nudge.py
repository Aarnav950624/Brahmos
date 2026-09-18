from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timedelta
import uuid
from app.schemas.nudge import Notification, NudgeCategory, NudgePriority, NotificationGenerateRequest

router = APIRouter()

# In-memory storage for notifications
mock_notifications: List[Notification] = []

def generate_mock_nudges(user_id: str, role: str):
    # Only generate if list is empty to prevent infinite generation
    user_notifs = [n for n in mock_notifications if n.user_id == user_id]
    if len(user_notifs) > 0:
        return
        
    now = datetime.utcnow()
    
    if role == "CITIZEN":
        nudges = [
            Notification(
                id=f"notif-{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                category=NudgeCategory.REQUESTS,
                title="Your diagnostic report is ready",
                message="Your recent CBC test report is ready for review.",
                priority=NudgePriority.IMPORTANT,
                reason="Your diagnostic request is marked Report Ready.",
                action_label="View Report",
                action_url="/citizen/health-wallet",
                created_at=(now - timedelta(hours=2)).isoformat(),
                read=False,
                source_type="LAB_REQUEST",
                source_id="req-lab-1"
            ),
            Notification(
                id=f"notif-{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                category=NudgeCategory.REQUESTS,
                title="Medicine Dispatched",
                message="Your medicine request has been dispatched.",
                priority=NudgePriority.NORMAL,
                reason="Your pharmacy request changed status to DISPATCHED.",
                action_label="Track Request",
                action_url="/citizen/requests",
                created_at=(now - timedelta(hours=5)).isoformat(),
                read=False,
                source_type="PHARMACY_REQUEST",
                source_id="req-rx-1"
            ),
            Notification(
                id=f"notif-{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                category=NudgeCategory.SCHEMES,
                title="Potential welfare opportunity",
                message="A government health/welfare program may be relevant to your family.",
                priority=NudgePriority.NORMAL,
                reason="The scheme matcher identified PMJAY based on your synthetic profile.",
                action_label="Explore Schemes",
                action_url="/citizen/schemes",
                created_at=(now - timedelta(days=1)).isoformat(),
                read=False,
                source_type="SCHEME_MATCHER",
                source_id="scheme-pmjay"
            ),
            Notification(
                id=f"notif-{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                category=NudgeCategory.FOLLOW_UP,
                title="Doctor follow-up coming up",
                message="You have a consultation follow-up scheduled tomorrow.",
                priority=NudgePriority.IMPORTANT,
                reason="Your synthetic demo profile has a follow-up scheduled.",
                action_label="View Follow-up",
                action_url="/citizen/health-wallet",
                created_at=(now - timedelta(days=2)).isoformat(),
                read=True,
                source_type="CONSULTATION",
                source_id="cons-1"
            ),
            Notification(
                id=f"notif-{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                category=NudgeCategory.HEALTH,
                title="Vaccination follow-up may be due",
                message="Your child's vaccination may be due this week.",
                priority=NudgePriority.NORMAL,
                reason="Synthetic child-health information indicates a due follow-up.",
                action_label="View Health Wallet",
                action_url="/citizen/health-wallet",
                created_at=(now - timedelta(days=3)).isoformat(),
                read=True,
                source_type="VACCINATION",
                source_id="vac-1"
            )
        ]
        mock_notifications.extend(nudges)

    elif role == "ASHA_WORKER":
        nudges = [
             Notification(
                id=f"notif-{uuid.uuid4().hex[:8]}",
                user_id=user_id,
                category=NudgeCategory.FOLLOW_UP,
                title="Follow-up due for household",
                message="A household in Navjeevan Gram requires a postnatal follow-up.",
                priority=NudgePriority.IMPORTANT,
                reason="Scheduled visit in the ASHA registry is overdue.",
                action_label="View Household",
                action_url="/asha",
                created_at=(now - timedelta(hours=1)).isoformat(),
                read=False,
                source_type="HOUSEHOLD",
                source_id="hh-1"
            )
        ]
        mock_notifications.extend(nudges)


@router.post("/generate")
async def generate_nudges(request: NotificationGenerateRequest):
    generate_mock_nudges(request.user_id, request.role)
    return {"status": "success"}

@router.get("", response_model=List[Notification])
async def get_notifications(user_id: str):
    return [n for n in mock_notifications if n.user_id == user_id]

@router.get("/unread-count")
async def get_unread_count(user_id: str):
    count = sum(1 for n in mock_notifications if n.user_id == user_id and not n.read)
    return {"count": count}

@router.post("/{id}/read")
async def mark_read(id: str):
    for n in mock_notifications:
        if n.id == id:
            n.read = True
            return n
    raise HTTPException(status_code=404, detail="Notification not found")

@router.post("/read-all")
async def mark_all_read(user_id: str):
    for n in mock_notifications:
        if n.user_id == user_id:
            n.read = True
    return {"status": "success"}
