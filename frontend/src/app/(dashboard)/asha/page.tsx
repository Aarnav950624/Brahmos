"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Home, AlertCircle, Clock, ClipboardList, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AshaDashboard() {
  const stats = [
    { label: "Assigned Households", value: "24", icon: Home, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Visits Due", value: "5", icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "High-Risk Cases", value: "2", icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
    { label: "Pending Follow-ups", value: "3", icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-100" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">ASHA Worker Dashboard</h1>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Demo Data</Badge>
        </div>
        <p className="text-slate-500">Overview of your assigned community.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle>Priority Households (High Risk)</CardTitle>
              <CardDescription>Households requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/asha/households/hh-001" className="block">
                <div className="p-4 border border-red-100 bg-red-50 hover:bg-red-100 transition-colors rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                      Ramesh Patel Household
                      <Badge variant="destructive" className="text-[10px] uppercase">High Risk</Badge>
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">Asha Devi (Pregnancy warning sign)</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-red-500" />
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "My Households", icon: Users, color: "bg-blue-100 text-blue-700", href: "/asha/households" },
                  { label: "Log Visit", icon: ClipboardList, color: "bg-emerald-100 text-emerald-700", href: "/asha/households" },
                  { label: "Follow-ups", icon: Clock, color: "bg-orange-100 text-orange-700", href: "#" },
                  { label: "Escalations", icon: AlertCircle, color: "bg-red-100 text-red-700", href: "#" },
                ].map((action, i) => (
                  <Link href={action.href} key={i}>
                    <div className="h-full w-full py-4 flex flex-col gap-2 items-center justify-center border border-slate-200 rounded-lg hover:border-slate-300 bg-white transition-colors">
                      <div className={`p-3 rounded-full ${action.color}`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold whitespace-normal text-center">{action.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { text: "Routine visit logged for Sita Patel", time: "2 hours ago" },
                  { text: "Ramesh Patel reported fever symptoms", time: "Yesterday" },
                  { text: "Vaccination campaign updated", time: "2 days ago" }
                ].map((act, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{act.text}</p>
                      <p className="text-xs text-slate-500">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
