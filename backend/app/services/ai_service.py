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
