"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { FileText, Printer, Share2, AlertCircle, Bot, Heart, Activity, Syringe, ClipboardList, Clock, ArrowRight, ShieldAlert, Sparkles, User, Info, Pill } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ListenButton } from "@/components/ui/listen-button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function VisitBrief() {
  const { t, language } = useTranslation();
  const user = useAuthStore((state) => state.user);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  
  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/visit-brief/summary?user_id=${user?.id || 'demo-1'}&language=${language}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setReason(d.reason_for_visit || "");
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [user, language]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4" />
      Generating your Visit Brief...
    </div>
  );
  
  if (!data) return (
    <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-200">
      No information available in your ArogyaAI records.
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:w-full print:max-w-none print:m-0 print:space-y-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-blue-600 print:text-black" />
            Doctor Visit Brief
          </h1>
          <p className="text-slate-500 print:text-black mt-1">A simple summary of your recent health information to help you prepare for your consultation.</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> Print / Save
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      <div className="print:hidden bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 flex items-start gap-2 text-sm">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <p><strong>This is a summary of your records.</strong> You can show this to your doctor to help them understand your recent health events quickly. It does not replace professional medical advice.</p>
      </div>

      {/* AI SUMMARY */}
      {data.ai_summary && (
        <Card className="border-blue-200 bg-blue-50 shadow-sm print:border-slate-300 print:bg-white print:shadow-none">
          <CardHeader className="pb-3 border-b border-blue-100 print:border-slate-200">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-lg print:text-black">
                <Bot className="h-5 w-5" /> AI Visit Summary
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-blue-600 bg-white px-2 py-1 rounded-full border border-blue-100 print:text-slate-600">Based on your ArogyaAI records</span>
                <ListenButton text={data.ai_summary.summary} className="print:hidden h-8 w-8 !min-h-0 !min-w-0 p-0 rounded-full bg-white text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-slate-700 print:text-black">
            <p className="leading-relaxed">{data.ai_summary.summary}</p>
            {data.ai_summary.safety_note && (
              <div className="mt-4 flex items-start gap-2 text-xs text-blue-600/80 print:text-slate-500 border-t border-blue-100 pt-3">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <p>{data.ai_summary.safety_note}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN - MAIN CLINICAL INFO */}
        <div className="md:col-span-2 space-y-6">
          
          <Card className="shadow-sm border-slate-200 print:shadow-none print:border-slate-300">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center justify-between print:text-black">
                <span className="flex items-center gap-2"><User className="h-5 w-5 text-indigo-500" /> Reason for Visit</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <textarea 
                className="w-full text-slate-800 p-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none resize-none print:border-none print:p-0 print:bg-white print:resize-none font-medium"
                rows={2}
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="What would you like to discuss with the doctor?"
              />
            </CardContent>
          </Card>

          {data.recent_reports?.length > 0 && (
            <Card className="shadow-sm border-slate-200 print:shadow-none print:border-slate-300">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center justify-between print:text-black">
                  <span className="flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-500" /> Recent Reports & Changes</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">From Health Wallet</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {data.recent_reports.map((report: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 border border-slate-100 bg-slate-50 rounded-lg print:border-slate-200 print:bg-white">
                    <div>
                      <h4 className="font-bold text-slate-800">{report.name}</h4>
                      <p className="text-sm text-slate-500">{new Date(report.date).toLocaleDateString()}</p>
                    </div>
                    <Link href={report.url} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline print:hidden">
                      View full report <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
                
                {data.recent_changes?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-amber-500" /> What Changed
                    </h4>
                    <div className="space-y-2">
                      {data.recent_changes.map((change: any, i: number) => (
                        <div key={i} className="grid grid-cols-4 gap-2 text-sm items-center">
                          <div className="font-medium text-slate-800 col-span-1">{change.parameter}</div>
                          <div className="text-slate-500 text-center"><span className="text-[10px] block uppercase">Previous</span>{change.previous}</div>
                          <div className="text-slate-800 text-center font-medium"><span className="text-[10px] text-slate-500 block uppercase">Current</span>{change.current}</div>
                          <div className={`text-right font-bold ${change.change.startsWith('+') ? 'text-rose-600' : 'text-blue-600'}`}>
                            <span className="text-[10px] text-slate-500 block uppercase font-normal">Change</span>
                            {change.change}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {data.current_medications?.length > 0 && (
            <Card className="shadow-sm border-slate-200 print:shadow-none print:border-slate-300">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center justify-between print:text-black">
                  <span className="flex items-center gap-2"><Pill className="h-5 w-5 text-purple-500" /> Current Medicines</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">From Prescription</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {data.current_medications.map((med: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 border border-slate-100 bg-slate-50 rounded-lg print:border-slate-200 print:bg-white">
                    <div>
                      <h4 className="font-bold text-slate-800">{med.name}</h4>
                      <p className="text-sm text-slate-500">Prescribed: {new Date(med.date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-none">{med.dosage}</Badge>
                  </div>
                ))}
                <p className="text-xs text-slate-400 mt-2">Medication information is shown from your recorded prescription. Discuss changes with your doctor.</p>
              </CardContent>
            </Card>
          )}

        </div>
        
        {/* RIGHT COLUMN - SECONDARY INFO */}
        <div className="space-y-6">

          <Card className="shadow-sm border-slate-200 bg-amber-50 print:bg-white print:border-slate-300">
            <CardHeader className="pb-3 border-b border-amber-100 print:border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2 print:text-black">
                <AlertCircle className="h-5 w-5 text-amber-600" /> Questions for Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {data.questions_for_doctor?.map((q: any) => (
                  <li key={q.id} className="flex gap-2 items-start text-sm font-medium text-amber-900 print:text-slate-800">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs mt-0.5">?</span>
                    <span className="leading-tight pt-1">{q.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 print:hidden">
                <Link href="/citizen/ask-arogyaai">
                  <Button variant="outline" size="sm" className="w-full gap-2 border-amber-200 text-amber-700 hover:bg-amber-100 bg-white">
                    <Bot className="h-4 w-4" /> Ask ArogyaAI about this
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {data.upcoming_follow_up && (
            <Card className="shadow-sm border-slate-200 print:shadow-none print:border-slate-300">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center justify-between print:text-black">
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /> Next Follow-up</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-800">{new Date(data.upcoming_follow_up.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</div>
                  <div className="text-sm text-slate-500 mt-1">{data.upcoming_follow_up.type}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {data.recent_concerns?.length > 0 && (
            <Card className="shadow-sm border-slate-200 print:shadow-none print:border-slate-300">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2 print:text-black">
                  <Activity className="h-4 w-4 text-red-500" /> Recent Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {data.recent_concerns.map((con: any, i: number) => (
                  <div key={i} className="text-sm">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      {con.symptom}
                      {con.urgency === "HIGH" && <Badge className="bg-red-100 text-red-700 border-none px-1 py-0 text-[10px]">Urgent</Badge>}
                    </div>
                    <div className="text-xs text-slate-500">{con.date}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
      
    </div>
  );
}
