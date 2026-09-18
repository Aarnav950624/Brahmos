"use client";

import Link from "next/link";
import { ArrowLeft, User, AlertCircle, PlusCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEMO_MEMBERS = [
  {
    id: "mem-001",
    name: "Ramesh Patel",
    age: 42,
    gender: "Male",
    status: "Chronic-condition monitoring",
    risk: "MODERATE"
  },
  {
    id: "mem-002",
    name: "Asha Devi",
    age: 29,
    gender: "Female",
    status: "Pregnancy - Active warning signs",
    risk: "HIGH"
  }
];

import { useState, useEffect } from "react";

export default function HouseholdDetail({ params }: { params: { id: string } }) {
  const [awareness, setAwareness] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/asha/households/${params.id}/scheme-awareness`)
      .then(r => r.json())
      .then(setAwareness)
      .catch(() => {});
  }, [params.id]);
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/asha/households">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ramesh Patel Household</h1>
          <p className="text-slate-500">Navjeevan Gram • 3 Members</p>
        </div>
      </div>

      <div className="space-y-4">
        {awareness && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-900 text-sm font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Scheme Awareness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-blue-800 mb-2">{awareness.notes}</p>
              <div className="flex flex-wrap gap-2">
                {awareness.potentially_relevant_categories.map((cat: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-white text-blue-700 border-blue-300">
                    {cat.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="text-lg font-bold text-slate-900">Household Members</h2>
        
        <div className="space-y-4">
          {DEMO_MEMBERS.map(member => (
            <Card key={member.id} className={`border ${member.risk === 'HIGH' ? 'border-red-200' : 'border-slate-200'} bg-white shadow-sm`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-100 rounded-full text-slate-500">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        {member.name}
                        {member.risk === "HIGH" && (
                          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 uppercase text-[10px]">
                            High Risk
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500">{member.age} years • {member.gender}</p>
                      
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          {member.status}
                        </p>
                      </div>

                      {member.risk === "HIGH" && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-sm font-bold text-red-800 flex items-center gap-2 mb-1">
                            <AlertCircle className="h-4 w-4" /> AI Risk Indicator
                          </p>
                          <p className="text-sm text-red-700 mb-2">Pregnancy follow-up requires attention.</p>
                          <p className="text-xs text-red-600 italic">Evidence: High-risk pregnancy flag combined with a missed scheduled follow-up or warning signs.</p>
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="destructive" className="text-xs h-8">Escalate to Doctor</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex w-full sm:w-auto flex-col gap-2">
                    <Link href={`/asha/households/${params.id}/visit/new?memberId=${member.id}`} className="w-full">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" /> Log Visit
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full text-slate-600">
                      View History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
