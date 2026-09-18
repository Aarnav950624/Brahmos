from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from app.schemas.scheme import (
    Scheme, SchemeCategory, SchemeMatchRequest, SchemeMatchResponse, SchemeMatchResult, SavedScheme
)

router = APIRouter()

DEMO_SCHEMES: List[Scheme] = [
    Scheme(
        id="sch-101",
        name="Demo Jan Arogya Yojana",
        category=SchemeCategory.INSURANCE,
        description="Health insurance coverage for low-income families.",
        target_audience="Families below poverty line.",
        eligibility_summary="Household income below specified threshold, active ration card.",
        documents_required=["Aadhaar Card", "Ration Card", "Income Certificate"],
        application_guidance="Apply online at the state health portal or visit local CSC.",
        verification_note="Verify current income limits on official portal."
    ),
    Scheme(
        id="sch-102",
        name="Demo Matritva Vandana Yojana",
        category=SchemeCategory.MATERNAL_HEALTH,
        description="Financial assistance for pregnant and lactating mothers.",
        target_audience="First-time pregnant and lactating mothers.",
        eligibility_summary="Pregnant women, excluding regular employees of Govt.",
        documents_required=["Aadhaar Card", "MCP Card", "Bank Account Details"],
        application_guidance="Register with local Anganwadi/ASHA worker.",
        verification_note="Benefits are subject to official conditions."
    ),
    Scheme(
        id="sch-103",
        name="Demo Poshan Abhiyaan",
        category=SchemeCategory.CHILD_HEALTH,
        description="Nutritional support for children, pregnant women, and lactating mothers.",
        target_audience="Children under 6 years, pregnant women.",
        eligibility_summary="Enrolled at local Anganwadi center.",
        documents_required=["Aadhaar Card", "Birth Certificate of child"],
        application_guidance="Contact nearest Anganwadi worker.",
        verification_note="Confirm local availability with ASHA."
    ),
    Scheme(
        id="sch-104",
        name="Demo Vayoshri Yojana",
        category=SchemeCategory.SENIOR_CITIZEN,
        description="Physical aids and assisted-living devices for senior citizens.",
        target_audience="Senior citizens aged 60+ belonging to BPL category.",
        eligibility_summary="Age 60 or above, valid BPL documentation.",
        documents_required=["Aadhaar Card", "Age Proof", "BPL Certificate"],
        application_guidance="Apply through district welfare office.",
        verification_note="Check district-level camp schedules."
    )
]

user_saved_schemes = []

@router.get("/schemes", response_model=List[Scheme])
async def get_schemes():
    return DEMO_SCHEMES

@router.get("/schemes/{scheme_id}", response_model=Scheme)
async def get_scheme(scheme_id: str):
    for s in DEMO_SCHEMES:
        if s.id == scheme_id:
            return s
    raise HTTPException(status_code=404, detail="Scheme not found")

@router.post("/ai/scheme-match", response_model=SchemeMatchResponse)
async def match_schemes(request: SchemeMatchRequest):
    # Deterministic matching
    matches = []
    opportunities = []
    prof = request.profile
    
    if prof.pregnancy_status:
        matches.append(SchemeMatchResult(
            scheme_id="sch-102",
            reasons=["Household profile indicates pregnancy"],
            missing_information=[],
            verification_note="Verify eligibility through ASHA."
        ))
    else:
        opportunities.append("You may want to explore maternal health support programs if planning a family.")

    if prof.children_count and prof.children_count > 0:
        if prof.children_ages and any(age < 6 for age in prof.children_ages):
            matches.append(SchemeMatchResult(
                scheme_id="sch-103",
                reasons=["Household includes a child under 6 years"],
                missing_information=[],
                verification_note="Verify with Anganwadi."
            ))
    
    if prof.senior_citizen or (prof.age and prof.age >= 60):
        matches.append(SchemeMatchResult(
            scheme_id="sch-104",
            reasons=["Profile indicates senior citizen status (60+)"],
            missing_information=["Income details needed for final eligibility"],
            verification_note="Check BPL requirements."
        ))

    if not prof.income_band:
        opportunities.append("Add income band to discover relevant health insurance schemes.")
    elif prof.income_band == "BPL":
        matches.append(SchemeMatchResult(
            scheme_id="sch-101",
            reasons=["Profile indicates BPL income band"],
            missing_information=["Ration card verification"],
            verification_note="Verify current income limits."
        ))
        
    return SchemeMatchResponse(
        matches=matches,
        awareness_opportunities=opportunities
    )

@router.post("/citizen/schemes/save")
async def save_scheme(scheme_id: str):
    if scheme_id not in user_saved_schemes:
        user_saved_schemes.append(scheme_id)
    return {"status": "success"}

@router.get("/citizen/schemes/saved")
async def get_saved_schemes():
    return user_saved_schemes

@router.get("/asha/households/{id}/scheme-awareness")
async def asha_scheme_awareness(id: str):
    # Mock response based on ID
    if id == "hh-001":
        return {
            "potentially_relevant_categories": ["MATERNAL_HEALTH", "CHILD_HEALTH"],
            "notes": "Household has a pregnant woman and a young child."
        }
    return {
        "potentially_relevant_categories": ["INSURANCE"],
        "notes": "Information suggests potential eligibility for basic health coverage."
    }
