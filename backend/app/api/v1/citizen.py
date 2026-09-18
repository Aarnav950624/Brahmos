from fastapi import APIRouter
from typing import List, Dict, Any
from app.api.v1.pharmacy import mock_pharmacy_requests
from app.api.v1.lab import mock_lab_requests

router = APIRouter()

@router.get("/requests")
async def get_citizen_requests(patient_id: str = "mem-002"):
    my_pharma = [r for r in mock_pharmacy_requests if r.patient_id == patient_id]
    my_lab = [r for r in mock_lab_requests if r.patient_id == patient_id]
    
    return {
        "pharmacy": my_pharma,
        "lab": my_lab
    }

@router.get("/requests/{request_id}")
async def get_citizen_request(request_id: str):
    for r in mock_pharmacy_requests:
        if r.id == request_id:
            return {"type": "pharmacy", "data": r}
    for r in mock_lab_requests:
        if r.id == request_id:
            return {"type": "lab", "data": r}
    return {"status": "error", "message": "Not found"}
