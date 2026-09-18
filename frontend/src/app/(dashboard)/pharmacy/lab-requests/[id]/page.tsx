"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LabRequestDetail({ params }: { params: { id: string } }) {
  const [req, setReq] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/lab/requests/${params.id}`).then(r => r.json()).then(setReq).catch(() => {});
  }, [params.id]);

  const updateStatus = async (status: string) => {
    await fetch(`http://localhost:8000/api/v1/lab/requests/${params.id}/status`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(status)
    });
    setReq({ ...req, status });
  };

  const uploadResult = async () => {
    await fetch(`http://localhost:8000/api/v1/lab/requests/${params.id}/result`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: params.id, result_text: "Synthetic Demo Result: Normal" })
    });
    setReq({ ...req, status: "COMPLETED", result_value: "Synthetic Demo Result: Normal" });
  };

  if (!req) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>Back</Button>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lab Request: {req.id}</h1>
        <Badge>{req.status}</Badge>
      </div>
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent>
          <p><strong>Patient Name:</strong> {req.patient_name}</p>
          <p><strong>Test:</strong> {req.test_name}</p>
          <p><strong>Notes:</strong> {req.notes}</p>
          {req.result_value && <p className="mt-4 font-bold text-emerald-600">{req.result_value}</p>}
        </CardContent>
      </Card>
      <div className="flex gap-2">
        {req.status === "REQUESTED" && <Button onClick={() => updateStatus("ACCEPTED")}>Accept</Button>}
        {req.status === "ACCEPTED" && <Button onClick={() => updateStatus("SAMPLE_COLLECTED")}>Sample Collected</Button>}
        {req.status === "SAMPLE_COLLECTED" && <Button onClick={() => updateStatus("PROCESSING")}>Processing</Button>}
        {req.status === "PROCESSING" && <Button onClick={() => updateStatus("REPORT_READY")}>Report Ready</Button>}
        {req.status === "REPORT_READY" && <Button onClick={uploadResult}>Generate Demo Result (Complete)</Button>}
      </div>
    </div>
  );
}
