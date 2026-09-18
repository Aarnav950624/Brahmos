from pydantic import BaseModel
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
