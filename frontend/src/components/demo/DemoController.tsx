"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDemoStore, DEMO_STEPS } from "@/stores/demoStore";
import { ChevronLeft, ChevronRight, X, Play, RotateCcw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DemoController() {
  const { isActive, currentStepIndex, stopDemo, nextStep, prevStep, setStep, resetDemoData } = useDemoStore();
  const router = useRouter();
  const pathname = usePathname();
  
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    if (isActive) {
      const step = DEMO_STEPS[currentStepIndex];
      // Navigate to the step route if we aren't already there.
      // (Simple check: if route matches, or if we want to force push. Let's just force push on change).
      if (!pathname.startsWith(step.route)) {
        router.push(step.route);
      }
    }
  }, [isActive, currentStepIndex, router, pathname]);

  if (!isActive) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4 pointer-events-none">
      <Card className="shadow-2xl border-blue-200 bg-white/95 backdrop-blur-md pointer-events-auto flex flex-col md:flex-row overflow-hidden">
        
        {/* Progress & Controls */}
        <div className="flex-1 flex flex-col justify-between p-4 border-r border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Hackathon Demo Mode</Badge>
              <Badge variant="outline">Step {currentStepIndex + 1} of {DEMO_STEPS.length}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={stopDemo} className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <h3 className="font-bold text-lg text-slate-900">{currentStep.title}</h3>
            <p className="text-sm text-slate-500 mb-2">{currentStep.description}</p>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded inline-flex">
              Role: <span className="text-slate-900">{currentStep.role}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStepIndex === 0}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button variant="default" size="sm" onClick={nextStep} disabled={currentStepIndex === DEMO_STEPS.length - 1}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowScript(!showScript)} className="text-slate-500">
                <MessageSquare className="h-4 w-4 mr-1" /> Script
              </Button>
              <Button variant="ghost" size="sm" onClick={resetDemoData} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <RotateCcw className="h-4 w-4 mr-1" /> Restart Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Optional Script Panel */}
        {showScript && (
          <div className="w-full md:w-1/3 bg-slate-50 p-4 flex flex-col">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Presenter Script</h4>
            <p className="text-sm text-slate-700 italic border-l-4 border-blue-400 pl-3 py-1">
              "{currentStep.say}"
            </p>
          </div>
        )}

      </Card>
    </div>
  );
}
