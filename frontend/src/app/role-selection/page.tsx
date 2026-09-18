import Link from "next/link";
import { User, Activity, Stethoscope, Pill, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RoleSelectionPage() {
  const roles = [
    { id: "citizen", name: "CITIZEN", desc: "Access your health wallet, check symptoms, and book consultations.", icon: User, color: "text-blue-500", path: "/citizen" },
    { id: "asha", name: "ASHA / ANM", desc: "Manage households, track high-risk cases, and sync offline data.", icon: Activity, color: "text-emerald-500", path: "/asha" },
    { id: "doctor", name: "DOCTOR", desc: "View consultation queue, prescribe medicines, and review reports.", icon: Stethoscope, color: "text-purple-500", path: "/doctor" },
    { id: "pharmacy", name: "PHARMACY / LAB", desc: "Manage medicine requests and diagnostic lab orders.", icon: Pill, color: "text-amber-500", path: "/pharmacy" },
    { id: "panchayat", name: "PANCHAYAT ADMIN", desc: "View village health pulse, welfare uptake, and aggregated analytics.", icon: Shield, color: "text-slate-700", path: "/panchayat" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center mb-12 mt-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">Choose your ArogyaAI experience</h1>
        <p className="text-lg text-slate-600">Select a role to enter the demo environment with synthetic data.</p>
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
              <Link href={role.path} className="w-full">
                <Button className="w-full">
                  Enter as {role.name}
                </Button>
              </Link>
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
