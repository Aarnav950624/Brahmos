"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Activity, FileText, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  
  // Basic links for demo. In a real app, these would vary by role.
  const links = [
    { name: "Dashboard", href: pathname, icon: Home },
    { name: "Health Wallet", href: "#", icon: Heart },
    { name: "Reports", href: "#", icon: FileText },
    { name: "Profile", href: "#", icon: User },
    { name: "Settings", href: "#", icon: Settings },
  ];

  return (
    <div className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-slate-900 text-slate-300 border-r border-slate-800">
      <div className="p-6 flex items-center gap-2 text-white border-b border-slate-800">
        <Heart className="h-6 w-6 text-blue-500" />
        <span className="font-bold text-xl tracking-tight">ArogyaAI</span>
      </div>
      <div className="flex-1 py-6 px-4 space-y-2">
        {links.map((link, i) => (
          <Link
            key={i}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium hover:bg-slate-800 hover:text-white",
              i === 0 ? "bg-slate-800 text-white" : ""
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.name}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Demo Environment
      </div>
    </div>
  );
}
