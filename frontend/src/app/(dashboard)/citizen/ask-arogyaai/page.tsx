"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Search, Activity, Bot, User, Mic, Send, MicOff, CheckCircle, ShieldAlert, FileText, Pill, Calendar, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ListenButton } from "@/components/ui/listen-button";
import Link from "next/link";

export default function AskArogyaAI() {
  const { t, language } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput((prev) => prev + (prev ? " " : "") + finalTranscript);
        }
      };

      rec.onerror = (event: any) => {
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const getVoiceLanguage = () => {
    switch (language) {
      case "hi": return "hi-IN";
      case "gu": return "gu-IN";
      default: return "en-IN";
    }
  };

  const toggleRecording = () => {
    if (!recognition) return;
    
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.lang = getVoiceLanguage();
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg = { role: "user", content: text, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    
    try {
      const res = await fetch("http://localhost:8000/api/v1/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || "demo-user-1",
          role: user?.role || "CITIZEN",
          question: text,
          language: language
        })
      });
      
      const data = await res.json();
      
      const botMsg = {
        role: "assistant",
        content: data.answer,
        keyPoints: data.key_points,
        sources: data.source_context,
        actionLabel: data.action_label,
        actionUrl: data.action_url,
        safetyNote: data.safety_note,
        disclaimer: data.disclaimer,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I am currently unable to process your request. Please try again later.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const suggestedQuestions = [
    "What does my latest blood report show?",
    "When is my next follow-up?",
    "What medicines are currently listed?",
    "Why am I seeing this notification?"
  ];
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            Ask ArogyaAI
          </h1>
          <p className="text-slate-500">Ask questions about your health information and get simple explanations.</p>
        </div>
      </div>
      
      <Card className="border-slate-200 shadow-sm h-[600px] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-6">
              <div className="bg-blue-50 p-4 rounded-full">
                <Bot className="h-12 w-12 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">How can I help you today?</h3>
                <p className="text-slate-500 max-w-md">I can securely answer questions about your health records, reports, prescriptions, and follow-ups.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {suggestedQuestions.map((q, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="bg-white hover:bg-slate-50 text-slate-600 px-3 py-2 cursor-pointer font-normal border-slate-200"
                    onClick={() => handleSend(q)}
                  >
                    {q}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700"}`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[85%] ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-slate-50 border border-slate-200 text-slate-800"} rounded-2xl p-4 shadow-sm`}>
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {msg.sources.map((src: any, i: number) => (
                        <span key={i} className="text-[10px] font-medium bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                          {src.source_type === "REPORT" && <FileText className="h-3 w-3" />}
                          {src.source_type === "FOLLOW_UP" && <Calendar className="h-3 w-3" />}
                          {src.source_type === "PRESCRIPTION" && <Pill className="h-3 w-3" />}
                          {src.source_type === "NOTIFICATION" && <Bell className="h-3 w-3" />}
                          {src.source_type === "SYSTEM" && <ShieldAlert className="h-3 w-3" />}
                          {src.label}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start gap-4">
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <ListenButton text={msg.content} className="shrink-0 h-8 w-8 !min-h-0 !min-w-0 p-0 rounded-full bg-white/80" />
                    )}
                  </div>
                  
                  {msg.keyPoints && msg.keyPoints.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {msg.keyPoints.map((kp: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {msg.actionUrl && msg.actionLabel && (
                    <div className="mt-4">
                      <Link href={msg.actionUrl}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                          {msg.actionLabel}
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  {msg.safetyNote && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs p-2 rounded-md flex items-start gap-1.5">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{msg.safetyNote}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                <Bot className="h-4 w-4 text-indigo-700 animate-pulse" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150" />
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="p-3 bg-slate-50 border-t border-slate-200 flex-col gap-2">
          <div className="w-full flex gap-2">
            {recognition && (
              <Button 
                variant={isRecording ? "destructive" : "outline"}
                className={`h-12 w-12 rounded-full shrink-0 ${isRecording ? "animate-pulse" : ""}`}
                onClick={toggleRecording}
                disabled={isLoading}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            )}
            <input
              type="text"
              className="flex-1 h-12 bg-white border border-slate-300 rounded-full px-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
              placeholder="Type your question here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend(input);
              }}
              disabled={isLoading}
            />
            <Button 
              className="h-12 w-12 rounded-full shrink-0 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-medium flex items-center justify-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            ArogyaAI provides health information and summaries. It does not replace a doctor.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
