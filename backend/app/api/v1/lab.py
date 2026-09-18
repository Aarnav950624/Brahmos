from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid
from app.schemas.lab import (
    DiagnosticRequest, DiagnosticRequestCreate, DiagnosticStatus, DiagnosticResult
)

router = APIRouter()

mock_lab_requests: List[DiagnosticRequest] = []

@router.get("/requests", response_model=List[DiagnosticRequest])
async def get_lab_requests():
    return sorted(mock_lab_requests, key=lambda x: x.created_at, reverse=True)

@router.get("/requests/{request_id}", response_model=DiagnosticRequest)
async def get_lab_request(request_id: str):
    for req in mock_lab_requests:
        if req.id == request_id:
            return req
    raise HTTPException(status_code=404, detail="Lab request not found")

@router.post("/requests/{request_id}/status")
async def update_lab_request_status(request_id: str, status: DiagnosticStatus):
    for req in mock_lab_requests:
        if req.id == request_id:
            req.status = status
            req.updated_at = datetime.now().isoformat()
            return {"status": "success", "request_id": request_id, "new_status": req.status}
    raise HTTPException(status_code=404, detail="Lab request not found")

@router.post("/requests/{request_id}/result")
async def add_lab_result(request_id: str, result: DiagnosticResult):
    for req in mock_lab_requests:
        if req.id == request_id:
            req.result_value = result.result_text
            req.status = DiagnosticStatus.COMPLETED
            req.updated_at = datetime.now().isoformat()
            return {"status": "success", "request_id": request_id}
    raise HTTPException(status_code=404, detail="Lab request not found")

def create_internal_lab_request(data: DiagnosticRequestCreate) -> DiagnosticRequest:
    req = DiagnosticRequest(
        id=f"lab-{uuid.uuid4().hex[:6]}",
        patient_id=data.patient_id,
        patient_name=data.patient_name,
        doctor_name=data.doctor_name,
        consultation_id=data.consultation_id,
        test_name=data.test_name,
        notes=data.notes,
        status=DiagnosticStatus.REQUESTED,
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat(),
    )
    mock_lab_requests.append(req)
    return req
