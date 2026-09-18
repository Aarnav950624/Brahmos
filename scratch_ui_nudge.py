import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

base = "c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src"

# --- TOPBAR ---
topbar_path = f"{base}/components/layout/TopBar.tsx"
with open(topbar_path, 'r', encoding='utf-8') as f:
    topbar = f.read()

replacement_topbar = """import { useEffect, useState } from "react";
import Link from "next/link";
"""

topbar = topbar.replace('"use client";', '"use client";\n' + replacement_topbar)

bell_target = """<Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </Button>"""

bell_replacement = """{user.role === "CITIZEN" || user.role === "ASHA_WORKER" ? (
          <Link href={user.role === "CITIZEN" ? "/citizen/notifications" : "/asha/notifications"}>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-slate-600" />
          </Button>
        )}"""

topbar = topbar.replace(bell_target, bell_replacement)
write_file(topbar_path, topbar)
print("Updated TopBar")

# --- NOTIFICATION CENTER COMPONENT ---
notif_center = """"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Activity, Pill, ShieldAlert, BookOpen, AlertCircle, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export function NotificationCenter() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (!user) return;
    
    // Auto-generate nudges if empty to setup demo
    fetch("http://localhost:8000/api/v1/notifications/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id, role: user.role })
    }).then(() => {
      fetch(`http://localhost:8000/api/v1/notifications?user_id=${user.id}`)
        .then(r => r.json())
        .then(data => {
          // Sort by date desc
          const sorted = data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setNotifications(sorted);
        });
    });
  }, [user]);

  const markRead = (id: string) => {
    fetch(`http://localhost:8000/api/v1/notifications/${id}/read`, { method: "POST" })
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      });
  };

  const markAllRead = () => {
    if (!user) return;
    fetch(`http://localhost:8000/api/v1/notifications/read-all?user_id=${user.id}`, { method: "POST" })
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      });
  };

  const filtered = notifications.filter(n => {
    if (filter === "ALL") return true;
    if (filter === "UNREAD") return !n.read;
    return n.category === filter;
  });

  const getIcon = (cat: string) => {
    switch(cat) {
      case "HEALTH": return <Activity className="h-5 w-5 text-emerald-600" />;
      case "FOLLOW_UP": return <Calendar className="h-5 w-5 text-blue-600" />;
      case "REQUESTS": return <Pill className="h-5 w-5 text-amber-600" />;
      case "SCHEMES": return <BookOpen className="h-5 w-5 text-purple-600" />;
      default: return <AlertCircle className="h-5 w-5 text-slate-600" />;
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "IMPORTANT": return "bg-red-50 border-red-200";
      case "NORMAL": return "bg-white border-slate-200";
      default: return "bg-slate-50 border-slate-100";
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500">ArogyaAI updates and awareness nudges</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-600" />
          Mark all as read
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
        {["ALL", "UNREAD", "HEALTH", "FOLLOW_UP", "REQUESTS", "SCHEMES"].map(t => (
          <Button 
            key={t} 
            variant={filter === t ? "default" : "outline"}
            onClick={() => setFilter(t)}
            className={filter === t ? "bg-blue-600 text-white" : "bg-white text-slate-600"}
            size="sm"
          >
            {t.replace("_", " ")}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 border-dashed">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
          <h3 className="text-lg font-bold text-slate-800">You're all caught up.</h3>
          <p>No new updates in this category.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(n => (
            <Card key={n.id} className={`overflow-hidden transition-all hover:shadow-md border-l-4 ${n.read ? 'border-l-slate-200 opacity-70' : 'border-l-blue-500'} ${getPriorityColor(n.priority)}`}>
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row p-4 sm:p-5 gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-full shrink-0 ${n.read ? 'bg-slate-100' : 'bg-blue-50 animate-pulse'}`}>
                      {getIcon(n.category)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</h3>
                        {n.priority === "IMPORTANT" && <Badge variant="destructive" className="text-[10px] h-4">IMPORTANT</Badge>}
                      </div>
                      <p className="text-slate-600 font-medium">{n.message}</p>
                      <p className="text-xs text-slate-500 bg-slate-100 p-2 rounded inline-block mt-2 font-mono">
                        <span className="font-bold text-slate-600">Why am I seeing this?</span> {n.reason}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 mt-3 sm:mt-0">
                    <span className="text-xs text-slate-400 font-medium">{new Date(n.created_at).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                      {!n.read && (
                        <Button variant="ghost" size="sm" onClick={() => markRead(n.id)} className="text-xs text-slate-500">
                          Mark Read
                        </Button>
                      )}
                      {n.action_url && (
                        <Button size="sm" onClick={() => { markRead(n.id); router.push(n.action_url); }} className="bg-blue-600 hover:bg-blue-700">
                          {n.action_label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
"""

write_file(f"{base}/components/nudge/NotificationCenter.tsx", notif_center)
print("Created NotificationCenter")

page_wrapper = """"use client";
import { NotificationCenter } from "@/components/nudge/NotificationCenter";
export default function Page() {
  return <NotificationCenter />;
}
"""
write_file(f"{base}/app/(dashboard)/citizen/notifications/page.tsx", page_wrapper)
write_file(f"{base}/app/(dashboard)/asha/notifications/page.tsx", page_wrapper)
print("Created pages")

# --- CITIZEN DASHBOARD NUDGE WIDGET ---
dashboard_path = f"{base}/app/(dashboard)/citizen/page.tsx"
with open(dashboard_path, 'r', encoding='utf-8') as f:
    dashboard = f.read()

# I need to add state for nudges and display a widget.
imports_replacement = """import { Activity, Heart, Shield, Stethoscope, Pill, MapPin, Search, Bell, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
"""
dashboard = dashboard.replace('import { Activity, Heart, Shield, Stethoscope, Pill, MapPin, Search } from "lucide-react";\nimport { Badge } from "@/components/ui/badge";', imports_replacement)

# Add state hook at the beginning of the component
hook_target = """export default function CitizenDashboard() {
  const { name, village, healthWallet, alerts } = mockCitizen;"""

hook_replacement = """export default function CitizenDashboard() {
  const { name, village, healthWallet, alerts } = mockCitizen;
  const user = useAuthStore((state) => state.user);
  const [nudges, setNudges] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      // Setup nudges
      fetch("http://localhost:8000/api/v1/notifications/generate", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: user.id, role: user.role })
      }).then(() => {
        fetch(`http://localhost:8000/api/v1/notifications?user_id=${user.id}`)
          .then(r => r.json())
          .then(data => setNudges(data.filter((n:any) => !n.read).slice(0, 3))); // Show max 3 unread
      });
    }
  }, [user]);"""

dashboard = dashboard.replace(hook_target, hook_replacement)

# Inject Widget before Quick Actions
widget_target = """      {/* Quick Actions */}
      <div>"""

widget_replacement = """      {/* ArogyaAI Nudge Engine Updates */}
      {nudges.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" /> ArogyaAI Updates
            </h2>
            <Link href="/citizen/notifications">
              <Button variant="ghost" size="sm" className="text-blue-700 text-xs font-semibold">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nudges.map(n => (
              <div key={n.id} className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1">{n.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                </div>
                {n.action_url && (
                  <Link href={n.action_url} className="mt-3 block">
                    <Button size="sm" variant="outline" className="w-full text-xs border-blue-200 text-blue-700 hover:bg-blue-50">
                      {n.action_label}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>"""

dashboard = dashboard.replace(widget_target, widget_replacement)

# Make sure "use client" is present
if '"use client"' not in dashboard:
    dashboard = '"use client";\n' + dashboard

write_file(dashboard_path, dashboard)
print("Updated CitizenDashboard")
