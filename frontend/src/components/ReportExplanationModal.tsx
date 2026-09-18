import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ReportExplanationModal({ reportId, reportName }: { reportId: string, reportName: string }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchAnalysis = async (includeComparison: boolean) => {
    setLoading(true);
    try {
      // Hardcoded URL for demo
      const res = await fetch("http://localhost:8000/api/v1/ai/report-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: reportId,
          language: "en",
          include_comparison: includeComparison
        })
      });
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "HIGH": return "text-red-600 bg-red-100";
      case "LOW": return "text-orange-600 bg-orange-100";
      case "NORMAL": return "text-emerald-600 bg-emerald-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "IMPROVED") return <ArrowUpRight className="h-4 w-4 text-emerald-600" />;
    if (trend === "WORSENED") return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-slate-600" />;
  };

  return (
    <Dialog onOpenChange={(open) => {
      if (open && !data) {
        fetchAnalysis(false);
      }
    }}>
      <DialogTrigger>
        <Button variant="outline" size="sm" className="h-8 text-xs border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
          <AlertCircle className="mr-1.5 h-3.5 w-3.5" /> Explain & Compare
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            AI Report Analysis
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Demo Data</Badge>
          </DialogTitle>
          <DialogDescription>
            {reportName}
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-sm text-slate-500">ArogyaAI is analyzing your report...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-100">
              <h4 className="font-semibold mb-1">Executive Summary</h4>
              <p className="text-sm">{data.summary}</p>
            </div>

            {/* Findings */}
            <div>
              <h4 className="font-semibold mb-3">Key Findings</h4>
              <div className="space-y-3">
                {data.findings.map((f: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{f.parameter}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(f.status)}`}>
                          {f.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{f.explanation}</p>
                    </div>
                    <div className="font-mono text-sm font-bold shrink-0">{f.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison / What Changed */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">What Changed?</h4>
                {!data.comparison && (
                  <Button variant="outline" size="sm" onClick={() => fetchAnalysis(true)}>
                    Compare with previous report
                  </Button>
                )}
              </div>
              
              {data.comparison && (
                <div className="space-y-3">
                  {data.comparison.map((c: any, i: number) => (
                    <div key={i} className="p-3 border border-indigo-100 rounded-lg bg-indigo-50/50">
                      <div className="flex items-center gap-2 mb-2">
                        {getTrendIcon(c.trend)}
                        <span className="font-medium text-slate-900">{c.parameter}</span>
                        <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{c.trend}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-mono mb-2">
                        <span className="text-slate-500 line-through">{c.previous_value}</span>
                        <span>→</span>
                        <span className="font-bold">{c.current_value}</span>
                      </div>
                      <p className="text-xs text-slate-600">{c.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Action */}
            <div className="p-4 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-100">
              <h4 className="font-semibold mb-1">Recommended Action</h4>
              <p className="text-sm">{data.recommended_action}</p>
            </div>

            <p className="text-xs text-slate-400 text-center">{data.disclaimer}</p>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-slate-500">Failed to load analysis.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
