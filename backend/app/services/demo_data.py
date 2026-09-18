from typing import Dict, List, Any

VILLAGE_ID = "navjeevan-gram"
VILLAGE_NAME = "Navjeevan Gram"

DEMO_MEMBERS = {
    "member-ramesh": {"name": "Ramesh Patel", "age": 42, "role": "CITIZEN", "gender": "Male"},
    "member-sita": {"name": "Sita Patel", "age": 62, "role": "CITIZEN", "gender": "Female"},
    "member-aarav": {"name": "Aarav Patel", "age": 4, "role": "CITIZEN", "gender": "Male"},
    "member-suresh": {"name": "Suresh Kumar", "age": 55, "role": "CITIZEN", "gender": "Male"},
    "member-anita": {"name": "Anita Devi", "age": 34, "role": "CITIZEN", "gender": "Female"}
}

DEMO_REPORTS = [
    {"id": "rep-001", "member_id": "member-ramesh", "type": "CBC", "date": "2023-10-01", "findings": "Hemoglobin slightly low, WBC normal."},
    {"id": "rep-000", "member_id": "member-ramesh", "type": "CBC", "date": "2023-08-15", "findings": "Hemoglobin low, WBC normal."}
]

DEMO_PRESCRIPTIONS = [
    {"id": "rx-001", "member_id": "member-ramesh", "medicine": "Paracetamol 500mg", "status": "DISPATCHED", "date": "2023-10-02"}
]

DEMO_FOLLOW_UPS = [
    {"id": "fu-001", "member_id": "member-ramesh", "reason": "Post-fever review", "date": "2023-10-15", "status": "UPCOMING"},
    {"id": "fu-002", "member_id": "member-sita", "reason": "Routine Checkup", "date": "2023-10-20", "status": "UPCOMING"}
]

def get_member(member_id: str) -> Dict[str, Any]:
    return DEMO_MEMBERS.get(member_id, {"name": "Unknown Patient", "age": 0})
