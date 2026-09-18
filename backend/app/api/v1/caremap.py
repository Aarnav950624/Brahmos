from fastapi import APIRouter, HTTPException
from typing import List, Optional
import math
from app.schemas.caremap import CareFacility, CareFacilityType

router = APIRouter()

DEMO_FACILITIES: List[CareFacility] = [
    CareFacility(id="cf-1", name="Navjeevan Primary Health Centre", type=CareFacilityType.PHC, latitude=23.0225, longitude=72.5714, area="Navjeevan Gram", address="Main Road, Navjeevan Gram", contact="079-23456789", services=["General Consultation", "Maternal Health", "Child Health", "Vaccination"], availability="Open 24/7"),
    CareFacility(id="cf-2", name="Rural Health Post (North)", type=CareFacilityType.PHC, latitude=23.0300, longitude=72.5800, area="Navjeevan North", address="North Zone, Navjeevan Gram", contact="079-23456790", services=["General Consultation", "Vaccination"], availability="09:00 AM - 05:00 PM"),
    CareFacility(id="cf-3", name="Navjeevan Community Clinic", type=CareFacilityType.PHC, latitude=23.0150, longitude=72.5600, area="Navjeevan South", address="South Zone, Navjeevan Gram", contact="079-23456791", services=["General Consultation", "Maternal Health"], availability="08:00 AM - 08:00 PM"),
    CareFacility(id="cf-4", name="Dr. Sharma Family Clinic", type=CareFacilityType.DOCTOR, latitude=23.0240, longitude=72.5730, area="Navjeevan Gram", address="Near Market, Navjeevan", contact="9876543210", services=["General Consultation", "Child Health"], availability="10:00 AM - 07:00 PM"),
    CareFacility(id="cf-5", name="Arogya Family Clinic", type=CareFacilityType.DOCTOR, latitude=23.0280, longitude=72.5680, area="Navjeevan Gram", address="Station Road, Navjeevan", contact="9876543211", services=["General Consultation", "Diabetes Management"], availability="09:00 AM - 06:00 PM"),
    CareFacility(id="cf-6", name="Dr. Patel Clinic", type=CareFacilityType.DOCTOR, latitude=23.0180, longitude=72.5780, area="Navjeevan Gram", address="East Sector, Navjeevan", contact="9876543212", services=["General Consultation"], availability="Evening 05:00 PM - 09:00 PM"),
    CareFacility(id="cf-7", name="Arogya Pharmacy", type=CareFacilityType.PHARMACY, latitude=23.0230, longitude=72.5720, area="Navjeevan Gram", address="Opp PHC, Navjeevan", contact="9876543213", services=["Medicines", "First Aid"], availability="24/7"),
    CareFacility(id="cf-8", name="Sahyog Pharmacy", type=CareFacilityType.PHARMACY, latitude=23.0260, longitude=72.5750, area="Navjeevan Gram", address="Main Bazaar, Navjeevan", contact="9876543214", services=["Medicines"], availability="08:00 AM - 10:00 PM"),
    CareFacility(id="cf-9", name="LifeCare Medical Store", type=CareFacilityType.PHARMACY, latitude=23.0190, longitude=72.5650, area="Navjeevan Gram", address="South Market, Navjeevan", contact="9876543215", services=["Medicines"], availability="09:00 AM - 09:00 PM"),
    CareFacility(id="cf-10", name="Navjeevan Diagnostics", type=CareFacilityType.DIAGNOSTIC_LAB, latitude=23.0250, longitude=72.5700, area="Navjeevan Gram", address="Medical Complex, Navjeevan", contact="9876543216", services=["Diagnostics", "Blood Test", "Lipid Profile"], availability="07:00 AM - 08:00 PM"),
    CareFacility(id="cf-11", name="CityPath Labs", type=CareFacilityType.DIAGNOSTIC_LAB, latitude=23.0210, longitude=72.5790, area="Navjeevan Gram", address="East Wing, Navjeevan", contact="9876543217", services=["Diagnostics", "X-Ray"], availability="08:00 AM - 06:00 PM"),
    CareFacility(id="cf-12", name="District Emergency Care Centre", type=CareFacilityType.EMERGENCY, latitude=23.0350, longitude=72.5850, area="District HQ", address="District Hospital Campus", contact="108", services=["Emergency Care", "Trauma", "Surgery"], availability="24/7"),
    CareFacility(id="cf-13", name="Navjeevan Rapid Response Unit", type=CareFacilityType.EMERGENCY, latitude=23.0100, longitude=72.5500, area="Highway Access", address="Highway Route 4", contact="108", services=["Emergency Care", "Ambulance Base"], availability="24/7")
]

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in km
    lat1_rad, lon1_rad = math.radians(lat1), math.radians(lon1)
    lat2_rad, lon2_rad = math.radians(lat2), math.radians(lon2)
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("/facilities", response_model=List[CareFacility])
async def get_facilities(type: Optional[CareFacilityType] = None, service: Optional[str] = None):
    res = DEMO_FACILITIES
    if type:
        res = [f for f in res if f.type == type]
    if service:
        res = [f for f in res if service.lower() in [s.lower() for s in f.services]]
    return res

@router.get("/facilities/{id}", response_model=CareFacility)
async def get_facility(id: str):
    for f in DEMO_FACILITIES:
        if f.id == id:
            return f
    raise HTTPException(status_code=404, detail="Facility not found")

@router.get("/nearest", response_model=List[dict])
async def get_nearest(latitude: float, longitude: float, type: Optional[CareFacilityType] = None, service: Optional[str] = None):
    facilities = DEMO_FACILITIES
    if type:
        facilities = [f for f in facilities if f.type == type]
    if service:
        facilities = [f for f in facilities if service.lower() in [s.lower() for s in f.services]]
        
    results = []
    for f in facilities:
        dist = haversine_distance(latitude, longitude, f.latitude, f.longitude)
        results.append({
            "facility": f,
            "distance_km": round(dist, 2)
        })
    results.sort(key=lambda x: x["distance_km"])
    return results
