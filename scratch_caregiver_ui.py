import os

path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/app/(dashboard)/citizen/caregiver/page.tsx'
os.makedirs(os.path.dirname(path), exist_ok=True)

page_content = '''"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Users, FileText, Activity, Clock, Syringe, Pill, HeartPulse, Sparkles, ArrowRight, Bot, Bell, AlertTriangle, ShieldCheck, CheckSquare, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ListenButton } from "@/components/ui/listen-button";
import Link from "next/link";

const FAMILY_MEMBERS = [
  { id: "sita", name: "Sita Patel", relationship: "Mother", age: 62 },
  { id: "aarav", name: "Aarav Patel", relationship: "Son", age: 4 }
];

export default function CaregiverMode() {
  const { t, language } = useTranslation();
  const user = useAuthStore(state => state.user);
  
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!selectedMember) {
      setData(null);
      return;
    }
    
    setLoading(true);
    fetch(`http://localhost:8000/api/v1/caregiver/${selectedMember}/summary?user_id=${user?.id || 'citizen-1'}&language=${language}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        // Initialize checklist
        const cl: Record<string, boolean> = {};
        d.tasks?.forEach((t: any) => {
          cl[t.id] = false;
        });
        setChecklist(cl);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [selectedMember, user, language]);

  const toggleChecklist = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'FOLLOW_UP': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'REPORT': return <FileText className="h-5 w-5 text-emerald-500" />;
      case 'MEDICINE': return <Pill className="h-5 w-5 text-purple-500" />;
      case 'VACCINATION': return <Syringe className="h-5 w-5 text-rose-500" />;
      default: return <Activity className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="h-8 w-8 text-rose-500" />
            Caregiver Mode
          </h1>
          <p className="text-slate-500 mt-1">Manage important health tasks for your family members.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <ShieldCheck className="h-4 w-4" /> Synthetic Demo Data
        </div>
      </div>

      {!selectedMember ? (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Who are you caring for?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FAMILY_MEMBERS.map(member => (
                <div 
                  key={member.id} 
                  onClick={() => setSelectedMember(member.id)}
                  className="flex items-center p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md cursor-pointer transition-all bg-white"
                >
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{member.name}</h3>
                    <p className="text-sm text-slate-500">{member.relationship} • Age {member.age}</p>
                  </div>
                  <div className="ml-auto">
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">{FAMILY_MEMBERS.find(m => m.id === selectedMember)?.name}</h2>
                <p className="text-xs text-slate-500">Caring for {FAMILY_MEMBERS.find(m => m.id === selectedMember)?.relationship}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)} className="text-slate-500 hover:text-slate-800">
              Change
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4" />
              Loading records...
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 space-y-6">
                
                {data.ai_summary && (
                  <Card className="border-blue-200 bg-blue-50 shadow-sm">
                    <CardHeader className="pb-3 border-b border-blue-100">
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
                          <Bot className="h-5 w-5" /> AI Care Summary
                        </CardTitle>
                        <ListenButton text={data.ai_summary.summary_audio_text} className="h-8 w-8 !min-h-0 !min-w-0 p-0 rounded-full bg-white text-blue-600 shadow-sm" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-bold text-blue-500">Priority</span>
                        <p className="font-medium text-slate-800">{data.ai_summary.priority}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider font-bold text-blue-500">Context</span>
                        <p className="text-sm text-slate-700">{data.ai_summary.evidence}</p>
                      </div>
                      <div className="pt-2 border-t border-blue-100">
                        <span className="text-xs uppercase tracking-wider font-bold text-emerald-600">Suggested Action</span>
                        <p className="font-medium text-emerald-800">{data.ai_summary.suggested_action}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <h3 className="font-bold text-lg text-slate-800">Tasks & Alerts</h3>
                
                <div className="space-y-4">
                  {data.tasks?.map((task: any) => (
                    <Card key={task.id} className="border-slate-200 shadow-sm overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="p-4 flex-1 flex gap-4">
                          <div className="mt-1">{getTaskIcon(task.type)}</div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-slate-800">{task.title}</h4>
                              <Badge className={task.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
                                {task.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{task.description}</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 border-t sm:border-t-0 sm:border-l border-slate-200 p-4 flex flex-col justify-center gap-2 sm:w-48 shrink-0">
                          <Link href={task.action_url}>
                            <Button size="sm" className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100">
                              {task.action_label}
                            </Button>
                          </Link>
                          {task.type === 'FOLLOW_UP' && (
                            <Link href={`/citizen/visit-brief?member=${selectedMember}`}>
                              <Button size="sm" variant="outline" className="w-full border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100">
                                Prepare Visit Brief
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

              </div>

              <div className="space-y-6">
                
                <Card className="border-slate-200 shadow-sm bg-white">
                  <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-slate-500" /> Care Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3">
                      {data.tasks?.map((task: any) => (
                        <li key={task.id} className="flex items-start gap-3 cursor-pointer group" onClick={() => toggleChecklist(task.id)}>
                          <div className={`mt-0.5 transition-colors ${checklist[task.id] ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-600'}`}>
                            {checklist[task.id] ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                          </div>
                          <span className={`text-sm transition-all ${checklist[task.id] ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                            Review {task.title.toLowerCase()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    <Link href={`/citizen/health-wallet?member=${selectedMember}`} className="block">
                      <Button variant="outline" className="w-full justify-start gap-2 h-10">
                        <HeartPulse className="h-4 w-4 text-pink-500" /> Open Health Wallet
                      </Button>
                    </Link>
                    <Link href={`/citizen/ask-arogyaai?member=${selectedMember}`} className="block">
                      <Button variant="outline" className="w-full justify-start gap-2 h-10">
                        <Bot className="h-4 w-4 text-blue-500" /> Ask ArogyaAI
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                  Caregiver Mode shows health information available to you for the selected family member based on authorized family access.
                </div>

              </div>

            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
'''

with open(path, 'w', encoding='utf-8') as f:
    f.write(page_content)

print("Created Caregiver Mode page")
