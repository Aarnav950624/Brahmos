from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum
from app.schemas.doctor import Medicine

class RequestStatus(str, Enum):
    REQUESTED = "REQUESTED"
    ACCEPTED = "ACCEPTED"
    PACKED = "PACKED"
    DISPATCHED = "DISPATCHED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class PharmacyRequestBase(BaseModel):
    patient_id: str
    patient_name: str
    prescription_id: Optional[str] = None
    doctor_name: Optional[str] = None
    medicines: List[Medicine]

class PharmacyRequestCreate(PharmacyRequestBase):
    pass

class PharmacyRequest(PharmacyRequestBase):
    id: str
    status: RequestStatus
    created_at: str
    updated_at: str

class InventoryStatus(str, Enum):
    IN_STOCK = "IN_STOCK"
    LOW_STOCK = "LOW_STOCK"
    OUT_OF_STOCK = "OUT_OF_STOCK"

class InventoryItem(BaseModel):
    id: str
    medicine_name: str
    available_quantity: int
    unit: str
    reorder_threshold: int
    status: InventoryStatus
