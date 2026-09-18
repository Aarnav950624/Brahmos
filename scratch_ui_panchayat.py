import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

base = "c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src"

panchayat_page = """"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShieldAlert, Users, Activity, Syringe, Baby, MapPin, Sparkles, Navigation, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PanchayatDashboard() {
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/panchayat/health-pulse?time_range=${timeRange}`)
      .then(r => r.json())
      .then(d => setData(d));
  }, [timeRange]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Village Health & Welfare Pulse</h1>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 font-bold px-3 py-1">
              Aggregated Synthetic Demo Data
            </Badge>
          </div>
          <p className="text-slate-500 font-medium">Aggregated community insights for better local health action.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span className="font-bold text-slate-800 pr-2 border-r">{data.village}</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-bold">Privacy Notice</p>
          <p>Panchayat does not see private medical records. It sees the village-level picture and coordinates action. All metrics shown are aggregated synthetic data.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {data.kpis.map((kpi: any, idx: number) => (
          <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{kpi.label}</p>
              <p className="text-3xl font-bold text-slate-800">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trends Chart */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Community Health Concern Trends</CardTitle>
            <CardDescription>Reported health concerns over the selected period. Not clinical diagnoses.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Line type="monotone" name="Fever" dataKey="fever" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" name="Respiratory" dataKey="respiratory" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" name="Chronic" dataKey="chronic" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" name="Maternal" dataKey="maternal" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vaccination & Maternal/Child */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><Syringe className="h-5 w-5 text-emerald-600"/> Vaccination Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-4">
                <span className="text-4xl font-bold text-emerald-600">{data.vaccination.overall_coverage}</span>
                <span className="text-sm font-medium text-amber-600">{data.vaccination.pending_follow_ups} pending follow-ups</span>
              </div>
              <div className="space-y-3">
                {Object.entries(data.vaccination.breakdown).map(([key, val]: any) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>{key}</span>
                      <span>{val}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><Baby className="h-5 w-5 text-purple-600"/> Maternal & Child Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase">ANC Coverage</p>
                  <p className="text-lg font-bold text-slate-800">{data.maternal_child.anc_coverage}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                  <p className="text-xs font-bold text-red-500 uppercase">High-Risk ANC</p>
                  <p className="text-lg font-bold text-red-800">{data.maternal_child.high_risk_pregnancies} Pending</p>
                </div>
              </div>
              <div className="space-y-2 text-sm font-medium text-slate-700">
                <div className="flex justify-between py-1 border-b">
                  <span>Institutional Delivery</span>
                  <span className="text-blue-600 font-bold">{data.maternal_child.institutional_delivery}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Growth Monitoring</span>
                  <span className="text-blue-600 font-bold">{data.maternal_child.growth_monitoring}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Child Pending Follow-ups</span>
                  <span className="text-amber-600 font-bold">{data.maternal_child.child_pending_follow_ups}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Care Access */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-blue-600"/> Healthcare Access</CardTitle>
            <CardDescription>Village utilization of health resources.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">PHC Consultations</span>
                <Badge variant="secondary" className="font-bold text-sm bg-blue-50 text-blue-700">{data.care_access.phc_visits}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Teleconsultations</span>
                <Badge variant="secondary" className="font-bold text-sm bg-blue-50 text-blue-700">{data.care_access.teleconsultations}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Diagnostic Requests</span>
                <Badge variant="secondary" className="font-bold text-sm bg-purple-50 text-purple-700">{data.care_access.diagnostic_requests}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Medicine Fulfillment</span>
                <Badge variant="secondary" className="font-bold text-sm bg-emerald-50 text-emerald-700">{data.care_access.medicine_fulfillment}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Emergency Referrals</span>
                <Badge variant="secondary" className="font-bold text-sm bg-red-50 text-red-700">{data.care_access.emergency_referrals}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welfare Awareness */}
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-amber-600"/> Welfare Awareness Pulse</CardTitle>
            <CardDescription>Government scheme matching insights.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 border-b border-amber-100 mb-4">
              <p className="text-5xl font-bold text-amber-600 mb-2">{data.welfare.matching_households}</p>
              <p className="font-semibold text-amber-800">Households may benefit from additional welfare awareness</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">Opportunities</p>
                <p className="text-xl font-bold text-slate-800">{data.welfare.opportunities}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase">Actions Done</p>
                <p className="text-xl font-bold text-emerald-600">{data.welfare.completed}</p>
              </div>
            </div>
            <p className="text-xs text-center text-slate-400 mt-4 italic">Potentially relevant based on synthetic demo data.</p>
          </CardContent>
        </Card>

        {/* CareMap Summary */}
        <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-100 h-24 relative flex items-center justify-center border-b">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent bg-[length:20px_20px]" style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)'}}></div>
            <MapPin className="h-8 w-8 text-slate-400 z-10" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Village Care Access</CardTitle>
            <CardDescription>Facilities mapped in {data.village}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 mb-4">
              <span className="font-bold text-slate-800 text-lg">13</span>
              <span className="font-medium text-slate-600">Nearby Care Facilities</span>
            </div>
            <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
              <Navigation className="h-4 w-4 mr-2" /> View CareMap
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights & Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AI Insights */}
        <Card className="border-blue-200 bg-blue-50/30 shadow-md">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" /> AI Village Health Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.insights.map((insight: any, idx: number) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm space-y-2">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Observation</span>
                  <p className="font-medium text-slate-800">{insight.observation}</p>
                </div>
                <div className="pl-3 border-l-2 border-slate-200">
                  <span className="text-xs font-bold uppercase text-slate-400">Evidence</span>
                  <p className="text-sm text-slate-600">{insight.evidence}</p>
                </div>
                <div className="pt-2">
                  <span className="text-xs font-bold uppercase text-emerald-600">Suggested Action</span>
                  <p className="text-sm font-semibold text-emerald-800">{insight.suggested_action}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Priorities */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Community Action Priorities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.priorities.map((priority: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 text-lg">{priority.category}</h3>
                  <Badge variant={priority.priority === 'HIGH' ? 'destructive' : 'secondary'} className={priority.priority === 'HIGH' ? '' : 'bg-amber-100 text-amber-800'}>
                    {priority.priority}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">{priority.reason}</p>
                <p className="text-xs text-slate-500 mb-3">{priority.evidence}</p>
                
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-500">Action</span>
                    <p className="font-semibold text-slate-800 text-sm">{priority.suggested_action}</p>
                  </div>
                  <Badge variant="outline" className="bg-white whitespace-nowrap">
                    Role: {priority.responsible_role}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
"""

write_file(f"{base}/app/(dashboard)/panchayat/page.tsx", panchayat_page)
print("Created Panchayat Dashboard UI")
