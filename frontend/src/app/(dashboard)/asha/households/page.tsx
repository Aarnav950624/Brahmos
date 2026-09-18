"use client";

import Link from "next/link";
import { Users, AlertCircle, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const DEMO_HOUSEHOLDS = [
  {
    id: "hh-001",
    name: "Ramesh Patel Household",
    village: "Navjeevan Gram",
    membersCount: 3,
    lastVisit: "12 Sep 2026",
    nextFollowUp: "20 Sep 2026",
    riskStatus: "HIGH",
    pendingActions: 1,
  },
  {
    id: "hh-002",
    name: "Sunita Sharma Household",
    village: "Navjeevan Gram",
    membersCount: 4,
    lastVisit: "15 Sep 2026",
    nextFollowUp: "None",
    riskStatus: "LOW",
    pendingActions: 0,
  }
];

export default function HouseholdsList() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">My Households</h1>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Demo Data</Badge>
          </div>
          <p className="text-slate-500">Manage your assigned households.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search households..." className="pl-9 bg-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_HOUSEHOLDS.map((hh) => (
          <Link href={`/asha/households/${hh.id}`} key={hh.id} className="block">
            <div className={`p-5 rounded-xl border transition-all hover:shadow-md bg-white ${hh.riskStatus === 'HIGH' ? 'border-red-200' : 'border-slate-200'}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${hh.riskStatus === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{hh.name}</h3>
                    <p className="text-xs text-slate-500">{hh.village} • {hh.membersCount} members</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Visit:</span>
                  <span className="font-medium">{hh.lastVisit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Next Follow-up:</span>
                  <span className="font-medium text-orange-600">{hh.nextFollowUp}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                {hh.riskStatus === "HIGH" ? (
                  <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                    <AlertCircle className="w-3 h-3 mr-1" /> High Risk Indicator
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Low Risk
                  </Badge>
                )}
                
                <div className="text-blue-600 flex items-center text-sm font-medium">
                  View <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
