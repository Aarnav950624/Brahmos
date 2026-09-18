"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LabRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/lab/requests").then(r => r.json()).then(setRequests).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Lab Requests</h1>
      {requests.length === 0 ? (
        <p className="text-slate-500">No diagnostic requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="p-4 border border-slate-200 rounded-lg bg-white flex justify-between items-center">
              <div>
                <p className="font-bold">{req.patient_name}</p>
                <p className="text-sm text-slate-500">Test: {req.test_name}</p>
                <Badge variant="outline" className="mt-2">{req.status}</Badge>
              </div>
              <Link href={`/pharmacy/lab-requests/${req.id}`}>
                <Button variant="outline">View</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
