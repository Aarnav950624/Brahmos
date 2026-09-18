"use client";

import Link from "next/link";
import { Search, User, AlertCircle, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const DEMO_PATIENTS = [
  {
    id: "mem-002",
    name: "Asha Devi",
    age: 29,
    gender: "Female",
    village: "Navjeevan Gram",
    referralReason: "High-risk pregnancy — missed ANC follow-up",
    priority: "HIGH",
    waitingTime: "45m",
    source: "ASHA Worker Referral",
  },
  {
    id: "mem-001",
    name: "Ramesh Patel",
    age: 42,
    gender: "Male",
    village: "Navjeevan Gram",
    referralReason: "Follow-up regarding recent health report",
    priority: "MODERATE",
    waitingTime: "2h",
    source: "Citizen Request",
  },
];

export default function DoctorPatients() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Demo Data</Badge>
          </div>
          <p className="text-slate-500">View and manage your assigned patients.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search patients..." className="pl-9 bg-white" />
        </div>
      </div>

      <div className="space-y-4">
        {DEMO_PATIENTS.map((patient) => (
          <Link href={`/doctor/patients/${patient.id}`} key={patient.id} className="block">
            <Card className={`border transition-all hover:shadow-md bg-white ${patient.priority === "HIGH" ? "border-red-200 hover:border-red-300" : "border-slate-200 hover:border-slate-300"}`}>
              <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full shrink-0 ${patient.priority === "HIGH" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-lg">{patient.name}</h3>
                      {patient.priority === "HIGH" ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 uppercase text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" /> High Priority
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 uppercase text-xs">
                          Moderate
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{patient.age} years • {patient.gender} • {patient.village}</p>
                    <p className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded border border-slate-100">
                      {patient.referralReason}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
                  <p className="text-xs text-slate-500">{patient.source}</p>
                  <p className="text-xs text-slate-400">Waiting: {patient.waitingTime}</p>
                  <div className="flex items-center gap-1 text-blue-600 text-sm font-semibold mt-2">
                    Open <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
