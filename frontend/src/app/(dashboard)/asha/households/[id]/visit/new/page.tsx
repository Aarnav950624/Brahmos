"use client";

import { useState, useEffect } from "react";
import { useSyncStore } from "@/stores/syncStore";
import { WifiOff, Database } from "lucide-react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddVisit({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [riskData, setRiskData] = useState<any>(null);

  const [formData, setFormData] = useState({
    fever: false,
    cough: false,
    breathing_difficulty: false,
    is_pregnant: false,
    missed_anc: false,
    pregnancy_warning_signs: false,
  });

  const handleToggle = (field: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const { isDemoOffline, addToQueue } = useSyncStore();
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
  };

  if (submitted) {
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
        )}

        {riskData && riskData.indicators && riskData.indicators.length > 0 && (
          <Card className="border-red-200 bg-red-50 text-left mt-8">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5" /> AI Risk Indicators Detected
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {riskData.indicators.map((ind: any, i: number) => (
                <div key={i} className="p-3 bg-white rounded-md border border-red-100">
                  <h4 className="font-bold text-red-700">{ind.title} ({ind.priority})</h4>
                  <p className="text-sm text-slate-700 mt-1">{ind.reason}</p>
                  <p className="text-sm font-semibold text-slate-900 mt-3">Action: {ind.suggested_action}</p>
                </div>
              ))}
              
              <Button className="w-full bg-red-600 hover:bg-red-700 mt-4">
                Escalate to Doctor
              </Button>
              
              {riskData.indicators.some((ind: any) => ind.priority === "EMERGENCY" || ind.priority === "HIGH") && (
                <div className="p-4 bg-red-600 rounded-lg shadow-md text-white space-y-3 mt-4">
                  <h3 className="font-bold flex items-center gap-2"><AlertCircle className="w-5 h-5"/> Emergency Guidance</h3>
                  <p className="text-sm">Seek immediate emergency medical assistance. Do not delay care.</p>
                  <Link href="/citizen/sos">
                    <Button variant="secondary" className="w-full text-red-700 font-bold bg-white hover:bg-red-50">
                      Open Emergency SOS
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="pt-8">
          <Link href={`/asha/households/${params.id}`}>
            <Button variant="outline" className="w-full">Return to Household</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/asha/households/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Log Health Visit</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General Observations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "fever", label: "Fever" },
              { id: "cough", label: "Persistent Cough" },
              { id: "breathing_difficulty", label: "Difficulty Breathing" },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggle(item.id as any)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  formData[item.id as keyof typeof formData] 
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold' 
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Maternal Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: "is_pregnant", label: "Currently Pregnant" },
              { id: "missed_anc", label: "Missed ANC Checkup" },
              { id: "pregnancy_warning_signs", label: "Warning Signs Present" },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggle(item.id as any)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  formData[item.id as keyof typeof formData] 
                    ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold' 
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
        >
          {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
          {loading ? "Analyzing Risk..." : "Save Visit"}
        </Button>
      </form>
    </div>
  );
}
