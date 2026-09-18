from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid
from app.schemas.pharmacy import (
    PharmacyRequest, PharmacyRequestCreate, RequestStatus,
    InventoryItem, InventoryStatus
)
from app.schemas.doctor import Medicine

router = APIRouter()

# In-memory storage for demo
mock_pharmacy_requests: List[PharmacyRequest] = []

mock_inventory: List[InventoryItem] = [
    InventoryItem(id="inv-1", medicine_name="Paracetamol", available_quantity=500, unit="tablets", reorder_threshold=100, status=InventoryStatus.IN_STOCK),
    InventoryItem(id="inv-2", medicine_name="Amoxicillin", available_quantity=20, unit="capsules", reorder_threshold=50, status=InventoryStatus.LOW_STOCK),
    InventoryItem(id="inv-3", medicine_name="ORS", available_quantity=0, unit="sachets", reorder_threshold=100, status=InventoryStatus.OUT_OF_STOCK),
    InventoryItem(id="inv-4", medicine_name="Iron supplement", available_quantity=200, unit="tablets", reorder_threshold=50, status=InventoryStatus.IN_STOCK),
    InventoryItem(id="inv-5", medicine_name="Vitamin D", available_quantity=150, unit="capsules", reorder_threshold=50, status=InventoryStatus.IN_STOCK),
]

@router.get("/requests", response_model=List[PharmacyRequest])
async def get_pharmacy_requests():
    return sorted(mock_pharmacy_requests, key=lambda x: x.created_at, reverse=True)

@router.get("/requests/{request_id}", response_model=PharmacyRequest)
async def get_pharmacy_request(request_id: str):
    for req in mock_pharmacy_requests:
        if req.id == request_id:
            return req
    raise HTTPException(status_code=404, detail="Request not found")

@router.post("/requests/{request_id}/status")
async def update_request_status(request_id: str, status: RequestStatus):
    for req in mock_pharmacy_requests:
        if req.id == request_id:
            req.status = status
            req.updated_at = datetime.now().isoformat()
            return {"status": "success", "request_id": request_id, "new_status": req.status}
    raise HTTPException(status_code=404, detail="Request not found")

@router.get("/inventory", response_model=List[InventoryItem])
async def get_inventory():
    return mock_inventory

@router.post("/inventory/{item_id}/restock")
async def restock_inventory(item_id: str):
    for item in mock_inventory:
        if item.id == item_id:
            item.available_quantity += 100
            item.status = InventoryStatus.IN_STOCK
            return {"status": "success", "item": item}
    raise HTTPException(status_code=404, detail="Item not found")

# Internal endpoint for doctor module to create a pharmacy request
def create_internal_pharmacy_request(data: PharmacyRequestCreate) -> PharmacyRequest:
    req = PharmacyRequest(
        id=f"rx-{uuid.uuid4().hex[:6]}",
        patient_id=data.patient_id,
        patient_name=data.patient_name,
        prescription_id=data.prescription_id,
        doctor_name=data.doctor_name,
        medicines=data.medicines,
        status=RequestStatus.REQUESTED,
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat(),
    )
    mock_pharmacy_requests.append(req)
    return req
