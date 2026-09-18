from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.doctor import (
    DoctorQueueItem, QueueStatus, ConsultationNoteRequest, 
    ConsultationResponse, PrescriptionRequest, FollowUpRequest
)
from app.schemas.asha import PriorityEnum
import uuid

router = APIRouter()

@router.get("/queue", response_model=List[DoctorQueueItem])
async def get_doctor_queue():
    """
    Mock endpoint returning doctor queue for hackathon demo.
    """
    return [
        DoctorQueueItem(
            id="ref-101",
            patient_id="mem-002",
            patient_name="Asha Devi",
            age=29,
            source="ASHA Worker",
            reason="Pregnancy follow-up requires attention",
            priority=PriorityEnum.HIGH,
            status=QueueStatus.WAITING,
            waiting_time_minutes=45
        ),
        DoctorQueueItem(
            id="ref-102",
            patient_id="mem-001",
            patient_name="Ramesh Patel",
            age=42,
            source="Citizen",
            reason="Follow-up regarding recent health report",
            priority=PriorityEnum.MODERATE,
            status=QueueStatus.WAITING,
            waiting_time_minutes=120
        )
    ]

@router.post("/consultations", response_model=ConsultationResponse)
async def save_consultation(request: ConsultationNoteRequest):
    return ConsultationResponse(
        id=f"cons-{uuid.uuid4().hex[:6]}",
        status="COMPLETED",
        message="Consultation notes saved successfully."
    )

from app.schemas.pharmacy import PharmacyRequestCreate
from app.api.v1.pharmacy import create_internal_pharmacy_request
from app.schemas.lab import DiagnosticRequestCreate
from app.api.v1.lab import create_internal_lab_request

@router.post("/prescriptions")
async def save_prescription(request: PrescriptionRequest):
    # Generate pharmacy request automatically from prescription
    patient_name = "Asha Devi" if request.patient_id == "mem-002" else "Ramesh Patel"
    pharmacy_data = PharmacyRequestCreate(
        patient_id=request.patient_id,
        patient_name=patient_name,
        prescription_id=f"rx-{uuid.uuid4().hex[:6]}",
        doctor_name="Dr. Smith",
        medicines=request.medicines
    )
    create_internal_pharmacy_request(pharmacy_data)
    return {"status": "success", "message": "Prescription and Pharmacy Request created."}

@router.post("/diagnostic-requests")
async def save_diagnostic_request(request: DiagnosticRequestCreate):
    create_internal_lab_request(request)
    return {"status": "success", "message": "Diagnostic Request created."}

@router.post("/followups")
async def save_followup(request: FollowUpRequest):
    return {"status": "success", "message": "Follow-up scheduled."}

@router.post("/referrals/{referral_id}/status")
async def update_referral_status(referral_id: str, status: QueueStatus):
    return {"status": "success", "referral_id": referral_id, "new_status": status}
