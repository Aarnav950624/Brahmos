"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Video, Save, Plus, Trash2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const PATIENT_NAMES: Record<string, string> = {
  "mem-002": "Asha Devi",
  "mem-001": "Ramesh Patel",
};

const PATIENT_AGES: Record<string, number> = {
  "mem-002": 29,
  "mem-001": 42,
};

const PATIENT_REASONS: Record<string, string> = {
  "mem-002": "Pregnancy follow-up requires attention",
  "mem-001": "Follow-up regarding recent health report",
};

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function ConsultationWorkspace({ params }: { params: { id: string } }) {
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clinical notes
  const [chiefConcern, setChiefConcern] = useState("");
  const [observations, setObservations] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Prescription
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);

  // Follow-up
  const [followUpRequired, setFollowUpRequired] = useState(true);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");

  // Diagnostic Test
  const [testName, setTestName] = useState("");
  const [diagnosticNotes, setDiagnosticNotes] = useState("");

  const patientName = PATIENT_NAMES[params.id] ?? "Unknown Patient";
  const patientAge = PATIENT_AGES[params.id] ?? 0;
  const referralReason = PATIENT_REASONS[params.id] ?? "";

  useEffect(() => {
    intervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const addMedicine = () => setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
  const removeMedicine = (i: number) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMedicine = (i: number, field: keyof Medicine, val: string) => {
    setMedicines(medicines.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("http://localhost:8000/api/v1/doctor/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: params.id,
          referral_id: params.id === "mem-002" ? "ref-101" : "ref-102",
          chief_concern: chiefConcern,
          observations,
          assessment,
          plan,
          additional_notes: additionalNotes,
        }),
      });

      const filledMeds = medicines.filter(m => m.name.trim());
      if (filledMeds.length > 0) {
        await fetch("http://localhost:8000/api/v1/doctor/prescriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patient_id: params.id, consultation_id: "cons-demo", medicines: filledMeds }),
        });
      }

      if (followUpRequired) {
        await fetch("http://localhost:8000/api/v1/doctor/followups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patient_id: params.id, consultation_id: "cons-demo", follow_up_required: true, follow_up_date: followUpDate, reason: followUpReason }),
        });
      }

      if (testName.trim()) {
        await fetch("http://localhost:8000/api/v1/doctor/diagnostic-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_id: params.id,
            patient_name: patientName,
            doctor_name: "Dr. Smith",
            consultation_id: "cons-demo",
            test_name: testName,
            notes: diagnosticNotes
          }),
        });
      }
    } catch (e) {
      // Fallback: demo continues offline
    }
    setSaving(false);
    setSaved(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  if (saved) {
    return (
      <div className="max-w-2xl mx-auto pt-16 pb-12 text-center space-y-6">
        <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">Consultation Saved</h1>
        <p className="text-slate-500">Clinical notes, prescription, and follow-up have been recorded for <strong>{patientName}</strong>.</p>
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
          <p className="font-semibold mb-1">Referral Status Updated</p>
          <p>{followUpRequired ? "FOLLOW_UP — follow-up has been scheduled." : "COMPLETED — consultation marked as done."}</p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link href={`/doctor/patients/${params.id}`}>
            <Button variant="outline">Back to Patient</Button>
          </Link>
          <Link href="/doctor/queue">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Back to Queue</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/doctor/patients/${params.id}`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Consultation: {patientName}</h1>
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">Simulated Consultation</Badge>
            </div>
            <p className="text-slate-500 text-sm">{patientAge} years • Referral reason: {referralReason}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Clock className="h-4 w-4 text-emerald-600" />
          <span className="font-mono font-bold text-emerald-700">{formatTime(elapsed)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 bg-slate-900 text-white overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-800 to-slate-900">
                <Video className="h-14 w-14 text-slate-500" />
                <p className="text-slate-300 font-semibold text-lg">Demo Teleconsultation</p>
                <p className="text-slate-500 text-sm text-center px-6">
                  This is a simulated consultation interface for demo purposes.<br />No real video call is active.
                </p>
                <div className="flex gap-2 mt-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-slate-400">Session Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Notes */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Clinical Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="chief-concern">Chief Concern</label>
                <textarea
                  id="chief-concern"
                  value={chiefConcern}
                  onChange={e => setChiefConcern(e.target.value)}
                  placeholder="Patient's primary complaint..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="observations">Observations</label>
                <textarea
                  id="observations"
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  placeholder="Vital signs, physical exam findings..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="assessment">Assessment / Clinical Impression</label>
                <textarea
                  id="assessment"
                  value={assessment}
                  onChange={e => setAssessment(e.target.value)}
                  placeholder="Doctor's clinical impression (not a diagnosis)..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="plan">Plan</label>
                <textarea
                  id="plan"
                  value={plan}
                  onChange={e => setPlan(e.target.value)}
                  placeholder="Management plan, referrals, investigations..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="additional-notes">Additional Notes</label>
                <textarea
                  id="additional-notes"
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional information..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Prescription */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-slate-900">Prescription</CardTitle>
              <Button variant="outline" size="sm" onClick={addMedicine} className="gap-1">
                <Plus className="h-4 w-4" /> Add Medicine
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  Prescription entered by doctor. ArogyaAI does not independently prescribe medication.
                </p>
              </div>
              {medicines.map((med, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-slate-100 rounded-lg bg-slate-50">
                  <div className="col-span-2 md:col-span-3 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Medicine {i + 1}</span>
                    {medicines.length > 1 && (
                      <button onClick={() => removeMedicine(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">Medicine Name</label>
                    <Input value={med.name} onChange={e => updateMedicine(i, "name", e.target.value)} placeholder="e.g. Paracetamol" className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Dosage</label>
                    <Input value={med.dosage} onChange={e => updateMedicine(i, "dosage", e.target.value)} placeholder="e.g. 500mg" className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Frequency</label>
                    <Input value={med.frequency} onChange={e => updateMedicine(i, "frequency", e.target.value)} placeholder="e.g. Twice daily" className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Duration</label>
                    <Input value={med.duration} onChange={e => updateMedicine(i, "duration", e.target.value)} placeholder="e.g. 5 days" className="bg-white" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Instructions</label>
                    <Input value={med.instructions} onChange={e => updateMedicine(i, "instructions", e.target.value)} placeholder="e.g. Take after meals" className="bg-white" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Follow-up */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Follow-up</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700">Follow-up required?</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFollowUpRequired(true)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${followUpRequired ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFollowUpRequired(false)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${!followUpRequired ? "bg-slate-700 text-white border-slate-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    No
                  </button>
                </div>
              </div>
              {followUpRequired && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1" htmlFor="followup-date">Follow-up Date</label>
                    <Input id="followup-date" type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} className="bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1" htmlFor="followup-reason">Reason</label>
                    <Input id="followup-reason" value={followUpReason} onChange={e => setFollowUpReason(e.target.value)} placeholder="e.g. ANC review" className="bg-white" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diagnostic Request */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-900">Diagnostic Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1" htmlFor="test-name">Test Name</label>
                  <Input id="test-name" value={testName} onChange={e => setTestName(e.target.value)} placeholder="e.g. CBC, Lipid Profile" className="bg-white" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1" htmlFor="test-notes">Notes for Lab</label>
                  <Input id="test-notes" value={diagnosticNotes} onChange={e => setDiagnosticNotes(e.target.value)} placeholder="e.g. Fasting required" className="bg-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {saving ? "Saving Consultation..." : "Save Consultation"}
          </Button>
        </div>

        {/* Right sidebar: patient context */}
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-900 text-sm">Patient Context</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-900 space-y-2">
              <p className="font-bold text-base">{patientName}</p>
              <p className="text-blue-700">Referral: {referralReason}</p>
              <p className="text-xs text-blue-600 italic mt-2">AI-generated summary — verify against the patient record.</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-900 text-sm">Consultation Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "WAITING → IN_REVIEW", done: true },
                { label: "IN_REVIEW → IN_CONSULTATION", done: true },
                { label: "IN_CONSULTATION → COMPLETED", done: false },
              ].map((step, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded ${step.done ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"}`}>
                  <div className={`h-2 w-2 rounded-full ${step.done ? "bg-emerald-500" : "bg-slate-300"}`} />
                  {step.label}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
