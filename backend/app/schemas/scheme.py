from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class SchemeCategory(str, Enum):
    HEALTH = "HEALTH"
    MATERNAL_HEALTH = "MATERNAL_HEALTH"
    CHILD_HEALTH = "CHILD_HEALTH"
    NUTRITION = "NUTRITION"
    INSURANCE = "INSURANCE"
    EDUCATION = "EDUCATION"
    LIVELIHOOD = "LIVELIHOOD"
    SENIOR_CITIZEN = "SENIOR_CITIZEN"
    DISABILITY = "DISABILITY"
    SOCIAL_SUPPORT = "SOCIAL_SUPPORT"

class Scheme(BaseModel):
    id: str
    name: str
    category: SchemeCategory
    description: str
    target_audience: str
    eligibility_summary: str
    documents_required: List[str]
    application_guidance: str
    verification_note: str

class SchemeProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    pregnancy_status: Optional[bool] = None
    children_count: Optional[int] = None
    children_ages: Optional[List[int]] = None
    senior_citizen: Optional[bool] = None
    disability_status: Optional[bool] = None
    income_band: Optional[str] = None

class SchemeMatchRequest(BaseModel):
    profile: SchemeProfile

class SchemeMatchResult(BaseModel):
    scheme_id: str
    relevance: str = "POTENTIALLY_RELEVANT"
    reasons: List[str]
    missing_information: List[str]
    verification_note: str

class SchemeMatchResponse(BaseModel):
    matches: List[SchemeMatchResult]
    awareness_opportunities: List[str]

class SavedScheme(BaseModel):
    scheme_id: str
    saved_at: str
