import os

path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/app/schemas/ai.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

new_schemas = '''
class AskRequest(BaseModel):
    user_id: str
    role: str
    question: str
    language: str = "en"
    family_member_id: Optional[str] = None

class SourceContext(BaseModel):
    source_type: str
    source_id: str
    label: str

class AskResponse(BaseModel):
    answer: str
    key_points: List[str]
    source_context: List[SourceContext]
    suggested_action: Optional[str] = None
    action_label: Optional[str] = None
    action_url: Optional[str] = None
    safety_note: Optional[str] = None
    disclaimer: str
'''

if 'AskRequest' not in content:
    content += new_schemas
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated ai schemas")
