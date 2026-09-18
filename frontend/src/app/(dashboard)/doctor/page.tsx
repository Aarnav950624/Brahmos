import { mockDoctorQueue } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Clock, Users, FileCheck } from "lucide-react";

export default function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Doctor Portal</h1>
        <p className="text-slate-500">Dr. Anil Sharma • General Physician</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Patients Waiting</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDoctorQueue.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <FileCheck className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
            <Stethoscope className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultation Queue</CardTitle>
          <CardDescription>Patients currently waiting for teleconsultation or clinic visit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Age</th>
                  <th className="px-4 py-3 font-medium">Reason for visit</th>
                  <th className="px-4 py-3 font-medium">Wait Time</th>
                  <th className="px-4 py-3 font-medium">Urgency</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockDoctorQueue.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-900">{patient.patient}</td>
                    <td className="px-4 py-4 text-slate-600">{patient.age}</td>
                    <td className="px-4 py-4 text-slate-600">{patient.reason}</td>
                    <td className="px-4 py-4 text-slate-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {patient.waitTime}
                    </td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant={patient.urgency === "high" ? "destructive" : patient.urgency === "medium" ? "default" : "secondary"}
                        className={patient.urgency === "medium" ? "bg-amber-500 hover:bg-amber-600" : ""}
                      >
                        {patient.urgency}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button size="sm">Start Consultation</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mockDoctorQueue.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No patients in the queue.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
