"use client";
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
