"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity, Heart, Shield, Stethoscope, Users, Pill, Play } from "lucide-react";
import { useDemoStore } from "@/stores/demoStore";

export default function LandingPage() {
  const [healthStatus, setHealthStatus] = useState<string>("Checking backend health...");
  const startDemo = useDemoStore((state) => state.startDemo);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/api/v1/health`);
        if (res.ok) {
          const data = await res.json();
          setHealthStatus(data.message || "Backend connected successfully!");
        } else {
          setHealthStatus("Failed to connect to backend: Invalid response");
        }
      } catch (err) {
        setHealthStatus("Failed to connect to backend: Network error");
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl tracking-tight text-blue-900">ArogyaAI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/role-selection" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Demo Login
          </Link>
          <Link href="/role-selection" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700 transition-colors">
            Enter ArogyaAI
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center">
        <section className="w-full max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            Intelligent eVillage System
          </h1>
          <p className="text-2xl text-blue-600 font-semibold mb-6">"From Awareness to Action."</p>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-10">
            ArogyaAI is a closed, role-based ecosystem bridging the healthcare access and awareness gap.
            Connecting Citizens, ASHA workers, Doctors, Pharmacies, and Panchayats in one intelligent platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/role-selection" className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-md shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              Enter ArogyaAI <ArrowRight className="h-5 w-5" />
            </Link>
            <button onClick={startDemo} className="px-8 py-4 bg-white text-blue-600 border border-blue-200 text-lg font-medium rounded-md shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
              <Play className="h-5 w-5" /> Start Hackathon Demo
            </button>
          </div>
          <div className="mt-6">
            <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
              Demo Environment - Uses Synthetic Data
            </span>
          </div>
        </section>

        <section className="w-full bg-white py-20 border-t border-b">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">The ArogyaAI Ecosystem</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto mb-16 text-center">
              <div className="flex flex-col items-center"><Users className="h-10 w-10 text-blue-500 mb-2" /><span className="font-semibold">Citizen</span></div>
              <ArrowRight className="hidden md:block h-6 w-6 text-slate-300" />
              <div className="flex flex-col items-center"><Activity className="h-10 w-10 text-emerald-500 mb-2" /><span className="font-semibold">ASHA/ANM</span></div>
              <ArrowRight className="hidden md:block h-6 w-6 text-slate-300" />
              <div className="flex flex-col items-center"><Stethoscope className="h-10 w-10 text-purple-500 mb-2" /><span className="font-semibold">Doctor</span></div>
              <ArrowRight className="hidden md:block h-6 w-6 text-slate-300" />
              <div className="flex flex-col items-center"><Pill className="h-10 w-10 text-amber-500 mb-2" /><span className="font-semibold">Pharmacy/Lab</span></div>
              <ArrowRight className="hidden md:block h-6 w-6 text-slate-300" />
              <div className="flex flex-col items-center"><Shield className="h-10 w-10 text-slate-700 mb-2" /><span className="font-semibold">Panchayat</span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "AI Health Guidance", desc: "Voice-first symptom checks and risk indicators.", icon: Activity, color: "text-blue-500" },
                { title: "Family Health Wallet", desc: "Unified medical records and prescriptions.", icon: Heart, color: "text-red-500" },
                { title: "Doctor Consultation", desc: "One-tap remote consultations and referrals.", icon: Stethoscope, color: "text-purple-500" },
                { title: "Medicine & Labs", desc: "Track fulfillment of prescriptions and lab requests.", icon: Pill, color: "text-amber-500" },
                { title: "Government Schemes", desc: "AI-powered welfare matching for villagers.", icon: Shield, color: "text-emerald-500" },
                { title: "Village Health Pulse", desc: "Aggregated health and welfare analytics.", icon: Users, color: "text-slate-700" }
              ].map((feature, i) => (
                <div key={i} className="p-6 rounded-xl border bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
                  <feature.icon className={`h-8 w-8 mb-4 ${feature.color}`} />
                  <h3 className="text-xl font-bold mb-2 text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 px-6 text-center">
        <p className="mb-4">© 2026 ArogyaAI Project. Hackathon Prototype.</p>
        <div className="inline-block p-4 bg-slate-800 rounded-lg text-sm border border-slate-700">
          <span className="font-semibold text-slate-300">System Status:</span> {healthStatus}
        </div>
      </footer>
    </div>
  );
}
