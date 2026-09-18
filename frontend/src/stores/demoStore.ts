import { create } from 'zustand';

export type DemoStep = {
  id: number;
  title: string;
  description: string;
  role: string;
  action: string;
  say: string;
  route: string;
};

export const DEMO_STEPS: DemoStep[] = [
  { id: 1, title: 'Citizen Symptom Guidance', description: 'Citizen uses AI to understand symptoms.', role: 'Citizen', action: 'Open AI Guidance', say: 'Instead of replacing doctors, ArogyaAI helps villagers understand what to do next and routes them toward appropriate care.', route: '/citizen/symptom-checker' },
  { id: 2, title: 'Doctor Portal', description: 'Doctor receives patient context.', role: 'Doctor', action: 'View Patient Queue', say: "The doctor sees the patient's relevant history, recent reports and changes in one place.", route: '/doctor/queue' },
  { id: 3, title: 'Report Analysis & Consultation', description: 'Doctor analyzes reports and creates prescription.', role: 'Doctor', action: 'Analyze & Prescribe', say: 'Report changes are highlighted, and the consultation seamlessly connects to prescription.', route: '/doctor/patients/123' },
  { id: 4, title: 'Pharmacy Workflow', description: 'Pharmacy fulfills the prescription.', role: 'Pharmacy', action: 'Accept Request', say: 'The platform connects the prescription to fulfillment, closing the loop.', route: '/pharmacy/requests' },
  { id: 5, title: 'Follow-up / Continuity', description: 'Citizen receives follow-up nudges.', role: 'Citizen', action: 'View Health Wallet', say: 'Care continues after the consultation.', route: '/citizen/health-wallet' },
  { id: 6, title: 'Government Scheme Awareness', description: 'Citizen matches with welfare schemes.', role: 'Citizen', action: 'View Schemes', say: 'Healthcare awareness + welfare awareness in the same platform.', route: '/citizen/schemes' },
  { id: 7, title: 'ASHA Workflow', description: 'ASHA monitors community health risks.', role: 'ASHA', action: 'Check Indicators', say: 'ASHA workers act on AI-driven risk indicators for early intervention.', route: '/asha' },
  { id: 8, title: 'Panchayat Village Pulse', description: 'Panchayat sees aggregated health insights.', role: 'Panchayat Admin', action: 'View Insights', say: 'At the village level, only aggregated insights are surfaced so decision-makers can act without exposing individual clinical records.', route: '/panchayat' },
  { id: 9, title: 'ArogyaAI CareMap', description: 'Visualize nearby facilities.', role: 'Citizen', action: 'View Map', say: 'Connecting citizens to the nearest appropriate physical facility.', route: '/citizen/care-map' },
  { id: 10, title: 'Emergency SOS', description: 'Directs to nearest emergency facility.', role: 'Citizen', action: 'Trigger SOS', say: 'Demo workflow — no real emergency call is placed.', route: '/citizen/sos' },
  { id: 11, title: 'Ask ArogyaAI', description: 'Voice-based health assistant.', role: 'Citizen', action: 'Ask Question', say: 'Citizens can ask health questions in their own language.', route: '/citizen/ask-arogyaai' },
  { id: 12, title: 'Caregiver Mode', description: 'Manage family health.', role: 'Citizen', action: 'Switch Profile', say: 'ArogyaAI supports family-level continuity of care.', route: '/citizen/caregiver' }
];

interface DemoStore {
  isActive: boolean;
  currentStepIndex: number;
  startDemo: () => void;
  stopDemo: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (index: number) => void;
  resetDemoData: () => void;
}

export const useDemoStore = create<DemoStore>((set) => ({
  isActive: false,
  currentStepIndex: 0,
  startDemo: () => set({ isActive: true, currentStepIndex: 0 }),
  stopDemo: () => set({ isActive: false }),
  nextStep: () => set((state) => ({ 
    currentStepIndex: Math.min(state.currentStepIndex + 1, DEMO_STEPS.length - 1) 
  })),
  prevStep: () => set((state) => ({ 
    currentStepIndex: Math.max(state.currentStepIndex - 1, 0) 
  })),
  setStep: (index) => set({ currentStepIndex: index }),
  resetDemoData: () => {
    set({ currentStepIndex: 0 });
    if (typeof window !== 'undefined') {
        alert('Demo sequence restarted.');
    }
  }
}));
