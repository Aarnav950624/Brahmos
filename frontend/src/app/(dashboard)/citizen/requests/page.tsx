"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

export default function CitizenRequests() {
  const [data, setData] = useState<any>({ pharmacy: [], lab: [] });
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/citizen/requests").then(r => r.json()).then(setData).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Requests</h1>
      
      <h2 className="text-xl font-bold mt-8">Medicine Requests</h2>
      {data.pharmacy.length === 0 ? <p>No requests found.</p> : (
        <div className="space-y-4">
          {data.pharmacy.map((req: any) => (
            <div key={req.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between">
                <p className="font-bold">Request ID: {req.id}</p>
                <Badge>{req.status}</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-2">Medicines: {req.medicines.map((m: any) => m.name).join(", ")}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold mt-8">Diagnostic Tests</h2>
      {data.lab.length === 0 ? <p>No diagnostic requests.</p> : (
        <div className="space-y-4">
          {data.lab.map((req: any) => (
            <div key={req.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between">
                <p className="font-bold">Test: {req.test_name}</p>
                <Badge>{req.status}</Badge>
              </div>
              {req.result_value && <p className="text-sm font-bold text-emerald-600 mt-2">Result: {req.result_value}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
