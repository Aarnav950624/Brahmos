import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

base = "c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/app/(dashboard)"

# --- CITIZEN SOS PAGE ---
sos_page = """"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, MapPin, Phone, ArrowLeft, Loader2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EmergencySOS() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nearest, setNearest] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);

  // Demo coordinates (Navjeevan Gram)
  const demoLat = 23.0200;
  const demoLon = 72.5700;

  useEffect(() => {
    if (confirmed) {
      setLoading(true);
      // Fetch nearest emergency facility
      fetch(`http://localhost:8000/api/v1/emergency/nearest?latitude=${demoLat}&longitude=${demoLon}`)
        .then(r => r.json())
        .then(facilities => {
          if (facilities.length > 0) {
            setNearest(facilities[0]);
            
            // Create simulated SOS event
            fetch("http://localhost:8000/api/v1/emergency/sos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                source: "Citizen Dashboard SOS",
                priority: "EMERGENCY",
                facility_id: facilities[0].facility.id,
                context: "Citizen triggered Emergency SOS manually."
              })
            })
            .then(r => r.json())
            .then(evt => {
              setEvent(evt);
              setLoading(false);
            });
          } else {
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    }
  }, [confirmed]);

  if (!confirmed) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Card className="border-red-500 shadow-xl shadow-red-100">
          <CardHeader className="bg-red-50 text-center pb-8 pt-10 border-b border-red-100">
            <div className="mx-auto bg-red-100 text-red-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <CardTitle className="text-3xl font-bold text-red-700">Emergency Assistance</CardTitle>
            <CardDescription className="text-lg text-red-600 font-medium mt-2">
              Do you need emergency assistance?
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 text-center space-y-6">
            <p className="text-slate-700 font-medium text-lg">
              If you or someone nearby has severe or life-threatening symptoms, seek immediate emergency medical help.
            </p>
            <p className="text-slate-500 text-sm italic">
              ArogyaAI is not a substitute for emergency medical services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white animate-pulse" onClick={() => setConfirmed(true)}>
                Continue to Emergency Guidance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Emergency Guidance</h1>
      </div>

      <div className="bg-red-600 text-white p-6 rounded-xl shadow-lg border-2 border-red-700 relative overflow-hidden">
        <AlertTriangle className="absolute -right-4 -top-4 w-32 h-32 text-red-700 opacity-50" />
        <h2 className="text-2xl font-bold mb-2 relative z-10">Seek immediate emergency medical assistance.</h2>
        <ul className="list-disc pl-5 font-medium relative z-10 space-y-1">
          <li>Do not delay care while waiting for ArogyaAI.</li>
          <li>Follow local emergency procedures.</li>
        </ul>
      </div>

      {loading ? (
        <Card className="p-12 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
          <p>Locating nearest emergency facilities...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {nearest ? (
              <Card className="border-blue-200 shadow-md">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <Badge className="w-fit mb-2 bg-red-100 text-red-700 hover:bg-red-200">Nearest Emergency Facility</Badge>
                  <CardTitle>{nearest.facility.name}</CardTitle>
                  <CardDescription className="text-blue-700 font-bold">{nearest.distance_km} km away</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex gap-2">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{nearest.facility.area}</p>
                      <p className="text-xs text-slate-500">{nearest.facility.address}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border text-sm">
                    <span className="font-bold text-slate-700">Services: </span>
                    <span className="text-slate-600">{nearest.facility.services.join(", ")}</span>
                  </div>
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 w-full justify-center">
                    Demo Availability: {nearest.facility.availability}
                  </Badge>
                  <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/citizen/care-map")}>
                    View on CareMap
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-6 text-center text-slate-500">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p>Emergency facility information is currently unavailable. Seek immediate local emergency assistance.</p>
              </Card>
            )}

            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5 text-slate-500" /> Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button size="lg" className="w-full bg-slate-800 hover:bg-slate-900 text-white mb-2">
                  Call Local Emergency Service
                </Button>
                <p className="text-xs text-center text-slate-500">Use your local emergency service number.</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {event && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
                      <Info className="w-5 h-5" /> Simulated SOS Event
                    </CardTitle>
                    <Badge variant="outline" className="bg-white border-amber-300 text-amber-700">Demo Mode</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded border border-amber-100">
                    <span className="text-slate-500">Event ID</span>
                    <span className="font-mono font-medium text-right">{event.id}</span>
                    
                    <span className="text-slate-500">Status</span>
                    <span className="font-bold text-blue-600 text-right">{event.status}</span>
                    
                    <span className="text-slate-500">Priority</span>
                    <span className="font-bold text-red-600 text-right">{event.priority}</span>
                  </div>
                  <p className="text-amber-800 font-medium text-center italic mt-4">
                    Demo only — no real emergency service has been contacted.
                  </p>
                </CardContent>
              </Card>
            )}
            
            <div className="text-center text-xs text-slate-400">
              <p>Using demo location: Navjeevan Gram</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"""

write_file(f"{base}/citizen/sos/page.tsx", sos_page)
print("Created /citizen/sos/page.tsx")

# --- UPDATE SYMPTOM CHECKER ---
symptom_path = f"{base}/citizen/symptom-checker/page.tsx"
with open(symptom_path, 'r', encoding='utf-8') as f:
    symp = f.read()

# Replace the emergency button to wrap with Link
target_btn = """{result.urgency === "EMERGENCY" && (
                    <Button className="bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-lg shadow-red-500/30">
                      Emergency Help
                    </Button>
                  )}"""

replacement_btn = """{result.urgency === "EMERGENCY" && (
                    <Link href="/citizen/sos">
                      <Button className="bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-lg shadow-red-500/30">
                        Emergency Help
                      </Button>
                    </Link>
                  )}"""

symp = symp.replace('import { Button } from "@/components/ui/button";', 'import { Button } from "@/components/ui/button";\nimport Link from "next/link";')
symp = symp.replace(target_btn, replacement_btn)

with open(symptom_path, 'w', encoding='utf-8') as f:
    f.write(symp)
print("Updated /citizen/symptom-checker/page.tsx")

# --- UPDATE ASHA VISIT PAGE FOR SOS ---
asha_visit = f"{base}/asha/households/[id]/visit/new/page.tsx"
with open(asha_visit, 'r', encoding='utf-8') as f:
    asha_content = f.read()

# Find the place to inject Emergency Guidance if EMERGENCY risk
# It has a "Recommended AI Action" block. We'll append there.

if "const [risk, setRisk] = useState" in asha_content:
    target_action = """{risk === "HIGH" && (
              <div className="p-3 bg-red-50 rounded border border-red-100">
                <p className="text-sm font-bold text-red-800">Recommend immediate escalation to Doctor Portal.</p>
              </div>
            )}"""
    
    replacement_action = """{risk === "HIGH" && (
              <div className="p-3 bg-red-50 rounded border border-red-100 space-y-2">
                <p className="text-sm font-bold text-red-800">Recommend immediate escalation to Doctor Portal.</p>
              </div>
            )}
            {risk === "EMERGENCY" && (
              <div className="p-4 bg-red-600 rounded-lg shadow-md text-white space-y-3">
                <h3 className="font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Emergency Guidance</h3>
                <p className="text-sm">Seek immediate emergency medical assistance. Do not delay care.</p>
                <Link href="/citizen/sos">
                  <Button variant="secondary" className="w-full text-red-700 font-bold bg-white hover:bg-red-50">
                    Open Emergency SOS
                  </Button>
                </Link>
              </div>
            )}"""
    
    asha_content = asha_content.replace('import { Button } from "@/components/ui/button";', 'import { Button } from "@/components/ui/button";\nimport Link from "next/link";')
    # Let's see if we can find the exact text in the file.
    
    # Actually, a simpler replace:
    # Just add the emergency state to the select options if it's not there.
    
with open(asha_visit, 'w', encoding='utf-8') as f:
    f.write(asha_content.replace(target_action, replacement_action))
    
print("Updated /asha/households/[id]/visit/new/page.tsx")
