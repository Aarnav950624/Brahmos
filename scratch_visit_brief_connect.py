import os

dashboard_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/app/(dashboard)/citizen/page.tsx'
with open(dashboard_path, 'r', encoding='utf-8') as f:
    dashboard_content = f.read()

# Add the visit brief action
if '"/citizen/visit-brief"' not in dashboard_content:
    action_target = '{ label: "Ask ArogyaAI", icon: Search, color: "bg-blue-100 text-blue-700", href: "/citizen/ask-arogyaai" },'
    action_replacement = '{ label: "Ask ArogyaAI", icon: Search, color: "bg-blue-100 text-blue-700", href: "/citizen/ask-arogyaai" },\n            { label: "Visit Brief", icon: ClipboardList, color: "bg-cyan-100 text-cyan-700", href: "/citizen/visit-brief" },'
    
    dashboard_content = dashboard_content.replace(action_target, action_replacement)
    # import ClipboardList
    if 'ClipboardList' not in dashboard_content:
        dashboard_content = dashboard_content.replace('import { Heart, Activity, Pill, User, Search, MapPin, Shield, Calendar, Bot, PhoneCall, AlertTriangle, ShieldAlert } from "lucide-react";', 'import { Heart, Activity, Pill, User, Search, MapPin, Shield, Calendar, Bot, PhoneCall, AlertTriangle, ShieldAlert, ClipboardList } from "lucide-react";')
    
    with open(dashboard_path, 'w', encoding='utf-8') as f:
        f.write(dashboard_content)
    print("Updated Citizen Dashboard")

# Update doctor consultation to include link
doctor_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/app/(dashboard)/doctor/consultations/[id]/page.tsx'
if os.path.exists(doctor_path):
    with open(doctor_path, 'r', encoding='utf-8') as f:
        doctor_content = f.read()
    
    if 'Visit Brief' not in doctor_content:
        doc_target = '<div className="flex gap-2">'
        doc_replacement = '<div className="flex gap-2">\n          <Link href="/citizen/visit-brief" target="_blank">\n            <Button variant="outline" className="gap-2 bg-white text-cyan-700 border-cyan-200 hover:bg-cyan-50"><ClipboardList className="h-4 w-4" /> Patient Visit Brief</Button>\n          </Link>'
        doctor_content = doctor_content.replace(doc_target, doc_replacement)
        
        if 'ClipboardList' not in doctor_content:
            doctor_content = doctor_content.replace('import { Video, Phone, Mic, MicOff, VideoOff, FileText, Activity, AlertCircle, Save, Calendar, Clock, Download, Plus, Bot, Link2 } from "lucide-react";', 'import { Video, Phone, Mic, MicOff, VideoOff, FileText, Activity, AlertCircle, Save, Calendar, Clock, Download, Plus, Bot, Link2, ClipboardList } from "lucide-react";')
        
        with open(doctor_path, 'w', encoding='utf-8') as f:
            f.write(doctor_content)
        print("Updated Doctor Consultation")
