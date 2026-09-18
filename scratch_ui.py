import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

base = "c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/app/(dashboard)"

# --- PHARMACY DASHBOARD ---
pharmacy_page = """\"""use client\""";
import Link from "next/link";
import { Pill, Bell, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PharmacyDashboard() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Pharmacy & Lab Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/pharmacy/requests">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pharmacy Requests</CardTitle>
              <Bell className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-slate-500">View incoming prescriptions</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/pharmacy/lab-requests">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lab Requests</CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-slate-500">View diagnostic tests</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/pharmacy/inventory">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              <Pill className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Check</div>
              <p className="text-xs text-slate-500">Manage medicine stock</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
"""

# --- PHARMACY REQUESTS LIST ---
pharmacy_requests_page = """\"""use client\""";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PharmacyRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/pharmacy/requests").then(r => r.json()).then(setRequests).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Pharmacy Requests</h1>
      {requests.length === 0 ? (
        <p className="text-slate-500">No incoming pharmacy requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="p-4 border border-slate-200 rounded-lg bg-white flex justify-between items-center">
              <div>
                <p className="font-bold">{req.patient_name}</p>
                <p className="text-sm text-slate-500">ID: {req.id} • {req.medicines.length} medicines</p>
                <Badge variant="outline" className="mt-2">{req.status}</Badge>
              </div>
              <Link href={`/pharmacy/requests/${req.id}`}>
                <Button variant="outline">View</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"""

# --- PHARMACY REQUEST DETAIL ---
pharmacy_req_detail = """\"""use client\""";
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
"""

# --- LAB REQUESTS LIST ---
lab_requests_page = """\"""use client\""";
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
"""

# --- LAB REQUEST DETAIL ---
lab_req_detail = """\"""use client\""";
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
"""

# --- PHARMACY INVENTORY ---
pharmacy_inventory = """\"""use client\""";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PharmacyInventory() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch("http://localhost:8000/api/v1/pharmacy/inventory").then(r => r.json()).then(setItems).catch(() => {});
  }, []);

  const restock = async (id: string) => {
    await fetch(`http://localhost:8000/api/v1/pharmacy/inventory/${id}/restock`, { method: "POST" });
    fetch("http://localhost:8000/api/v1/pharmacy/inventory").then(r => r.json()).then(setItems).catch(() => {});
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
      {items.length === 0 ? <p>No inventory items.</p> : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="p-4 border rounded-lg bg-white flex justify-between items-center">
              <div>
                <p className="font-bold">{item.medicine_name}</p>
                <p className="text-sm">Available: {item.available_quantity} {item.unit}</p>
                <Badge variant={item.status === "IN_STOCK" ? "default" : item.status === "OUT_OF_STOCK" ? "destructive" : "secondary"}>
                  {item.status.replace("_", " ")}
                </Badge>
              </div>
              {(item.status === "OUT_OF_STOCK" || item.status === "LOW_STOCK") && (
                <Button onClick={() => restock(item.id)}>Restock</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"""

# --- CITIZEN REQUESTS ---
citizen_requests = """\"""use client\""";
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
"""

write_file(f"{base}/pharmacy/page.tsx", pharmacy_page)
write_file(f"{base}/pharmacy/requests/page.tsx", pharmacy_requests_page)
write_file(f"{base}/pharmacy/requests/[id]/page.tsx", pharmacy_req_detail)
write_file(f"{base}/pharmacy/lab-requests/page.tsx", lab_requests_page)
write_file(f"{base}/pharmacy/lab-requests/[id]/page.tsx", lab_req_detail)
write_file(f"{base}/pharmacy/inventory/page.tsx", pharmacy_inventory)
write_file(f"{base}/citizen/requests/page.tsx", citizen_requests)

print("Created all pages.")
