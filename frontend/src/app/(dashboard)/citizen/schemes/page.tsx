"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function GovernmentSchemes() {
  const [matchData, setMatchData] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Generate deterministic demo profile matches
    const demoProfile = {
      age: 42,
      pregnancy_status: true,
      children_count: 2,
      children_ages: [4, 12],
      income_band: "BPL"
    };

    fetch("http://localhost:8000/api/v1/ai/scheme-match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: demoProfile })
    })
    .then(r => r.json())
    .then(data => {
      // Fetch scheme details for matches
      fetch("http://localhost:8000/api/v1/schemes")
        .then(r => r.json())
        .then(schemes => {
          const matchedSchemes = data.matches.map((m: any) => {
            const scheme = schemes.find((s: any) => s.id === m.scheme_id);
            return { ...m, scheme };
          });
          setMatchData({ matches: matchedSchemes, opportunities: data.awareness_opportunities });
        });
    })
    .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Government Schemes</h1>
          <p className="text-slate-500">Discover health and welfare programs that may be relevant to your family.</p>
        </div>
        <Badge variant="outline" className="bg-amber-100 text-amber-800">Synthetic Demo Data</Badge>
      </div>

      <div className="mb-4">
        <Input placeholder="Search schemes..." value={search} onChange={e => setSearch(e.target.value)} className="w-full max-w-sm bg-white" />
      </div>

      {!matchData ? (
        <p>Loading scheme matches...</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">Potentially Relevant Schemes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchData.matches.filter((m: any) => m.scheme.name.toLowerCase().includes(search.toLowerCase())).map((m: any) => (
                <Card key={m.scheme_id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex justify-between">
                      <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-200">{m.scheme.category.replace("_", " ")}</Badge>
                      <Badge variant="outline" className="text-emerald-700 border-emerald-300">Potentially Relevant</Badge>
                    </div>
                    <CardTitle>{m.scheme.name}</CardTitle>
                    <CardDescription>{m.scheme.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-slate-50 border rounded text-sm text-slate-700">
                      <strong>Why am I seeing this?</strong>
                      <ul className="list-disc pl-4 mt-1">
                        {m.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/citizen/schemes/${m.scheme_id}`} className="w-full">
                      <Button className="w-full">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {matchData.matches.length === 0 && <p className="text-sm text-slate-500">No potentially relevant schemes were identified from the available information.</p>}
          </section>

          {matchData.opportunities.length > 0 && (
            <section className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-bold text-blue-900 mb-2">Awareness Opportunities</h3>
              <ul className="list-disc pl-5 text-sm text-blue-800 space-y-1">
                {matchData.opportunities.map((opp: string, i: number) => (
                  <li key={i}>{opp}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
