from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid
from app.schemas.emergency import EmergencyEvent, EmergencyEventCreate, EmergencyStatusUpdate, EmergencyStatus
from app.api.v1.caremap import get_nearest, CareFacilityType

router = APIRouter()

mock_emergency_events: List[EmergencyEvent] = []

@router.post("/sos", response_model=EmergencyEvent)
async def create_sos_event(request: EmergencyEventCreate):
    event = EmergencyEvent(
        id=f"evt-{uuid.uuid4().hex[:8]}",
        source=request.source,
        member_id=request.member_id,
        priority=request.priority,
        status=EmergencyStatus.CREATED,
        facility_id=request.facility_id,
        created_at=datetime.utcnow().isoformat(),
        demo=True,
        context=request.context
    )
    mock_emergency_events.append(event)
    return event

@router.get("/events/{id}", response_model=EmergencyEvent)
async def get_event(id: str):
    for event in mock_emergency_events:
        if event.id == id:
            return event
    raise HTTPException(status_code=404, detail="Event not found")

@router.post("/events/{id}/status", response_model=EmergencyEvent)
async def update_event_status(id: str, update: EmergencyStatusUpdate):
    for event in mock_emergency_events:
        if event.id == id:
            event.status = update.status
            return event
    raise HTTPException(status_code=404, detail="Event not found")

@router.get("/nearest", response_model=List[dict])
async def get_nearest_emergency(latitude: float, longitude: float):
    # Reuse caremap nearest logic filtered to EMERGENCY
    return await get_nearest(latitude, longitude, type=CareFacilityType.EMERGENCY, service=None)
