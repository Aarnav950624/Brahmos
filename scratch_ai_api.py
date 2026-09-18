import os

path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/app/api/v1/ai.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure we import AskRequest and AskResponse and SourceContext
content = content.replace(
    'from app.schemas.ai import SymptomCheckRequest, SymptomCheckResponse, MedicalReportUpload, MedicalReportAnalysis, CompareReportRequest, CompareReportResponse',
    'from app.schemas.ai import SymptomCheckRequest, SymptomCheckResponse, MedicalReportUpload, MedicalReportAnalysis, CompareReportRequest, CompareReportResponse, AskRequest, AskResponse, SourceContext'
)

ask_endpoint = '''
@router.post("/ask", response_model=AskResponse)
async def ask_arogyaai(request: AskRequest):
    if request.role != "CITIZEN":
        raise HTTPException(status_code=403, detail="Ask ArogyaAI is available for citizens only.")
    
    question = request.question.lower()
    
    # Emergency Red Flags Check
    red_flags = ["blood", "chest pain", "unconscious", "breathing", "seizure", "stroke", "heart attack", "pain", "bleeding"]
    if any(flag in question for flag in red_flags):
        return AskResponse(
            answer="Based on your question, you might be experiencing a medical emergency.",
            key_points=["Seek immediate medical attention.", "Do not wait."],
            source_context=[SourceContext(source_type="SYSTEM", source_id="sys", label="General Safety Protocol")],
            suggested_action="Use Emergency SOS",
            action_label="Emergency SOS",
            action_url="/citizen/sos",
            safety_note="Seek urgent medical care.",
            disclaimer="ArogyaAI provides health information and summaries. It does not replace a doctor or emergency services."
        )

    # Deterministic RAG Mock
    if "follow-up" in question or "follow up" in question or "next visit" in question:
        return AskResponse(
            answer="You have a consultation follow-up scheduled for tomorrow.",
            key_points=["Date: Tomorrow", "Doctor: Dr. Sharma"],
            source_context=[SourceContext(source_type="FOLLOW_UP", source_id="cons-1", label="Based on your consultation record")],
            suggested_action="View your health wallet for details.",
            action_label="View Follow-up",
            action_url="/citizen/health-wallet",
            safety_note=None,
            disclaimer="ArogyaAI provides health information and summaries. It does not replace a doctor."
        )

    if "report" in question or "blood" in question:
        return AskResponse(
            answer="Your latest CBC report is ready and indicates a slightly low Hemoglobin level.",
            key_points=["Hemoglobin: 11.2 g/dL (Slightly Low)", "All other markers are within normal range."],
            source_context=[SourceContext(source_type="REPORT", source_id="req-lab-1", label="Based on your latest report")],
            suggested_action="You can view the detailed AI analysis.",
            action_label="View Report",
            action_url="/citizen/health-wallet",
            safety_note="Please consult your doctor for a formal interpretation.",
            disclaimer="ArogyaAI provides health information and summaries. It does not replace a doctor."
        )

    if "medicine" in question or "prescribed" in question or "prescription" in question:
        return AskResponse(
            answer="Your current prescription includes Paracetamol (500mg) and Amoxicillin (250mg).",
            key_points=["Paracetamol: As needed for fever.", "Amoxicillin: Twice daily after meals."],
            source_context=[SourceContext(source_type="PRESCRIPTION", source_id="rx-1", label="Based on your prescription record")],
            suggested_action="Track your medicine delivery status.",
            action_label="View Requests",
            action_url="/citizen/requests",
            safety_note="Do not stop or change dosage without consulting your doctor.",
            disclaimer="ArogyaAI provides health information and summaries. It does not replace a doctor."
        )
        
    if "notification" in question or "why am i seeing this" in question:
        return AskResponse(
            answer="You received a notification because your requested lab report has been processed and is ready for review.",
            key_points=["Trigger: Report status changed to REPORT_READY"],
            source_context=[SourceContext(source_type="NOTIFICATION", source_id="notif-1", label="Based on your notifications")],
            suggested_action="Check your latest notification.",
            action_label="View Notifications",
            action_url="/citizen/notifications",
            safety_note=None,
            disclaimer="ArogyaAI provides health information and summaries. It does not replace a doctor."
        )

    # General Fallback
    return AskResponse(
        answer="I am ArogyaAI, your health information assistant. I can help you understand your reports, check follow-up dates, or explain medical terms based on your synthetic health records.",
        key_points=[],
        source_context=[SourceContext(source_type="SYSTEM", source_id="sys", label="General health information")],
        suggested_action=None,
        action_label=None,
        action_url=None,
        safety_note=None,
        disclaimer="ArogyaAI provides health information and summaries. It does not replace a doctor."
    )
'''

content += ask_endpoint

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ai API")
