"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Search, PlusSquare, Stethoscope, Pill, TestTube, AlertTriangle, Navigation, Map } from "lucide-react";

export function CareMap() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [nearest, setNearest] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedFacility, setSelectedFacility] = useState<any>(null);

  // Demo user coordinates for Navjeevan Gram
  const demoLat = 23.0200;
  const demoLon = 72.5700;

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/care-map/facilities")
      .then(r => r.json())
      .then(data => {
        setFacilities(data);
        setFiltered(data);
      });
      
    fetch(`http://localhost:8000/api/v1/care-map/nearest?latitude=${demoLat}&longitude=${demoLon}`)
      .then(r => r.json())
      .then(data => {
        setNearest(data);
      });
  }, []);

  useEffect(() => {
    let result = facilities;
    if (typeFilter !== "ALL") {
      result = result.filter(f => f.type === typeFilter);
    }
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(q) || 
        f.area.toLowerCase().includes(q) ||
        f.services.some((s: string) => s.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [search, typeFilter, facilities]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'PHC': return <PlusSquare className="h-4 w-4" />;
      case 'DOCTOR': return <Stethoscope className="h-4 w-4" />;
      case 'PHARMACY': return <Pill className="h-4 w-4" />;
      case 'DIAGNOSTIC_LAB': return <TestTube className="h-4 w-4" />;
      case 'EMERGENCY': return <AlertTriangle className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getDistance = (id: string) => {
    const n = nearest.find(x => x.facility.id === id);
    return n ? n.distance_km : null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col pb-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CareMap</h1>
          <p className="text-slate-500">Find healthcare services near you.</p>
        </div>
        <Badge variant="outline" className="bg-amber-100 text-amber-800">Synthetic Demo Data</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search facility, area, or service..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-9 bg-white" 
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
          {["ALL", "PHC", "DOCTOR", "PHARMACY", "DIAGNOSTIC_LAB", "EMERGENCY"].map(t => (
            <Button 
              key={t} 
              variant={typeFilter === t ? "default" : "outline"}
              onClick={() => setTypeFilter(t)}
              className={typeFilter === t ? "bg-blue-600 text-white" : "bg-white"}
              size="sm"
            >
              {t === "ALL" ? "All" : t.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Map Placeholder & List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="bg-slate-100 border-slate-200 h-64 flex flex-col items-center justify-center text-slate-500 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent bg-[length:20px_20px]" style={{backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)'}}></div>
            <Map className="h-12 w-12 text-slate-400 mb-2 z-10" />
            <p className="font-medium z-10">Map unavailable in demo mode.</p>
            <p className="text-sm z-10">Showing nearby care locations as a list below.</p>
            <Badge className="absolute top-4 right-4 bg-slate-800 text-white">Demo Location: Navjeevan Gram</Badge>
          </Card>
          
          <div className="space-y-4 overflow-y-auto pr-2">
            <h2 className="font-bold text-slate-800">Available Facilities ({filtered.length})</h2>
            {filtered.length === 0 ? (
              <p className="text-slate-500">No healthcare facilities match your filters.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(f => (
                  <Card key={f.id} className={`cursor-pointer transition-colors ${selectedFacility?.id === f.id ? 'border-blue-500 bg-blue-50' : 'hover:border-slate-300'}`} onClick={() => setSelectedFacility(f)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-blue-700 font-bold">
                          {getIcon(f.type)}
                          <span className="text-sm">{f.name}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{f.area}</p>
                      <div className="flex justify-between items-center text-xs">
                        <Badge variant="secondary" className="bg-slate-200 text-slate-700">{f.type.replace("_", " ")}</Badge>
                        <span className="font-medium text-emerald-600">{getDistance(f.id)} km away</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Facility Details */}
        <div>
          {selectedFacility ? (
            <Card className="sticky top-6 border-blue-200 shadow-md">
              <CardHeader className="bg-blue-50 rounded-t-xl border-b border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  {getIcon(selectedFacility.type)}
                  <span className="text-sm font-bold uppercase">{selectedFacility.type.replace("_", " ")}</span>
                </div>
                <CardTitle className="text-xl">{selectedFacility.name}</CardTitle>
                <CardDescription className="text-blue-600 font-medium">{getDistance(selectedFacility.id)} km away</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Address</p>
                  <p className="text-sm text-slate-800">{selectedFacility.address}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Contact (Demo)</p>
                  <p className="text-sm text-slate-800">{selectedFacility.contact}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Availability</p>
                  <p className="text-sm text-slate-800">{selectedFacility.availability}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Services</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedFacility.services.map((s: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Navigation className="h-4 w-4" /> Route Preview
                  </Button>
                  <p className="text-xs text-center text-slate-400 italic">Directions can be opened in your preferred navigation app.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-50 border-slate-200 border-dashed flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6">
              <MapPin className="h-10 w-10 text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Select a facility to view details.</p>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
