from fastapi import APIRouter
from app.schemas.panchayat import HealthPulseResponse

router = APIRouter()

@router.get("/health-pulse", response_model=HealthPulseResponse)
async def get_health_pulse(time_range: int = 30):
    # Deterministic Synthetic Aggregated Data for Navjeevan Gram
    
    return {
        "village": "Navjeevan Gram",
        "kpis": [
            {"label": "Households Covered", "value": "124"},
            {"label": "Vaccination Coverage", "value": "86%"},
            {"label": "High-Risk Follow-Ups", "value": "8"},
            {"label": "Recent Consultations", "value": "47"},
            {"label": "Pending Actions", "value": "11"},
            {"label": "Welfare Opportunities", "value": "19"}
        ],
        "trends": [
            {"date": "Day 1", "fever": 5, "respiratory": 2, "chronic": 8, "maternal": 3},
            {"date": "Day 7", "fever": 8, "respiratory": 4, "chronic": 9, "maternal": 4},
            {"date": "Day 14", "fever": 12, "respiratory": 7, "chronic": 8, "maternal": 3},
            {"date": "Day 21", "fever": 7, "respiratory": 5, "chronic": 10, "maternal": 5},
            {"date": "Day 30", "fever": 4, "respiratory": 3, "chronic": 9, "maternal": 4},
        ],
        "vaccination": {
            "overall_coverage": "86%",
            "pending_follow_ups": 14,
            "completed": 112,
            "breakdown": {
                "BCG": 98,
                "Polio": 95,
                "DPT": 88,
                "MMR": 82
            }
        },
        "maternal_child": {
            "anc_coverage": "91%",
            "high_risk_pregnancies": 5,
            "institutional_delivery": "94%",
            "growth_monitoring": "88%",
            "child_pending_follow_ups": 7
        },
        "care_access": {
            "phc_visits": 32,
            "teleconsultations": 15,
            "diagnostic_requests": 18,
            "medicine_fulfillment": 26,
            "emergency_referrals": 2
        },
        "welfare": {
            "matching_households": 19,
            "opportunities": 24,
            "saved": 11,
            "completed": 8
        },
        "insights": [
            {
                "observation": "Child vaccination follow-up activity is lower than the village target in the current demo period.",
                "evidence": "86% aggregated vaccination coverage in the synthetic dataset.",
                "suggested_action": "ASHA workers could prioritize outreach to households with pending vaccination follow-ups."
            },
            {
                "observation": "Reported fever-related health concerns showed a mid-month spike.",
                "evidence": "Fever consults rose from 5 to 12 before declining to 4.",
                "suggested_action": "Monitor ongoing seasonal flu indicators in the next 7 days."
            },
            {
                "observation": "High utilization of teleconsultation services.",
                "evidence": "15 teleconsultations recorded vs 32 physical PHC visits.",
                "suggested_action": "Ensure local pharmacy inventory can support increased e-prescriptions."
            }
        ],
        "priorities": [
            {
                "category": "Vaccination Outreach",
                "priority": "HIGH",
                "reason": "Pending follow-up activity detected.",
                "evidence": "14 pending child vaccination follow-ups.",
                "suggested_action": "Coordinate ASHA outreach.",
                "responsible_role": "ASHA"
            },
            {
                "category": "Welfare Awareness",
                "priority": "MODERATE",
                "reason": "Multiple synthetic households show potential scheme relevance.",
                "evidence": "19 households may benefit from welfare awareness.",
                "suggested_action": "Conduct village awareness session.",
                "responsible_role": "Panchayat / ASHA"
            },
            {
                "category": "High-Risk Pregnancy",
                "priority": "HIGH",
                "reason": "Active high-risk monitoring required.",
                "evidence": "5 high-risk pregnancies pending review.",
                "suggested_action": "Schedule immediate doctor teleconsultation.",
                "responsible_role": "ASHA / Doctor"
            }
        ]
    }
