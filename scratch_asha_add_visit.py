import os

file_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/app/(dashboard)/asha/households/[id]/visit/new/page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to import useSyncStore, useEffect
if 'useSyncStore' not in content:
    content = content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";\nimport { useSyncStore } from "@/stores/syncStore";\nimport { WifiOff, Database } from "lucide-react";')

    target_submit = '''  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Analyze risk with deterministic backend engine
      const res = await fetch("http://localhost:8000/api/v1/ai/risk-indicators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: "mem-001",
          visit_data: formData
        })
      });
      
      const riskResponse = await res.json();
      setRiskData(riskResponse);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      // Fallback if backend is down
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };'''

    replacement_submit = '''  const { isDemoOffline, addToQueue } = useSyncStore();
  const [isOnline, setIsOnline] = useState(true);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const effectivelyOffline = !isOnline || isDemoOffline;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (effectivelyOffline) {
      // Offline mode logic
      addToQueue({
        entityType: "VISIT",
        operation: "CREATE_VISIT",
        payload: { member_id: "mem-001", visit_data: formData },
        householdName: "Assigned Household"
      });
      
      // Basic local risk simulation for demo
      const hasEmergency = formData.fever || formData.breathing_difficulty || formData.pregnancy_warning_signs;
      const localRisk = {
        priority: hasEmergency ? "HIGH" : "LOW",
        indicators: hasEmergency ? [
          { title: "Symptom Warning", description: "Symptoms recorded while offline indicate potential risk.", priority: "HIGH" }
        ] : []
      };
      
      setRiskData(localRisk);
      setIsOfflineSaved(true);
      setSubmitted(true);
      setLoading(false);
      return;
    }

    try {
      // Online mode logic
      const res = await fetch("http://localhost:8000/api/v1/ai/risk-indicators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: "mem-001",
          visit_data: formData
        })
      });
      
      const riskResponse = await res.json();
      setRiskData(riskResponse);
      setIsOfflineSaved(false);
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      // Fallback if backend is down - treat as offline
      addToQueue({
        entityType: "VISIT",
        operation: "CREATE_VISIT",
        payload: { member_id: "mem-001", visit_data: formData },
        householdName: "Assigned Household"
      });
      setIsOfflineSaved(true);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };'''

    content = content.replace(target_submit, replacement_submit)

    target_success = '''  if (submitted) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-12 pb-12 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">Visit Recorded</h1>
        <p className="text-slate-500">The health visit has been logged successfully.</p>'''

    replacement_success = '''  if (submitted) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-12 pb-12 text-center">
        {isOfflineSaved ? (
          <div className="bg-amber-50 p-6 rounded-full inline-block mb-2">
            <Database className="h-12 w-12 text-amber-500 mx-auto" />
          </div>
        ) : (
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
        )}
        
        <h1 className="text-2xl font-bold text-slate-900">
          {isOfflineSaved ? "Visit saved on this device" : "Visit Recorded"}
        </h1>
        
        {isOfflineSaved ? (
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
              Pending Sync
            </span>
            <p className="text-slate-500 max-w-sm mx-auto">This visit will sync automatically when the connection is restored.</p>
          </div>
        ) : (
          <p className="text-slate-500">The health visit has been logged successfully to the server.</p>
        )}'''

    content = content.replace(target_success, replacement_success)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated Add Visit Offline mode")
