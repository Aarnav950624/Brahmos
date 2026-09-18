"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useSyncStore } from "@/stores/syncStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Badge } from "./ui/badge";

export function OfflineStatus() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(true);
  const { isDemoOffline, queue } = useSyncStore();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const pendingCount = queue.filter(q => q.status !== 'SYNCED').length;
  const effectivelyOffline = !isOnline || isDemoOffline;

  if (!effectivelyOffline && pendingCount === 0) {
    return null; // Don't show anything if online and fully synced
  }

  if (!effectivelyOffline && pendingCount > 0) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5 px-3 py-1">
        <Wifi className="h-3 w-3" />
        Online — {pendingCount} Pending Sync
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-slate-800 text-white border-slate-700 flex items-center gap-1.5 px-3 py-1">
      <WifiOff className="h-3 w-3" />
      {isDemoOffline ? "Demo Offline Mode" : "Offline"} — Changes saved locally
    </Badge>
  );
}
