import { mockAshaStats } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Activity, FileWarning, CloudOff, Plus, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AshaDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ASHA / ANM Portal</h1>
          <p className="text-slate-500">Navjeevan Gram • 234 Assigned Households</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 flex items-center gap-1">
            <CloudOff className="h-3 w-3" /> {mockAshaStats.pendingSync} Pending Sync
          </Badge>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-1" /> New Visit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Households Visited</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAshaStats.householdsVisited}</div>
            <p className="text-xs text-slate-500 mt-1">This week</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
            <ClipboardList className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAshaStats.followUpsDue}</div>
            <p className="text-xs text-slate-500 mt-1">Next 7 days</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 bg-red-50/30">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-red-800">High-Risk Cases</CardTitle>
            <FileWarning className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{mockAshaStats.highRiskCases}</div>
            <p className="text-xs text-red-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">AI Risk Alerts</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-slate-500 mt-1">From symptom checker</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Work</CardTitle>
            <CardDescription>Scheduled visits and follow-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Sunita Verma", type: "Pregnancy Follow-up", time: "10:00 AM" },
                { name: "Rahul Singh", type: "TB Medication Check", time: "11:30 AM" },
                { name: "Household #45", type: "Routine Visit", time: "02:00 PM" },
              ].map((task, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="text-xs text-slate-500">{task.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">{task.time}</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-emerald-600">Start</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Cases</CardTitle>
            <CardDescription>Cases requiring urgent attention based on AI alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Anand M.", issue: "Persistent high fever, possible dengue", risk: "Medium" },
                { name: "Meena D.", issue: "Missed ANC visit (3rd Trimester)", risk: "High" },
              ].map((caseItem, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{caseItem.name}</p>
                    <p className="text-xs text-slate-600 mt-1">{caseItem.issue}</p>
                  </div>
                  <Badge variant={caseItem.risk === "High" ? "destructive" : "secondary"}>
                    {caseItem.risk} Priority
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
