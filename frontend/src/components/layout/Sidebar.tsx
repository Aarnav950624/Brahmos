"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Heart, Home, Activity, FileText, Settings, User, 
  MapPin, Stethoscope, Pill, Shield, Users, ClipboardList, 
  Bell, FileWarning, BookOpen, Clock, Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, UserRole } from "@/stores/authStore";

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  let links: { name: string; href: string; icon: any }[] = [];

  switch (user.role) {
    case "CITIZEN":
      links = [
        { name: "Dashboard", href: "/citizen", icon: Home },
        { name: "Check Symptoms", href: "/citizen/symptom-checker", icon: SearchIcon },
        { name: "Health Wallet", href: "/citizen/health-wallet", icon: Heart },
        { name: "My Requests", href: "/citizen/requests", icon: Bell },
        { name: "Govt Schemes", href: "/citizen/schemes", icon: FileText },
        { name: "Consultations", href: "#", icon: Stethoscope },
        { name: "Medicines", href: "#", icon: Pill },
        { name: "CareMap", href: "#", icon: MapPin },
        { name: "Awareness", href: "#", icon: BookOpen },
        { name: "Profile", href: "#", icon: User },
      ];
      break;
    case "ASHA_WORKER":
      links = [
        { name: "Dashboard", href: "/asha", icon: Home },
        { name: "Households", href: "/asha/households", icon: Users },
        { name: "Visits", href: "#", icon: Activity },
        { name: "Risk Alerts", href: "#", icon: FileWarning },
        { name: "Follow-ups", href: "#", icon: ClipboardList },
        { name: "Sync Queue", href: "#", icon: Clock },
      ];
      break;
    case "DOCTOR":
      links = [
        { name: "Dashboard", href: "/doctor", icon: Home },
        { name: "Consultation Queue", href: "/doctor/queue", icon: Clock },
        { name: "Patients", href: "/doctor/patients", icon: Users },
        { name: "Consultations", href: "#", icon: Stethoscope },
        { name: "Follow-ups", href: "#", icon: ClipboardList },
      ];
      break;
    case "PHARMACY":
      links = [
        { name: "Dashboard", href: "/pharmacy", icon: Home },
        { name: "Pharmacy Requests", href: "/pharmacy/requests", icon: Bell },
        { name: "Lab Requests", href: "/pharmacy/lab-requests", icon: FileText },
        { name: "Inventory", href: "/pharmacy/inventory", icon: Pill },
        { name: "Deliveries", href: "#", icon: MapPin },
      ];
      break;
    case "PANCHAYAT_ADMIN":
      links = [
        { name: "Dashboard", href: "/panchayat", icon: Home },
        { name: "Village Pulse", href: "#", icon: Activity },
        { name: "CareMap", href: "#", icon: MapPin },
        { name: "Awareness", href: "#", icon: BookOpen },
        { name: "Reports", href: "#", icon: FileText },
      ];
      break;
  }

  // Fallback for missing icon in my import (SearchIcon -> Search)
  function SearchIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    )
  }

  return (
    <div className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-slate-900 text-slate-300 border-r border-slate-800">
      <div className="p-6 flex items-center gap-2 text-white border-b border-slate-800">
        <Heart className="h-6 w-6 text-blue-500" />
        <span className="font-bold text-xl tracking-tight">ArogyaAI</span>
      </div>
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {links.map((link, i) => {
          const isActive = pathname === link.href || (link.href !== "#" && pathname.startsWith(link.href) && link.href !== "/");
          return (
            <Link
              key={i}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium hover:bg-slate-800 hover:text-white",
                isActive ? "bg-slate-800 text-white" : ""
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Demo Environment
      </div>
    </div>
  );
}
