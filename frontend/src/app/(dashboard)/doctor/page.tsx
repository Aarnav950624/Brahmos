"use client";

import Link from "next/link";
import { Clock, AlertCircle, CheckCircle, FileText, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DoctorDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Doctor Workspace</h1>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Demo Mode</Badge>
        </div>
        <p className="text-slate-500">Manage your consultations and referrals.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Waiting", value: "3", icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "High Priority", value: "1", icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
          { label: "In Consultation", value: "0", icon: Activity, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Follow-ups Due", value: "4", icon: FileText, color: "text-orange-600", bg: "bg-orange-100" },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">{stat.label}</p>
                  <p className="font-bold text-slate-900 text-2xl">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Priority Queue</h2>
          <Link href="/doctor/queue" className="text-blue-600 text-sm font-medium hover:underline">View All</Link>
        </div>

        <div className="space-y-4">
          <Card className="border-red-200 shadow-sm bg-white hover:border-red-300 transition-colors">
            <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-full shrink-0">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-lg">Asha Devi</h3>
                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 uppercase text-xs">High Priority</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">Age: 29 • Source: ASHA Worker Referral</p>
                  <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                    Reason: Pregnancy follow-up requires attention
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <p className="text-xs text-slate-500">Waiting: 45m</p>
                <Link href="/doctor/patients/mem-002">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md shadow-sm transition-colors">
                    Review Patient
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 text-slate-600 rounded-full shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-lg">Ramesh Patel</h3>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 uppercase text-xs">Moderate</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">Age: 42 • Source: Citizen App</p>
                  <p className="text-sm font-medium text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
                    Reason: Follow-up regarding recent health report
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <p className="text-xs text-slate-500">Waiting: 120m</p>
                <Link href="/doctor/patients/mem-001">
                  <button className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-md shadow-sm transition-colors">
                    Review Patient
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
