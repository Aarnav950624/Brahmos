import os
import re

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

base = "c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src"

# --- TOPBAR ---
topbar_path = f"{base}/components/layout/TopBar.tsx"
with open(topbar_path, 'r', encoding='utf-8') as f:
    topbar = f.read()

imports = """import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/stores/languageStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Globe } from "lucide-react";"""

topbar = topbar.replace('import { useEffect, useState } from "react";\nimport Link from "next/link";', imports)

hook_target = """  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);"""

hook_replacement = """  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();"""

topbar = topbar.replace(hook_target, hook_replacement)

search_target = """          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
          />"""

search_replacement = """          <input
            type="text"
            placeholder={t("common.searchPlaceholder")}
            className="h-9 w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
          />"""
topbar = topbar.replace(search_target, search_replacement)

demo_mode_target = """        <div className="hidden sm:flex items-center gap-2 text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
          Demo Mode
        </div>"""
demo_mode_replacement = """        <div className="hidden sm:flex items-center gap-2 text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
          {t("common.demoMode")}
        </div>
        
        {/* Language Switcher */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-md p-1 bg-slate-50">
          <Globe className="h-4 w-4 text-slate-500 ml-1" />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-transparent text-xs font-medium text-slate-700 border-none outline-none focus:ring-0 cursor-pointer"
            aria-label="Select Language"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="gu">ગુજરાતી</option>
          </select>
        </div>
"""
topbar = topbar.replace(demo_mode_target, demo_mode_replacement)
write_file(topbar_path, topbar)
print("Updated TopBar")

# --- SIDEBAR ---
sidebar_path = f"{base}/components/layout/Sidebar.tsx"
with open(sidebar_path, 'r', encoding='utf-8') as f:
    sidebar = f.read()

sidebar = sidebar.replace('"use client";', '"use client";\nimport { useTranslation } from "@/lib/i18n/useTranslation";')
sidebar = sidebar.replace('const user = useAuthStore((state) => state.user);', 'const user = useAuthStore((state) => state.user);\n  const { t } = useTranslation();')

# Replace label strings with t("navigation.xxx")
label_replacements = {
    '"Dashboard"': 't("navigation.home")',
    '"Symptom Checker"': 't("navigation.symptomChecker")',
    '"Health Wallet"': 't("navigation.healthWallet")',
    '"Govt Schemes"': 't("navigation.schemes")',
    '"CareMap"': 't("navigation.careMap")',
    '"Requests"': 't("navigation.requests")',
    '"Households"': '"Households"',
    '"Doctor Portal"': '"Doctor Portal"',
    '"Appointments"': 't("navigation.appointments")',
    '"Patients"': 't("navigation.patients")',
    '"Queue"': 't("navigation.queue")',
    '"Consultations"': 't("navigation.consultations")',
    '"Inventory"': 't("navigation.inventory")',
    '"Lab Requests"': '"Lab Requests"',
    '"Village Pulse"': 't("navigation.villageHealthPulse")',
    '"Notifications"': 't("navigation.notifications")'
}

for old, new in label_replacements.items():
    sidebar = sidebar.replace(f'label: {old}', f'label: {new}')

write_file(sidebar_path, sidebar)
print("Updated Sidebar")

# --- CITIZEN DASHBOARD ---
dashboard_path = f"{base}/app/(dashboard)/citizen/page.tsx"
with open(dashboard_path, 'r', encoding='utf-8') as f:
    dashboard = f.read()

dashboard = dashboard.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { useTranslation } from "@/lib/i18n/useTranslation";\nimport { ListenButton } from "@/components/ui/listen-button";')

hook_d_target = """  const user = useAuthStore((state) => state.user);
  const [nudges, setNudges] = useState<any[]>([]);"""
hook_d_replacement = """  const user = useAuthStore((state) => state.user);
  const [nudges, setNudges] = useState<any[]>([]);
  const { t } = useTranslation();"""
dashboard = dashboard.replace(hook_d_target, hook_d_replacement)

dashboard = dashboard.replace('Welcome back,', '{t("dashboard.welcome")},')
dashboard = dashboard.replace('ArogyaAI Updates', '{t("dashboard.updates")}')
dashboard = dashboard.replace('Quick Actions', '{t("dashboard.quickActions")}')
dashboard = dashboard.replace('Check Symptoms', '{t("dashboard.checkSymptoms")}')
dashboard = dashboard.replace('Health Records', '{t("dashboard.healthRecords")}')
dashboard = dashboard.replace('Nearby Care', '{t("dashboard.nearbyCare")}')
dashboard = dashboard.replace('Welfare Schemes', '{t("dashboard.welfareSchemes")}')

write_file(dashboard_path, dashboard)
print("Updated Citizen Dashboard")

# --- SYMPTOM CHECKER ---
symptom_path = f"{base}/app/(dashboard)/citizen/symptom-checker/page.tsx"
with open(symptom_path, 'r', encoding='utf-8') as f:
    symptom = f.read()

symptom = symptom.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";\nimport { useTranslation } from "@/lib/i18n/useTranslation";\nimport { ListenButton } from "@/components/ui/listen-button";')
symptom = symptom.replace('export default function SymptomChecker() {', 'export default function SymptomChecker() {\n  const { t, language } = useTranslation();')

# Link lang to voice rec
symptom = symptom.replace('recognition.lang = "en-IN";', """    switch (language) {
      case "hi": recognition.lang = "hi-IN"; break;
      case "gu": recognition.lang = "gu-IN"; break;
      default: recognition.lang = "en-IN"; break;
    }""")

symptom = symptom.replace('>How are you feeling?<', '>{t("symptomChecker.title")}<')
symptom = symptom.replace('>Describe your symptoms or use the microphone.<', '>{t("symptomChecker.subtitle")}<')
symptom = symptom.replace('placeholder="e.g., I have had a headache for two days..."', 'placeholder={t("symptomChecker.placeholder")}')
symptom = symptom.replace('>Listening...<', '>{t("symptomChecker.listening")}<')
symptom = symptom.replace('>Emergency Warning Signs Detected<', '>{t("symptomChecker.redFlagTitle")}<')
symptom = symptom.replace('>Please seek immediate medical attention or go to the nearest emergency facility.<', '>{t("symptomChecker.redFlagDesc")}<')
symptom = symptom.replace('>Emergency SOS Workflow<', '>{t("symptomChecker.sosButton")}<')

# Add listen button to AI response
ai_resp_target = """            <h3 className="font-bold text-slate-800 text-lg mb-2">AI Guidance</h3>"""
ai_resp_replacement = """            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800 text-lg">AI Guidance</h3>
              <ListenButton text={result.guidance} />
            </div>"""
symptom = symptom.replace(ai_resp_target, ai_resp_replacement)

write_file(symptom_path, symptom)
print("Updated Symptom Checker")
