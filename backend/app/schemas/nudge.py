from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime
import uuid

class NudgeCategory(str, Enum):
    HEALTH = "HEALTH"
    FOLLOW_UP = "FOLLOW_UP"
    REQUESTS = "REQUESTS"
    SCHEMES = "SCHEMES"
    AWARENESS = "AWARENESS"

class NudgePriority(str, Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    IMPORTANT = "IMPORTANT"

class Notification(BaseModel):
    id: str
    user_id: str
    category: NudgeCategory
    title: str
    message: str
    priority: NudgePriority
    reason: str
    action_label: Optional[str] = None
    action_url: Optional[str] = None
    created_at: str
    read: bool = False
    source_type: str
    source_id: str

class NotificationGenerateRequest(BaseModel):
    user_id: str
    role: str
