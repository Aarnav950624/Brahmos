import os

schema_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/app/schemas/asha_sync.py'
os.makedirs(os.path.dirname(schema_path), exist_ok=True)
with open(schema_path, 'w', encoding='utf-8') as f:
    f.write('''from pydantic import BaseModel
from typing import List, Optional

class SyncItem(BaseModel):
    client_id: str
    entity_type: str
    operation: str
    payload: dict

class SyncRequest(BaseModel):
    user_id: str
    items: List[SyncItem]

class SyncResult(BaseModel):
    client_id: str
    status: str
    server_id: Optional[str] = None
    message: Optional[str] = None

class SyncResponse(BaseModel):
    results: List[SyncResult]
''')

api_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/app/api/v1/asha_sync.py'
with open(api_path, 'w', encoding='utf-8') as f:
    f.write('''from fastapi import APIRouter, HTTPException
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
''')

main_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/main.py'
with open(main_path, 'r', encoding='utf-8') as f:
    main_content = f.read()

if 'asha_sync' not in main_content:
    main_content = main_content.replace('from app.api.v1 import ai, wallet, asha, doctor, pharmacy, lab, citizen, scheme, caremap, emergency, nudge, panchayat, visit_brief', 'from app.api.v1 import ai, wallet, asha, doctor, pharmacy, lab, citizen, scheme, caremap, emergency, nudge, panchayat, visit_brief, asha_sync')
    main_content = main_content.replace('app.include_router(visit_brief.router, prefix="/api/v1/visit-brief", tags=["Visit Brief"])', 'app.include_router(visit_brief.router, prefix="/api/v1/visit-brief", tags=["Visit Brief"])\napp.include_router(asha_sync.router, prefix="/api/v1/asha", tags=["ASHA Sync"])')
    
    with open(main_path, 'w', encoding='utf-8') as f:
        f.write(main_content)

print("Created backend schema and API for ASHA Sync")
