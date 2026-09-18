from fastapi import APIRouter, HTTPException, Path
from app.schemas.wallet import HealthWalletResponse

router = APIRouter()

@router.get("/{user_id}", response_model=HealthWalletResponse)
async def get_health_wallet(user_id: str = Path(..., description="The ID of the family member")):
    """
    Retrieve the health wallet for a given family member.
    For this hackathon demo, this endpoint acts as a placeholder 
    that would normally query the PostgreSQL database.
    """
    # Throwing 501 Not Implemented because the frontend is using mock data
    # and this is just the backend architectural foundation for the future.
    raise HTTPException(
        status_code=501, 
        detail="Backend Health Wallet integration is prepared but currently uses frontend demo data."
    )
