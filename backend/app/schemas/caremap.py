from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class CareFacilityType(str, Enum):
    PHC = "PHC"
    DOCTOR = "DOCTOR"
    PHARMACY = "PHARMACY"
    DIAGNOSTIC_LAB = "DIAGNOSTIC_LAB"
    EMERGENCY = "EMERGENCY"

class CareFacility(BaseModel):
    id: str
    name: str
    type: CareFacilityType
    latitude: float
    longitude: float
    area: str
    address: str
    contact: str
    services: List[str]
    availability: str
    is_demo: bool = True

class NearestCareRequest(BaseModel):
    latitude: float
    longitude: float
    type: Optional[CareFacilityType] = None
    service: Optional[str] = None
    radius_km: Optional[float] = 10.0
