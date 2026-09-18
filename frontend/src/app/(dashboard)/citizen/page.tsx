import { mockCitizen } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Shield, Stethoscope, Pill, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CitizenDashboard() {
  const { name, village, healthWallet, alerts } = mockCitizen;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-blue-600 rounded-xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Good morning, {name}</h1>
          <p className="text-blue-100 flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {village}
          </p>
        </div>
        <div className="bg-blue-700/50 p-3 rounded-lg border border-blue-500/50 flex items-center gap-3">
          <Shield className="h-6 w-6 text-emerald-400" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-100">Health Profile</p>
            <p className="text-blue-200">Up to date</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Ask ArogyaAI", icon: Search, color: "bg-blue-100 text-blue-700" },
            { label: "Check Symptoms", icon: Activity, color: "bg-red-100 text-red-700" },
            { label: "Book Doctor", icon: Stethoscope, color: "bg-purple-100 text-purple-700" },
            { label: "Health Wallet", icon: Heart, color: "bg-pink-100 text-pink-700" },
            { label: "My Medicines", icon: Pill, color: "bg-amber-100 text-amber-700" },
            { label: "Find Care", icon: MapPin, color: "bg-emerald-100 text-emerald-700" },
          ].map((action, i) => (
            <Button key={i} variant="outline" className="h-auto py-4 flex flex-col gap-2 items-center justify-center border-slate-200 hover:border-slate-300 bg-white">
              <div className={`p-3 rounded-full ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold whitespace-normal text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Overview */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-800">Health Wallet Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active Medicines</CardDescription>
                <CardTitle className="text-3xl text-amber-600">{healthWallet.activeMedicines}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">2 to be taken today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Recent Reports</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{healthWallet.recentReports}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">Uploaded 3 days ago</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending Follow-ups</CardDescription>
                <CardTitle className="text-3xl text-red-600">{healthWallet.pendingFollowUps}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">Dr. Sharma on 12th Oct</p>
              </CardContent>
            </Card>
          </div>
          
          <h2 className="text-lg font-bold text-slate-800 pt-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">Prescription Uploaded</p>
                    <p className="text-sm text-slate-500">Added to Health Wallet</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400">Oct 5, 2026</span>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">Teleconsultation Completed</p>
                    <p className="text-sm text-slate-500">Dr. Anil Sharma</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400">Oct 4, 2026</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Awareness & Actions */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-800">Awareness & Actions</h2>
          {alerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${alert.type === 'warning' ? 'border-l-amber-500 bg-amber-50/30' : 'border-l-blue-500 bg-blue-50/30'}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{alert.title}</CardTitle>
                  <Badge variant={alert.type === 'warning' ? 'destructive' : 'default'} className="bg-opacity-90">
                    {alert.type === 'warning' ? 'Action Required' : 'Info'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">{alert.description}</p>
                <Button variant="outline" size="sm" className="w-full text-xs">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
