import os

indicator_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/components/offline-status.tsx'
os.makedirs(os.path.dirname(indicator_path), exist_ok=True)
with open(indicator_path, 'w', encoding='utf-8') as f:
    f.write('''"use client";

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
''')

sync_page_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/app/(dashboard)/asha/sync/page.tsx'
os.makedirs(os.path.dirname(sync_page_path), exist_ok=True)
with open(sync_page_path, 'w', encoding='utf-8') as f:
    f.write('''"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Trash2, Database, UploadCloud } from "lucide-react";
import { useSyncStore } from "@/stores/syncStore";
import { useAuthStore } from "@/stores/authStore";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AshaSyncCenter() {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);
  const { isDemoOffline, setDemoOffline, queue, syncQueue, clearSynced } = useSyncStore();
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

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

  const effectivelyOffline = !isOnline || isDemoOffline;
  const pendingItems = queue.filter(q => q.status === 'PENDING');
  const failedItems = queue.filter(q => q.status === 'FAILED');
  const syncedItems = queue.filter(q => q.status === 'SYNCED');

  const handleSync = async () => {
    if (effectivelyOffline) return;
    setSyncing(true);
    await syncQueue(user?.id || "asha-1");
    setSyncing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="h-8 w-8 text-blue-600" />
            Sync Center
          </h1>
          <p className="text-slate-500">Manage offline visits and synchronize data</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-slate-100 p-3 rounded-lg border border-slate-200">
          <Switch 
            id="demo-offline" 
            checked={isDemoOffline} 
            onCheckedChange={setDemoOffline} 
          />
          <Label htmlFor="demo-offline" className="cursor-pointer flex items-center gap-1.5 font-medium text-slate-700">
            {isDemoOffline ? <WifiOff className="h-4 w-4 text-slate-500" /> : <Wifi className="h-4 w-4 text-emerald-500" />}
            Demo Offline Mode
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className={`p-4 rounded-full mb-3 ${effectivelyOffline ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
              {effectivelyOffline ? <WifiOff className="h-8 w-8" /> : <Wifi className="h-8 w-8" />}
            </div>
            <h3 className="font-bold text-slate-800">{effectivelyOffline ? "Offline" : "Online"}</h3>
            <p className="text-sm text-slate-500">{effectivelyOffline ? "Changes will be saved locally" : "Connected to server"}</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50 shadow-sm md:col-span-2">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                <UploadCloud className="h-5 w-5" /> Pending Sync
              </h3>
              <div className="mt-2 flex gap-4 text-sm text-amber-700">
                <span><strong>{pendingItems.length}</strong> Pending</span>
                <span><strong>{failedItems.length}</strong> Failed</span>
              </div>
            </div>
            <Button 
              onClick={handleSync} 
              disabled={effectivelyOffline || (pendingItems.length === 0 && failedItems.length === 0) || syncing}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row justify-between items-center pb-2 border-b border-slate-100">
          <CardTitle className="text-lg">Offline Queue</CardTitle>
          {syncedItems.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearSynced} className="text-slate-500 hover:text-red-600">
              <Trash2 className="h-4 w-4 mr-1" /> Clear Synced
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {queue.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No offline items in queue.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {[...queue].reverse().map((item) => (
                <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      {item.operation === 'CREATE_VISIT' ? 'Household Visit' : item.operation}
                      {item.status === 'PENDING' && <Badge className="bg-amber-100 text-amber-700 border-none hover:bg-amber-100">Pending</Badge>}
                      {item.status === 'FAILED' && <Badge className="bg-red-100 text-red-700 border-none hover:bg-red-100">Failed (x{item.retryCount})</Badge>}
                      {item.status === 'SYNCED' && <Badge className="bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-100">Synced</Badge>}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {item.householdName || 'Unknown Household'} • {new Date(item.createdAt).toLocaleString()}
                    </div>
                    {item.errorMessage && (
                      <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {item.errorMessage}
                      </div>
                    )}
                  </div>
                  <div>
                    {item.status === 'SYNCED' ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : item.status === 'FAILED' ? (
                      <Button variant="outline" size="sm" onClick={handleSync} disabled={effectivelyOffline} className="border-amber-200 text-amber-700 hover:bg-amber-50">
                        Retry
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <p className="text-xs text-center text-slate-400">Offline records are stored locally on this device until they are synchronized with the server.</p>
    </div>
  );
}
''')
print("Created Sync UI components")
