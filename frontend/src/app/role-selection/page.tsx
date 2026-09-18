"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Activity, Stethoscope, Pill, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore, DemoUser, UserRole, getRolePath } from "@/stores/authStore";

export default function RoleSelectionPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If already logged in, redirect to their dashboard
    if (isAuthenticated && user) {
      router.replace(getRolePath(user.role));
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = (roleId: string, roleName: UserRole) => {
    // Generate a demo user based on the selected role
    let demoUser: DemoUser;
    
    switch (roleName) {
      case "CITIZEN":
        demoUser = { id: "cit-001", name: "Ramesh Patel", role: "CITIZEN", language: "hi" };
        break;
      case "ASHA_WORKER":
        demoUser = { id: "asha-001", name: "Meena Shah", role: "ASHA_WORKER", language: "hi" };
        break;
      case "DOCTOR":
        demoUser = { id: "doc-001", name: "Dr. Priya Mehta", role: "DOCTOR", language: "en" };
        break;
      case "PHARMACY":
        demoUser = { id: "pha-001", name: "Arogya Pharmacy", role: "PHARMACY", language: "en" };
        break;
      case "PANCHAYAT_ADMIN":
        demoUser = { id: "pan-001", name: "Navjeevan Gram Admin", role: "PANCHAYAT_ADMIN", language: "en" };
        break;
    }

    login(demoUser);
    router.push(getRolePath(roleName));
  };

  const roles: { id: string; name: string; roleType: UserRole; desc: string; icon: any; color: string }[] = [
    { id: "citizen", name: "CITIZEN", roleType: "CITIZEN", desc: "Access your health wallet, check symptoms, and book consultations.", icon: User, color: "text-blue-500" },
    { id: "asha", name: "ASHA / ANM", roleType: "ASHA_WORKER", desc: "Manage households, track high-risk cases, and sync offline data.", icon: Activity, color: "text-emerald-500" },
    { id: "doctor", name: "DOCTOR", roleType: "DOCTOR", desc: "View consultation queue, prescribe medicines, and review reports.", icon: Stethoscope, color: "text-purple-500" },
    { id: "pharmacy", name: "PHARMACY / LAB", roleType: "PHARMACY", desc: "Manage medicine requests and diagnostic lab orders.", icon: Pill, color: "text-amber-500" },
    { id: "panchayat", name: "PANCHAYAT ADMIN", roleType: "PANCHAYAT_ADMIN", desc: "View village health pulse, welfare uptake, and aggregated analytics.", icon: Shield, color: "text-slate-700" },
  ];

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center mb-12 mt-8">
        <div className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Demo Mode
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Choose your ArogyaAI experience</h1>
        <p className="text-lg text-slate-600">Synthetic demo data is used for this hackathon environment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {roles.map((role) => (
          <Card key={role.id} className="flex flex-col hover:shadow-lg transition-shadow border-slate-200">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-3 rounded-full bg-slate-100">
                <role.icon className={`h-8 w-8 ${role.color}`} />
              </div>
              <div>
                <CardTitle className="text-xl">{role.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <CardDescription className="text-base text-slate-600 mb-6">
                {role.desc}
              </CardDescription>
              <Button className="w-full" onClick={() => handleLogin(role.id, role.roleType)}>
                Enter as {role.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <Link href="/" className="text-blue-600 hover:underline font-medium">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
