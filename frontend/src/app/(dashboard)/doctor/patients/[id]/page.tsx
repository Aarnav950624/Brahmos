"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Activity, FileText, Pill, Calendar, User, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEMO_PATIENTS: Record<string, any> = {
  "mem-002": {
    name: "Asha Devi",
    age: 29,
    gender: "Female",
    village: "Navjeevan Gram",
    referralId: "ref-101",
    referralSource: "ASHA Worker",
    referralReason: "Pregnancy follow-up requires attention",
    referralPriority: "HIGH",
    riskIndicators: [
      {
        title: "Pregnancy follow-up requires attention",
        priority: "HIGH",
        reason: "High-risk pregnancy flag combined with a missed scheduled follow-up and warning signs recorded during ASHA visit.",
        evidence: ["Pregnancy status: Active", "Missed ANC follow-up", "Warning sign recorded"],
        suggested_action: "Arrange timely professional review.",
      },
    ],
    recentVisit: {
      date: "12 Sep 2026",
      ashaWorker: "Priya Singh",
      observations: ["Pregnancy warning signs present", "Missed last ANC checkup", "No fever, no cough"],
    },
    reports: [
      { name: "Hemoglobin", value: "9.8 g/dL", status: "LOW", date: "10 Sep 2026" },
      { name: "Blood Pressure", value: "130/85 mmHg", status: "BORDERLINE", date: "10 Sep 2026" },
    ],
    medications: ["Iron + Folic Acid supplements", "Calcium tablets"],
    previousConsultations: [
      { date: "2 Aug 2026", doctor: "Dr. Meera Joshi", notes: "ANC check done, follow-up in 6 weeks advised." },
    ],
    followUps: [{ date: "20 Sep 2026", reason: "ANC follow-up", status: "OVERDUE" }],
  },
  "mem-001": {
    name: "Ramesh Patel",
    age: 42,
    gender: "Male",
    village: "Navjeevan Gram",
    referralId: "ref-102",
    referralSource: "Citizen App",
    referralReason: "Follow-up regarding recent health report",
    referralPriority: "MODERATE",
    riskIndicators: [
      {
        title: "Chronic-condition monitoring requires attention",
        priority: "MODERATE",
        reason: "Repeated borderline BP values and missed medication noted.",
        evidence: ["BP: 138/90 mmHg", "Missed medication this week"],
        suggested_action: "Schedule follow-up or consult doctor for medication review.",
      },
    ],
    recentVisit: {
      date: "15 Sep 2026",
      ashaWorker: "Priya Singh",
      observations: ["Mild hypertension symptoms", "Missed 2 doses of medication this week"],
    },
    reports: [
      { name: "Blood Glucose (Fasting)", value: "118 mg/dL", status: "BORDERLINE", date: "5 Sep 2026" },
      { name: "Blood Pressure", value: "138/90 mmHg", status: "HIGH", date: "5 Sep 2026" },
      { name: "Lipid Profile (LDL)", value: "142 mg/dL", status: "HIGH", date: "5 Sep 2026" },
    ],
    medications: ["Amlodipine 5mg", "Aspirin 75mg"],
    previousConsultations: [
      { date: "1 Sep 2026", doctor: "Dr. Arvind Sharma", notes: "BP managed. Repeat test in 1 month." },
    ],
    followUps: [{ date: "5 Oct 2026", reason: "BP and lipid follow-up", status: "PENDING" }],
  },
};

function priorityColor(p: string) {
  if (p === "HIGH" || p === "EMERGENCY") return "bg-red-100 text-red-700 border-red-200";
  if (p === "MODERATE") return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function reportStatusColor(s: string) {
  if (s === "HIGH") return "text-red-600 bg-red-50";
  if (s === "LOW") return "text-orange-600 bg-orange-50";
  if (s === "BORDERLINE") return "text-amber-700 bg-amber-50";
  return "text-emerald-700 bg-emerald-50";
}

export default function PatientDetail({ params }: { params: { id: string } }) {
  const patient = DEMO_PATIENTS[params.id];
  const [referralStatus, setReferralStatus] = useState("WAITING");

  if (!patient) {
    return (
      <div className="max-w-3xl mx-auto pt-20 text-center">
        <p className="text-slate-500">Patient record not found.</p>
        <Link href="/doctor/patients"><Button variant="outline" className="mt-4">Back to Patients</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/doctor/patients">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
            <Badge className={`uppercase text-xs ${priorityColor(patient.referralPriority)}`}>
              {patient.referralPriority} Priority
            </Badge>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">Synthetic Demo</Badge>
          </div>
          <p className="text-slate-500">{patient.age} years • {patient.gender} • {patient.village}</p>
        </div>
      </div>

      {/* Review Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-blue-900 text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> Review Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900">
          <p><span className="font-semibold">Why here:</span> {patient.referralReason}</p>
          <p><span className="font-semibold">Source:</span> {patient.referralSource}</p>
          <p><span className="font-semibold">Recent concern:</span> {patient.riskIndicators[0]?.reason}</p>
          <p><span className="font-semibold">Reports available:</span> {patient.reports.length} recent lab results</p>
          <p><span className="font-semibold">Previous consultations:</span> {patient.previousConsultations.length}</p>
          <p className="text-xs text-blue-700 italic mt-2">AI-generated summary — verify against the patient record.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Indicators */}
        <Card className="border-red-200 bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" /> AI Risk Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient.riskIndicators.map((ind: any, i: number) => (
              <div key={i} className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-red-800">{ind.title}</h4>
                  <Badge className={`uppercase text-[10px] shrink-0 ${priorityColor(ind.priority)}`}>{ind.priority}</Badge>
                </div>
                <p className="text-sm text-slate-700 mb-2">{ind.reason}</p>
                <ul className="list-disc list-inside space-y-1 mb-3">
                  {ind.evidence.map((e: string, j: number) => (
                    <li key={j} className="text-xs text-slate-600">{e}</li>
                  ))}
                </ul>
                <p className="text-sm font-semibold text-slate-800">Action: {ind.suggested_action}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent ASHA Visit */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" /> Recent ASHA Visit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-3">Date: {patient.recentVisit.date} • ASHA: {patient.recentVisit.ashaWorker}</p>
            <ul className="space-y-2">
              {patient.recentVisit.observations.map((obs: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  {obs}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Lab Reports */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" /> Lab Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patient.reports.map((report: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{report.name}</p>
                  <p className="text-xs text-slate-500">{report.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900">{report.value}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${reportStatusColor(report.status)}`}>{report.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Current Medications */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-500" /> Current Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {patient.medications.map((med: string, i: number) => (
                <li key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <Pill className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-sm font-medium text-slate-800">{med}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Previous Consultations */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5 text-slate-500" /> Previous Consultations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patient.previousConsultations.map((cons: any, i: number) => (
              <div key={i} className="p-3 border border-slate-100 rounded-lg bg-slate-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900">{cons.doctor}</span>
                  <span className="text-xs text-slate-500">{cons.date}</span>
                </div>
                <p className="text-sm text-slate-600">{cons.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Follow-ups */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" /> Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patient.followUps.map((fu: any, i: number) => (
              <div key={i} className="p-3 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{fu.reason}</p>
                  <p className="text-xs text-slate-500">{fu.date}</p>
                </div>
                <Badge className={`uppercase text-xs ${fu.status === "OVERDUE" ? "bg-red-100 text-red-700 border-red-200" : fu.status === "PENDING" ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
                  {fu.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
        <Link href={`/doctor/consultations/${params.id}`}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
            Start Consultation
          </Button>
        </Link>
        <Button variant="outline" className="border-slate-200 text-slate-700">
          Schedule Follow-up
        </Button>
      </div>
    </div>
  );
}
