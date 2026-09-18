from fastapi import APIRouter, HTTPException
from app.schemas.asha_sync import SyncRequest, SyncResponse, SyncResult

router = APIRouter()

@router.post("/sync", response_model=SyncResponse)
async def sync_offline_data(request: SyncRequest):
    # Verify RBAC implicitly by checking if it's an ASHA worker ID
    # In a real app we'd use JWT dependency.
    if not request.user_id.startswith("asha"):
        raise HTTPException(status_code=403, detail="Only ASHA workers can use the offline sync endpoint.")

    results = []
    for item in request.items:
        # Mock successful sync for hackathon
        results.append(SyncResult(
            client_id=item.client_id,
            status="SYNCED",
            server_id=f"server-{item.client_id}"
        ))
        
    return SyncResponse(results=results)
