"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, Clock, Search, Video, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DoctorQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/doctor/queue")
      .then(res => res.json())
      .then(data => {
        setQueue(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback for demo
        setQueue([
          {
            id: "ref-101",
            patient_id: "mem-002",
            patient_name: "Asha Devi",
            age: 29,
            source: "ASHA Worker",
            reason: "Pregnancy follow-up requires attention",
            priority: "HIGH",
            status: "WAITING",
            waiting_time_minutes: 45
          },
          {
            id: "ref-102",
            patient_id: "mem-001",
            patient_name: "Ramesh Patel",
            age: 42,
            source: "Citizen",
            reason: "Follow-up regarding recent health report",
            priority: "MODERATE",
            status: "WAITING",
            waiting_time_minutes: 120
          }
        ] as any);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultation Queue</h1>
          <p className="text-slate-500">Manage incoming patient referrals and consultation requests.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search patients..." className="pl-9 bg-white" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Waiting</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900">{item.patient_name}</div>
                    <div className="text-xs text-slate-500">{item.age} years</div>
                  </td>
                  <td className="px-4 py-4">
                    {item.priority === "HIGH" ? (
                      <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">HIGH</Badge>
                    ) : item.priority === "EMERGENCY" ? (
                      <Badge variant="destructive" className="bg-red-600 text-white animate-pulse">EMERGENCY</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">MODERATE</Badge>
                    )}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{item.source}</td>
                  <td className="px-4 py-4 text-slate-800 max-w-xs truncate" title={item.reason}>{item.reason}</td>
                  <td className="px-4 py-4 text-slate-600">{item.waiting_time_minutes}m</td>
                  <td className="px-4 py-4">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">{item.status}</Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link href={`/doctor/patients/${item.patient_id}`}>
                      <button className="px-3 py-1.5 bg-blue-50 text-blue-700 font-medium rounded hover:bg-blue-100 transition-colors">
                        Review
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
