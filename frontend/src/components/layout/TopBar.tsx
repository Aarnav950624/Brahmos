"use client";
import { useEffect, useState } from "react";
import Link from "next/link";


import { Bell, Search, Menu, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { RoleBadge } from "@/components/ui/role-badge";

export function TopBar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4 md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-bold text-lg text-blue-900">ArogyaAI</span>
      </div>
      
      <div className="hidden md:flex items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
          Demo Mode
        </div>
        {user.role === "CITIZEN" || user.role === "ASHA_WORKER" ? (
          <Link href={user.role === "CITIZEN" ? "/citizen/notifications" : "/asha/notifications"}>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white animate-pulse"></span>
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-slate-600" />
          </Button>
        )}
        
        <div className="flex items-center gap-3 border-l pl-4 ml-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt={user.name} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-sm">
            <p className="font-medium text-slate-700 leading-tight">{user.name}</p>
            <RoleBadge role={user.role} className="mt-1 border-0 p-0 text-xs bg-transparent hover:bg-transparent" />
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="ml-2" title="Logout">
            <LogOut className="h-5 w-5 text-slate-500 hover:text-red-600 transition-colors" />
          </Button>
        </div>
      </div>
    </header>
  );
}
