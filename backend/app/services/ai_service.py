import os
from typing import Dict, Any
from app.schemas.ai import SymptomCheckRequest, SymptomCheckResponse, UrgencyLevel

# Deterministic safety keywords to force EMERGENCY routing
RED_FLAG_KEYWORDS = [
    "difficulty breathing", "chest pain", "unconscious", 
    "bleeding heavily", "seizure", "stroke", "heart attack",
    "cannot breathe", "fainting", "severe weakness"
]

def check_deterministic_red_flags(text: str) -> list[str]:
    flags = []
    text_lower = text.lower()
    for kw in RED_FLAG_KEYWORDS:
        if kw in text_lower:
            flags.append(f"Potential sign of {kw}")
    return flags

def get_fallback_response(request: SymptomCheckRequest, is_emergency: bool, flags: list[str]) -> SymptomCheckResponse:
    """Returns a safe, deterministic fallback response when AI is unavailable or fails."""
    
    # Simple localization for demo purposes
    lang = request.language
    
    if is_emergency:
        return SymptomCheckResponse(
            urgency=UrgencyLevel.EMERGENCY,
            summary="Emergency indicators detected in your symptoms.",
            possible_concerns=["Potentially life-threatening condition requiring immediate care."],
            recommended_action="Seek urgent emergency medical care now.",
            red_flags=flags,
            when_to_seek_help="Immediately.",
            disclaimer="Using safe fallback guidance. This is not a diagnosis."
        )
        
    # Default MODERATE response
    return SymptomCheckResponse(
        urgency=UrgencyLevel.MODERATE,
        summary="Your symptoms should be reviewed by a healthcare professional if they persist or worsen.",
        possible_concerns=["General illness requiring monitoring"],
        recommended_action="Consider contacting an ASHA worker or booking a doctor consultation.",
        red_flags=[],
        when_to_seek_help="Seek urgent care if severe or rapidly worsening symptoms develop (like difficulty breathing, severe pain).",
        disclaimer="Using safe fallback guidance. This is not a diagnosis."
    )

async def process_symptom_check(request: SymptomCheckRequest) -> SymptomCheckResponse:
    """
    Core AI logic abstraction. 
    Checks red flags first, then attempts LLM call, falls back if needed.
    """
    
    # 1. Deterministic safety check
    red_flags = check_deterministic_red_flags(request.symptoms)
    if red_flags:
        # Fast-track emergency
        return get_fallback_response(request, is_emergency=True, flags=red_flags)
        
    # 2. Try LLM Call (Mocked for hackathon without actual API keys)
    api_key = os.getenv("AI_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        # Safe fallback if no API key is provided
        return get_fallback_response(request, is_emergency=False, flags=[])
        
    # [Placeholder for actual LLM implementation with instructor/pydantic]
    # For now, always return the safe fallback since we are prioritizing reliability.
    return get_fallback_response(request, is_emergency=False, flags=[])

from app.schemas.ai import ReportAnalysisRequest, ReportAnalysisResponse, ReportFinding, ComparisonInsight

async def analyze_report(request: ReportAnalysisRequest) -> ReportAnalysisResponse:
    """
    Simulates AI analyzing a medical report and providing 'What Changed' insights.
    Uses deterministic synthetic fallbacks for the hackathon demo.
    """
    
    findings = [
        ReportFinding(
            parameter="Hemoglobin",
            value="11.2 g/dL",
            status="LOW",
            explanation="Slightly lower than the normal range. May cause fatigue or weakness."
        ),
        ReportFinding(
            parameter="WBC Count",
            value="7,500 /mcL",
            status="NORMAL",
            explanation="White blood cell count is within the healthy range, indicating no major active infection."
        ),
        ReportFinding(
            parameter="Platelets",
            value="210,000 /mcL",
            status="NORMAL",
            explanation="Platelet count is normal, meaning your blood can clot properly."
        )
    ]
    
    comparison = None
    if request.include_comparison:
        comparison = [
            ComparisonInsight(
                parameter="Hemoglobin",
                previous_value="10.5 g/dL",
                current_value="11.2 g/dL",
                trend="IMPROVED",
                explanation="Your hemoglobin levels have improved since your last test, showing a positive response to treatment or diet."
            ),
            ComparisonInsight(
                parameter="WBC Count",
                previous_value="12,000 /mcL",
                current_value="7,500 /mcL",
                trend="IMPROVED",
                explanation="Your white blood cell count has returned to normal, indicating the previous infection has resolved."
            )
        ]
        
    return ReportAnalysisResponse(
        report_name="Complete Blood Count (CBC)",
        summary="Your overall blood profile looks stable. Hemoglobin is slightly low but has improved compared to your last test. The infection markers have cleared.",
        findings=findings,
        comparison=comparison,
        recommended_action="Continue taking your prescribed iron supplements. Follow up with your doctor as scheduled.",
        disclaimer="AI interpretation is for informational purposes only. Always consult a doctor for a definitive diagnosis."
    )

from app.schemas.ai import RiskIndicatorRequest, RiskIndicatorResponse, RiskIndicatorOutput

def calculate_risk_indicators(request: RiskIndicatorRequest) -> RiskIndicatorResponse:
    """
    Deterministic/rule-based baseline risk engine for ASHA workers.
    """
    indicators = []
    overall_priority = "LOW"
    
    data = request.visit_data
    
    # 1. Emergency Checks
    is_emergency = data.get("severe_breathing_difficulty") or data.get("unconsciousness") or data.get("severe_chest_pain")
    if is_emergency:
        indicators.append(
            RiskIndicatorOutput(
                title="Emergency symptoms reported",
                priority="EMERGENCY",
                reason="Red-flag emergency symptoms were recorded during the visit.",
                evidence=["Patient is experiencing severe symptoms that require immediate attention."],
                suggested_action="Seek immediate professional/emergency assistance."
            )
        )
        overall_priority = "EMERGENCY"
    
    # 2. Pregnancy Checks
    if data.get("is_pregnant"):
        if data.get("missed_anc") or data.get("pregnancy_warning_signs"):
            indicators.append(
                RiskIndicatorOutput(
                    title="Pregnancy follow-up requires attention",
                    priority="HIGH",
                    reason="High-risk pregnancy flag combined with a missed scheduled follow-up or warning signs.",
                    evidence=["Pregnancy status: Active", "Missed ANC or warning signs present"],
                    suggested_action="Arrange timely professional review."
                )
            )
            if overall_priority not in ["EMERGENCY"]:
                overall_priority = "HIGH"

    # 3. Respiratory Checks
    if data.get("breathing_difficulty") or (data.get("fever") and data.get("cough")):
        indicators.append(
            RiskIndicatorOutput(
                title="Respiratory symptoms require attention",
                priority="MODERATE" if not data.get("breathing_difficulty") else "HIGH",
                reason="Breathing difficulty or persistent fever/cough reported.",
                evidence=["Fever", "Cough", "Breathing issues"],
                suggested_action="Escalate according to local clinical protocol."
            )
        )
        if overall_priority not in ["EMERGENCY", "HIGH"]:
            overall_priority = "MODERATE"
            
    # 4. Chronic Checks
    if data.get("high_bp") or data.get("missed_medication"):
        indicators.append(
            RiskIndicatorOutput(
                title="Chronic-condition monitoring requires attention",
                priority="MODERATE",
                reason="Recent measurements or follow-up information indicate that additional review may be appropriate.",
                evidence=["Abnormal BP/glucose or missed medication"],
                suggested_action="Schedule follow-up or consult doctor for medication review."
            )
        )
        if overall_priority not in ["EMERGENCY", "HIGH"]:
            overall_priority = "MODERATE"
            
    if not indicators:
        overall_priority = "LOW"
        
    return RiskIndicatorResponse(
        overall_priority=overall_priority,
        indicators=indicators,
        questions_for_professional=["Are there any modifications to the current care plan?"] if indicators else [],
        disclaimer="This is general AI guidance and not a medical diagnosis."
    )


