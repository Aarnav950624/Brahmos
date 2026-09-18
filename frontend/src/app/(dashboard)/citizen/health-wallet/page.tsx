"use client";

import { useState, useMemo } from "react";
import { 
  Heart, Calendar, FileText, Pill, Stethoscope, Clock, Shield, Search, Upload, Share2, 
  ChevronRight, AlertCircle, Loader2, Plus, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEMO_FAMILY, DEMO_TIMELINE, getFamilyOverview, EventType } from "@/lib/wallet-data";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function HealthWallet() {
  const [selectedMember, setSelectedMember] = useState(DEMO_FAMILY[0].id);
  const [filterType, setFilterType] = useState<EventType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState(DEMO_TIMELINE);

  const activeMember = DEMO_FAMILY.find(m => m.id === selectedMember) || DEMO_FAMILY[0];
  const overview = getFamilyOverview(activeMember.id);

  // Filter events based on active member, type, and search
  const filteredEvents = useMemo(() => {
    return timelineEvents
      .filter(e => e.familyMemberId === activeMember.id)
      .filter(e => filterType === "ALL" || e.type === filterType)
      .filter(e => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [timelineEvents, activeMember.id, filterType, searchQuery]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mock upload
    setIsUploading(true);
    setUploadSuccess(false);

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      
      // Add synthetic record
      const newEvent = {
        id: `evt-mock-${Date.now()}`,
        familyMemberId: activeMember.id,
        date: new Date().toISOString().split('T')[0],
        type: "REPORT" as EventType,
        title: file.name,
        description: "Document uploaded successfully. Processing complete.",
        status: "COMPLETED" as any,
        details: { reportName: file.name, uploader: "Self" }
      };
      
      setTimelineEvents(prev => [newEvent, ...prev]);
      
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1500);
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "CONSULTATION": return <Stethoscope className="h-4 w-4 text-purple-600" />;
      case "REPORT": return <FileText className="h-4 w-4 text-blue-600" />;
      case "PRESCRIPTION": return <FileText className="h-4 w-4 text-indigo-600" />;
      case "MEDICINE": return <Pill className="h-4 w-4 text-amber-600" />;
      case "VACCINATION": return <Shield className="h-4 w-4 text-emerald-600" />;
      case "FOLLOW_UP": return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getEventBg = (type: EventType) => {
    switch (type) {
      case "CONSULTATION": return "bg-purple-100";
      case "REPORT": return "bg-blue-100";
      case "PRESCRIPTION": return "bg-indigo-100";
      case "MEDICINE": return "bg-amber-100";
      case "VACCINATION": return "bg-emerald-100";
      case "FOLLOW_UP": return "bg-orange-100";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Family Health Wallet</h1>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Demo Mode</Badge>
          </div>
          <p className="text-slate-500">Your connected family healthcare journey using synthetic demo data.</p>
        </div>
        
        <div className="flex gap-2">
          {/* Share QR Demo */}
          <Dialog>
            <DialogTrigger>
              <Button variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100">
                <QrCode className="mr-2 h-4 w-4" /> Share Health Summary
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Health Summary</DialogTitle>
                <DialogDescription>
                  Demo Mode: This represents a secure QR-code share for healthcare providers.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-48 h-48 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="h-24 w-24 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-900">{activeMember.name}'s Health Summary</p>
                <p className="text-xs text-slate-500 text-center mt-2 max-w-xs">
                  This QR code would securely grant temporary access to a doctor or pharmacist. Real health records are never exposed publicly.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Upload Button */}
          <div className="relative">
            <input 
              type="file" 
              accept=".pdf,.jpg,.png" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              onChange={handleUpload}
              disabled={isUploading}
              title="Upload PDF, JPG, or PNG"
            />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-sm rounded-md border border-emerald-200 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Document uploaded and added to the timeline successfully.
        </div>
      )}

      {/* Family Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {DEMO_FAMILY.map(member => (
          <button
            key={member.id}
            onClick={() => setSelectedMember(member.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              selectedMember === member.id 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {member.name} ({member.relation})
          </button>
        ))}
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium mb-1">Profile</p>
            <p className="font-bold text-slate-900">{activeMember.name}</p>
            <p className="text-xs text-slate-600">{activeMember.age}y • {activeMember.gender}</p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Last Consultation</p>
                <p className="font-bold text-slate-900">{overview.lastConsultation ? new Date(overview.lastConsultation).toLocaleDateString() : 'None'}</p>
              </div>
              <Stethoscope className="h-4 w-4 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Active Medicines</p>
                <p className="font-bold text-slate-900">{overview.activeMedicinesCount}</p>
              </div>
              <Pill className="h-4 w-4 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Upcoming Follow-up</p>
                <p className="font-bold text-slate-900 text-sm">
                  {overview.upcomingFollowUp ? new Date(overview.upcomingFollowUp).toLocaleDateString() : 'None Scheduled'}
                </p>
              </div>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Timeline */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">Health Timeline</h2>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="text" 
                placeholder="Search records..." 
                className="pl-9 w-full sm:w-64 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {["ALL", "CONSULTATION", "REPORT", "PRESCRIPTION", "MEDICINE", "VACCINATION", "FOLLOW_UP"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterType === type 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {type === "ALL" ? "All Records" : type.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Events */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200 border-dashed">
                <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <h3 className="text-slate-900 font-medium">No records found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters or search.</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-200 ml-4 space-y-6 pb-4">
                {filteredEvents.map((evt) => (
                  <div key={evt.id} className="relative pl-6">
                    {/* Timeline Node */}
                    <div className={`absolute -left-3 top-1 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${getEventBg(evt.type)}`}>
                      {getEventIcon(evt.type)}
                    </div>
                    
                    {/* Event Card */}
                    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{evt.type.replace("_", " ")}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs text-slate-500">{new Date(evt.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-base">{evt.title}</h3>
                          </div>
                          
                          {evt.status && (
                            <Badge variant="secondary" className={`shrink-0 ${
                              evt.status === 'COMPLETED' ? 'bg-slate-100 text-slate-600' :
                              evt.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                              evt.status === 'SCHEDULED' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {evt.status}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-4">{evt.description}</p>
                        
                        {/* Event Specific Actions */}
                        <div className="flex flex-wrap gap-2">
                          {evt.type === "REPORT" && (
                            <Dialog>
                              <DialogTrigger>
                                <Button variant="outline" size="sm" className="h-8 text-xs">
                                  <AlertCircle className="mr-1.5 h-3.5 w-3.5" /> Explain this report
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>AI Report Explanation</DialogTitle>
                                  <DialogDescription>
                                    Coming soon in the next AI module.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200 text-sm">
                                  This feature will interpret laboratory values and provide easy-to-understand health guidance. (Placeholder for next hackathon prompt).
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                          
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            View Details <ChevronRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
