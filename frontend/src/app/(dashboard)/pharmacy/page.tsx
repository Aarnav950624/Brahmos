import { mockPharmacyRequests } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pill, Activity, CheckCircle, Package } from "lucide-react";

export default function PharmacyDashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Pharmacy & Lab Portal</h1>
        <p className="text-slate-500">Navjeevan Primary Healthcare Center Partner</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">New Requests</CardTitle>
            <Pill className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Ready for Pickup</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">8</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders & Requests</CardTitle>
          <CardDescription>Manage incoming prescriptions and lab tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Item Details</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockPharmacyRequests.map((req) => (
                  <tr key={req.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-900">{req.patient}</td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className={req.type === 'Medicine' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-blue-200 text-blue-700 bg-blue-50'}>
                        {req.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-medium">{req.item}</td>
                    <td className="px-4 py-4 text-slate-600">{req.time}</td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant={req.status === "Ready" ? "default" : "secondary"}
                        className={req.status === "Ready" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                      >
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button size="sm" variant={req.status === 'Ready' ? 'default' : 'outline'}>
                        {req.status === 'Ready' ? 'Mark Delivered' : 'Update Status'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
