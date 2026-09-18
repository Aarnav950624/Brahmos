"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PharmacyRequestDetail({ params }: { params: { id: string } }) {
  const [req, setReq] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/pharmacy/requests/${params.id}`).then(r => r.json()).then(setReq).catch(() => {});
  }, [params.id]);

  const updateStatus = async (status: string) => {
    await fetch(`http://localhost:8000/api/v1/pharmacy/requests/${params.id}/status`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(status)
    });
    setReq({ ...req, status });
  };

  if (!req) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>Back</Button>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Request: {req.id}</h1>
        <Badge>{req.status}</Badge>
      </div>
      <Card>
        <CardHeader><CardTitle>Patient info</CardTitle></CardHeader>
        <CardContent>
          <p><strong>Name:</strong> {req.patient_name}</p>
          <p><strong>Doctor:</strong> {req.doctor_name}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Medicines</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-5">
            {req.medicines.map((m: any, i: number) => (
              <li key={i}>{m.name} - {m.dosage} ({m.frequency}) x {m.duration}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <div className="flex gap-2">
        {req.status === "REQUESTED" && <Button onClick={() => updateStatus("ACCEPTED")}>Accept</Button>}
        {req.status === "ACCEPTED" && <Button onClick={() => updateStatus("PACKED")}>Mark Packed</Button>}
        {req.status === "PACKED" && <Button onClick={() => updateStatus("DISPATCHED")}>Dispatch</Button>}
        {req.status === "DISPATCHED" && <Button onClick={() => updateStatus("DELIVERED")}>Mark Delivered</Button>}
      </div>
    </div>
  );
}
