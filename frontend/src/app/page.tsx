"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<string>("Checking backend health...");

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
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50 dark:bg-slate-900">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col space-y-4">
        <h1 className="text-4xl font-bold text-blue-600">ArogyaAI</h1>
        <p className="text-xl">Intelligent eVillage System for Health & Wealth Awareness</p>
        <p className="text-md italic text-gray-600">"From Awareness to Action."</p>
        
        <div className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">System Status</h2>
          <p className="text-lg">
            Backend API: <span className="font-semibold text-green-600">{healthStatus}</span>
          </p>
        </div>
      </div>
    </main>
  );
}
