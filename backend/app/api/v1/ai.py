from fastapi import APIRouter, HTTPException
from app.schemas.ai import SymptomCheckRequest, SymptomCheckResponse
from app.services.ai_service import process_symptom_check

router = APIRouter()

@router.post("/symptom-check", response_model=SymptomCheckResponse)
async def symptom_check(request: SymptomCheckRequest):
    try:
        response = await process_symptom_check(request)
        return response
    except Exception as e:
        # We should ideally have the service handle fallback, but as a last resort:
        print(f"Error in symptom_check: {e}")
        from app.services.ai_service import get_fallback_response
        return get_fallback_response(request, is_emergency=False, flags=[])
