from pydantic import BaseModel
from typing import List

class KPI(BaseModel):
    label: str
    value: str

class TrendData(BaseModel):
    date: str
    fever: int
    respiratory: int
    chronic: int
    maternal: int

class VaccinationCoverage(BaseModel):
    overall_coverage: str
    pending_follow_ups: int
    completed: int
    breakdown: dict

class MaternalChildHealth(BaseModel):
    anc_coverage: str
    high_risk_pregnancies: int
    institutional_delivery: str
    growth_monitoring: str
    child_pending_follow_ups: int

class CareAccess(BaseModel):
    phc_visits: int
    teleconsultations: int
    diagnostic_requests: int
    medicine_fulfillment: int
    emergency_referrals: int

class WelfareAwareness(BaseModel):
    matching_households: int
    opportunities: int
    saved: int
    completed: int

class VillageInsight(BaseModel):
    observation: str
    evidence: str
    suggested_action: str

class ActionPriority(BaseModel):
    category: str
    priority: str
    reason: str
    evidence: str
    suggested_action: str
    responsible_role: str

class HealthPulseResponse(BaseModel):
    village: str
    kpis: List[KPI]
    trends: List[TrendData]
    vaccination: VaccinationCoverage
    maternal_child: MaternalChildHealth
    care_access: CareAccess
    welfare: WelfareAwareness
    insights: List[VillageInsight]
    priorities: List[ActionPriority]
