import os

dashboard_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/app/(dashboard)/citizen/page.tsx'

with open(dashboard_path, 'r', encoding='utf-8') as f:
    content = f.read()

if '/citizen/caregiver' not in content:
    quick_action_target = '{ label: t("dashboard.healthRecords"), icon: Heart, color: "bg-pink-100 text-pink-700", href: "/citizen/health-wallet" },'
    quick_action_replacement = '{ label: t("dashboard.healthRecords"), icon: Heart, color: "bg-pink-100 text-pink-700", href: "/citizen/health-wallet" },\n            { label: "Caregiver Mode", icon: Users, color: "bg-rose-100 text-rose-700", href: "/citizen/caregiver" },'
    content = content.replace(quick_action_target, quick_action_replacement)
    
    if 'Users' not in content:
        content = content.replace('import { Activity, Heart, Shield, Stethoscope, Pill, MapPin, Search, Bell, ArrowRight, ClipboardList } from "lucide-react";', 'import { Activity, Heart, Shield, Stethoscope, Pill, MapPin, Search, Bell, ArrowRight, ClipboardList, Users } from "lucide-react";')

    with open(dashboard_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated Citizen Dashboard for Caregiver Mode")
