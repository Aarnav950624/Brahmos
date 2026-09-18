from fastapi import APIRouter, Depends

from app.api.deps import get_visit_brief_service
from app.schemas.visit_brief import VisitBriefRequest, VisitBriefResponse
from app.services.visit_brief_service import VisitBriefService

router = APIRouter(tags=["ai-visit-brief"])


@router.post("/visit-brief", response_model=VisitBriefResponse)
async def generate_visit_brief(
    body: VisitBriefRequest,
    service: VisitBriefService = Depends(get_visit_brief_service),
) -> VisitBriefResponse:
    """Longitudinal clinician visit brief — assistive summary only."""
    return await service.generate(body)
