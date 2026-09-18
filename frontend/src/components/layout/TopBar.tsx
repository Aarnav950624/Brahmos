import { Bell, Search, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4 md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-bold text-lg text-blue-900">ArogyaAI</span>
      </div>
      
      <div className="hidden md:flex items-center">
        {/* Breadcrumbs or search could go here */}
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
          Synthetic Data
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </Button>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="Demo User" />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-xs">DU</AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-sm">
            <p className="font-medium text-slate-700 leading-none">Demo User</p>
            <Link href="/role-selection" className="text-xs text-blue-600 hover:underline leading-none">Change Role</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
