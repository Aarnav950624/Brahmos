"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ListenButton } from "@/components/ui/listen-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Mic, MicOff, AlertCircle, AlertTriangle, CheckCircle, Activity, Loader2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Type definitions for API
interface SymptomRequest {
  symptoms: string;
  language: string;
}

interface SymptomResponse {
  urgency: "LOW" | "MODERATE" | "HIGH" | "EMERGENCY";
  summary: string;
  possible_concerns: string[];
  recommended_action: string;
  red_flags: string[];
  when_to_seek_help: string;
  disclaimer: string;
}

export default function SymptomChecker() {
  const { t, language } = useTranslation();
  const [symptoms, setSymptoms] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SymptomResponse | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
      } else {
        setIsSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
      
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        if (currentTranscript) {
          setSymptoms((prev) => prev ? prev + " " + currentTranscript : currentTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setError("Microphone permission denied. Please type your symptoms.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [language]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    
    setError(null);
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        setSymptoms("");
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
        setIsRecording(false);
      }
    }
  };

  const getPlaceholder = () => {
    if (language.startsWith("en")) return "Example: I have had fever and body pain since yesterday.";
    if (language.startsWith("hi")) return "उदाहरण: मुझे कल से बुखार और शरीर में दर्द है।";
    if (language.startsWith("gu")) return "ઉદાહરણ: મને ગઈકાલથી તાવ અને શરીરમાં દુખાવો છે.";
    return "Describe your symptoms...";
  };

  const checkSymptoms = async () => {
    if (!symptoms.trim()) {
      setError("Please describe your symptoms first.");
      return;
    }
    
    setError(null);
    setIsAnalyzing(true);
    setResult(null);

    // Stop recording if it was active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/v1/ai/symptom-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms,
          language: language.split('-')[0] // en, hi, gu
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI service.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      // Deterministic Fallback on error (Network, 500, etc)
      setResult({
        urgency: "MODERATE",
        summary: "Your symptoms should be reviewed by a healthcare professional if they persist or worsen.",
        possible_concerns: ["General illness requiring monitoring"],
        recommended_action: "Consider contacting an ASHA worker or booking a doctor consultation.",
        red_flags: [],
        when_to_seek_help: "Seek urgent care if severe or rapidly worsening symptoms develop (like difficulty breathing, severe pain).",
        disclaimer: "This is general AI guidance (safe fallback used due to network issue) and not a diagnosis."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyConfig = (urgency: string) => {
    switch(urgency) {
      case "EMERGENCY": return { color: "bg-red-600", text: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle };
      case "HIGH": return { color: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: AlertCircle };
      case "MODERATE": return { color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Activity };
      case "LOW": return { color: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: CheckCircle };
      default: return { color: "bg-slate-500", text: "text-slate-700", bg: "bg-slate-50", border: "border-slate-200", icon: Activity };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Check Your Symptoms</h1>
          <p className="text-slate-600">Describe how you are feeling and ArogyaAI will help you understand the next appropriate step.</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 shrink-0">
          AI Guidance — Not a Diagnosis
        </Badge>
      </div>

      {!result && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 pb-4 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Input Symptoms
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            {!isSupported && (
              <div className="mb-4 p-3 bg-amber-50 text-amber-800 text-sm rounded-md border border-amber-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Voice input isn't supported in this browser. You can type your symptoms instead.</span>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm rounded-md border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSupported && (
              <div className="flex flex-col items-center justify-center py-6 mb-4">
                <button
                  onClick={toggleRecording}
                  disabled={isAnalyzing}
                  className={`relative flex items-center justify-center h-24 w-24 rounded-full transition-all ${
                    isRecording 
                      ? 'bg-red-100 text-red-600 border-2 border-red-300 animate-pulse' 
                      : 'bg-blue-100 text-blue-600 border-2 border-transparent hover:bg-blue-200'
                  }`}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                </button>
                <p className={`mt-3 font-medium ${isRecording ? 'text-red-600' : 'text-slate-600'}`}>
                  {isRecording ? "Listening..." : "Tap to speak"}
                </p>
              </div>
            )}

            <div className="relative">
              <textarea
                className="w-full h-32 p-3 border border-slate-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                placeholder={getPlaceholder()}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t flex justify-end gap-3 pt-4 pb-4">
            <Button variant="ghost" onClick={() => setSymptoms("")} disabled={!symptoms || isAnalyzing}>Clear</Button>
            <Button onClick={checkSymptoms} disabled={!symptoms.trim() || isAnalyzing} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isAnalyzing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                "Analyze Symptoms"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {result && (() => {
        const config = getUrgencyConfig(result.urgency);
        const Icon = config.icon;
        
        return (
          <div className="space-y-6">
            <Card className={`border-2 ${config.border} overflow-hidden shadow-md`}>
              <div className={`${config.color} text-white px-6 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2 font-bold text-lg tracking-wide">
                  <Icon className="h-5 w-5" />
                  {result.urgency} URGENCY
                </div>
              </div>
              <CardContent className={`pt-6 ${config.bg}`}>
                <h3 className="text-lg font-bold text-slate-900 mb-2">AI Guidance</h3>
                <p className="text-slate-700 mb-6 text-lg">{result.summary}</p>
                
                {result.red_flags && result.red_flags.length > 0 && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-md">
                    <h4 className="font-bold text-red-900 flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5" /> Emergency Indicators Detected
                    </h4>
                    <ul className="list-disc pl-5 text-red-800 space-y-1">
                      {result.red_flags.map((flag, idx) => (
                        <li key={idx} className="font-medium">{flag}</li>
                      ))}
                    </ul>
                    <p className="mt-3 font-bold text-red-900 uppercase">Seek urgent medical care.</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {result.possible_concerns && result.possible_concerns.length > 0 && (
                    <div className="bg-white p-4 rounded-md border shadow-sm">
                      <h4 className="font-semibold text-slate-900 mb-2">Possible Concerns</h4>
                      <ul className="list-disc pl-5 text-slate-700 space-y-1">
                        {result.possible_concerns.map((concern, idx) => (
                          <li key={idx}>{concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="bg-white p-4 rounded-md border shadow-sm">
                    <h4 className="font-semibold text-slate-900 mb-2">When to Seek Help</h4>
                    <p className="text-slate-700">{result.when_to_seek_help}</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-md border shadow-sm border-blue-200 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Recommended Action</h4>
                  <p className="text-slate-700 text-lg font-medium">{result.recommended_action}</p>
                </div>
                
                <div className="text-xs text-slate-500 border-t pt-4">
                  <span className="font-semibold uppercase">Disclaimer: </span> {result.disclaimer}
                </div>
              </CardContent>
              <CardFooter className="bg-white border-t p-4 flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => { setResult(null); setSymptoms(""); }}>
                  Check Again
                </Button>
                <div className="flex-grow flex justify-end gap-3 flex-wrap">
                  <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    Contact ASHA
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Book Doctor <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  {result.urgency === "EMERGENCY" && (
                    <Link href="/citizen/sos">
                      <Button className="bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-lg shadow-red-500/30">
                        Emergency Help
                      </Button>
                    </Link>
                  )}
                </div>
              </CardFooter>
            </Card>
            
            <div className="text-center">
              <Badge variant="outline" className="bg-slate-100">Demo Mode</Badge>
            </div>
          </div>
        );
      })()}
      
      {!result && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Recent Checks</h3>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-md border shadow-sm flex justify-between items-center opacity-70">
              <div>
                <p className="font-medium text-sm text-slate-800">"Fever and body pain since 2 days"</p>
                <p className="text-xs text-slate-500">Today, 10:45 AM</p>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">MODERATE</Badge>
            </div>
            <div className="bg-white p-3 rounded-md border shadow-sm flex justify-between items-center opacity-70">
              <div>
                <p className="font-medium text-sm text-slate-800">"Mild cough"</p>
                <p className="text-xs text-slate-500">Yesterday</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">LOW</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
