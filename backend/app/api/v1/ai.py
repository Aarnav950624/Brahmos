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

from app.schemas.ai import ReportAnalysisRequest, ReportAnalysisResponse
from app.services.ai_service import analyze_report

@router.post("/report-analysis", response_model=ReportAnalysisResponse)
async def get_report_analysis(request: ReportAnalysisRequest):
    try:
        response = await analyze_report(request)
        return response
    except Exception as e:
        print(f"Error in report_analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze report")

from app.schemas.ai import RiskIndicatorRequest, RiskIndicatorResponse
from app.services.ai_service import calculate_risk_indicators

@router.post("/risk-indicators", response_model=RiskIndicatorResponse)
async def get_risk_indicators(request: RiskIndicatorRequest):
    try:
        response = calculate_risk_indicators(request)
        return response
    except Exception as e:
        print(f"Error in risk indicators: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate risk indicators")


