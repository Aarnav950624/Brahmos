from fastapi import APIRouter, Depends

from app.api.deps import get_medicine_extract_service
from app.schemas.medicine_extract import (
    MedicineExtractRequest,
    MedicineExtractResponse,
)
from app.services.medicine_extract_service import MedicineExtractService

router = APIRouter(tags=["ai-medicine-extract"])


@router.post("/medicine/extract", response_model=MedicineExtractResponse)
async def extract_medicine_from_image(
    body: MedicineExtractRequest,
    service: MedicineExtractService = Depends(get_medicine_extract_service),
) -> MedicineExtractResponse:
    """Identify medicine packaging text from a temporary photo. Not clinical advice."""
    return await service.extract(body)
