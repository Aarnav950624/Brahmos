"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, UserRole, getRolePath } from "@/stores/authStore";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !user) {
      router.replace("/role-selection");
      return;
    }

    // Role-based access control
    const rolePath = getRolePath(user.role);
    
    // If the user is on a protected route but it doesn't match their role
    // Example: ASHA worker trying to access /doctor
    if (pathname.startsWith("/citizen") && user.role !== "CITIZEN") {
      router.replace(rolePath);
    } else if (pathname.startsWith("/asha") && user.role !== "ASHA_WORKER") {
      router.replace(rolePath);
    } else if (pathname.startsWith("/doctor") && user.role !== "DOCTOR") {
      router.replace(rolePath);
    } else if (pathname.startsWith("/pharmacy") && user.role !== "PHARMACY") {
      router.replace(rolePath);
    } else if (pathname.startsWith("/panchayat") && user.role !== "PANCHAYAT_ADMIN") {
      router.replace(rolePath);
    } else {
      setIsAuthorized(true);
    }
  }, [mounted, isAuthenticated, user, pathname, router]);

  if (!mounted || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
