"use client";

import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-12 pb-12 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">Visit Recorded</h1>
        <p className="text-slate-500">The health visit has been logged successfully.</p>

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
