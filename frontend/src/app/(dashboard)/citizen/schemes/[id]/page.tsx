"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, ExternalLink, CheckCircle } from "lucide-react";

export default function SchemeDetail({ params }: { params: { id: string } }) {
  const [scheme, setScheme] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/schemes/${params.id}`)
      .then(r => r.json())
      .then(setScheme)
      .catch(() => {});
      
    // Check if saved
    fetch("http://localhost:8000/api/v1/citizen/schemes/saved")
      .then(r => r.json())
      .then(savedList => {
        if (savedList.includes(params.id)) setSaved(true);
      });
  }, [params.id]);

  const handleSave = () => {
    fetch(`http://localhost:8000/api/v1/citizen/schemes/save?scheme_id=${params.id}`, { method: "POST" })
      .then(() => setSaved(true));
  };

  if (!scheme) return <div className="p-8 text-center text-slate-500">Loading scheme information...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-2"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Schemes</Button>
      
      <div>
        <Badge className="mb-3 bg-blue-100 text-blue-700">{scheme.category.replace("_", " ")}</Badge>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{scheme.name}</h1>
        <p className="text-lg text-slate-600">{scheme.description}</p>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
        <strong>Important:</strong> Eligibility should be verified using the current official requirements. Scheme information may change.
      </div>

      <Card>
        <CardHeader><CardTitle>Eligibility & Target Audience</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p><strong>Who it's for:</strong> {scheme.target_audience}</p>
          <p><strong>Eligibility Summary:</strong> {scheme.eligibility_summary}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Required Documents</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {scheme.documents_required.map((doc: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-1" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>How to Apply</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>{scheme.application_guidance}</p>
          <p className="text-sm text-slate-500 italic">Note: {scheme.verification_note}</p>
          
          <div className="flex gap-4 pt-4 border-t border-slate-100 mt-4">
            <Button onClick={handleSave} variant={saved ? "outline" : "default"} disabled={saved} className={saved ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "bg-blue-600 text-white"}>
              <Save className="mr-2 h-4 w-4" /> {saved ? "Scheme Saved" : "Save Scheme"}
            </Button>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" /> Check Official Source
            </Button>
          </div>
          <p className="text-xs text-center text-slate-400 mt-2">Verify current details through the relevant government portal or local government office.</p>
        </CardContent>
      </Card>
    </div>
  );
}
