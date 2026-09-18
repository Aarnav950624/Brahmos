export type EventType = "CONSULTATION" | "REPORT" | "PRESCRIPTION" | "MEDICINE" | "VACCINATION" | "FOLLOW_UP";
export type EventStatus = "COMPLETED" | "ACTIVE" | "PENDING" | "SCHEDULED";

export interface HealthTimelineEvent {
  id: string;
  familyMemberId: string;
  date: string;
  type: EventType;
  title: string;
  description: string;
  status?: EventStatus;
  details?: any; // Additional payload based on type
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  gender: string;
  relation: string;
  village: string;
}

export interface WalletOverview {
  lastConsultation: string | null;
  upcomingFollowUp: string | null;
  activeMedicinesCount: number;
  recentReportsCount: number;
  vaccinationStatus: string;
}

// Synthetic Demo Data
import { mockFamilyMembers } from "@/lib/mock-data";

export const DEMO_FAMILY: FamilyMember[] = mockFamilyMembers.map(m => ({
  id: m.id,
  name: m.name,
  age: m.age,
  gender: m.gender,
  relation: m.relationship,
  village: "Navjeevan Gram"
}));

const old_DEMO_FAMILY = [
  {
    id: "member-ramesh",
    name: "Ramesh Patel",
    age: 42,
    gender: "Male",
    relation: "Self",
    village: "Navjeevan Gram"
  },
  {
    id: "member-sita",
    name: "Sita Patel",
    age: 39,
    gender: "Female",
    relation: "Spouse",
    village: "Navjeevan Gram"
  },
  {
    id: "member-aarav",
    name: "Aarav Patel",
    age: 12,
    gender: "Male",
    relation: "Son",
    village: "Navjeevan Gram"
  }
];

export const DEMO_TIMELINE: HealthTimelineEvent[] = [
  // Ramesh Data
  {
    id: "evt-001",
    familyMemberId: "member-ramesh",
    date: "2026-09-20",
    type: "FOLLOW_UP",
    title: "Doctor Follow-up",
    description: "Doctor follow-up scheduled for recent viral fever.",
    status: "SCHEDULED"
  },
  {
    id: "evt-002",
    familyMemberId: "member-ramesh",
    date: "2026-09-15",
    type: "REPORT",
    title: "Complete Blood Count (CBC)",
    description: "Lab report uploaded. Processing complete.",
    status: "COMPLETED",
    details: { reportName: "CBC_Report.pdf", uploader: "Self" }
  },
  {
    id: "evt-003",
    familyMemberId: "member-ramesh",
    date: "2026-09-13",
    type: "MEDICINE",
    title: "Medicine Fulfilled",
    description: "Prescription fulfilled by Arogya Pharmacy.",
    status: "ACTIVE",
    details: { medicines: ["Paracetamol 500mg", "Cetirizine 10mg"] }
  },
  {
    id: "evt-004",
    familyMemberId: "member-ramesh",
    date: "2026-09-12",
    type: "PRESCRIPTION",
    title: "New Prescription",
    description: "2 medicines prescribed by Dr. Priya Mehta.",
    status: "COMPLETED",
    details: { doctor: "Dr. Priya Mehta", count: 2 }
  },
  {
    id: "evt-005",
    familyMemberId: "member-ramesh",
    date: "2026-09-12",
    type: "CONSULTATION",
    title: "Doctor Consultation",
    description: "Consultation for fever and body pain.",
    status: "COMPLETED",
    details: { doctor: "Dr. Priya Mehta" }
  },
  
  // Sita Data
  {
    id: "evt-006",
    familyMemberId: "member-sita",
    date: "2026-08-10",
    type: "VACCINATION",
    title: "Tetanus Booster",
    description: "Administered at local PHC.",
    status: "COMPLETED"
  },
  
  // Aarav Data
  {
    id: "evt-007",
    familyMemberId: "member-aarav",
    date: "2026-09-01",
    type: "CONSULTATION",
    title: "Pediatric Consultation",
    description: "Routine check-up.",
    status: "COMPLETED"
  },
  {
    id: "evt-008",
    familyMemberId: "member-aarav",
    date: "2026-09-01",
    type: "VACCINATION",
    title: "Typhoid Vaccine",
    description: "Routine pediatric immunization.",
    status: "COMPLETED"
  }
];

export function getFamilyOverview(memberId: string): WalletOverview {
  const memberEvents = DEMO_TIMELINE.filter(e => e.familyMemberId === memberId);
  
  const lastConsultation = memberEvents.find(e => e.type === "CONSULTATION")?.date || null;
  const upcomingFollowUp = memberEvents.find(e => e.type === "FOLLOW_UP" && e.status === "SCHEDULED")?.date || null;
  const activeMedicinesCount = memberEvents.filter(e => e.type === "MEDICINE" && e.status === "ACTIVE").length;
  const recentReportsCount = memberEvents.filter(e => e.type === "REPORT").length;
  const vaccinations = memberEvents.filter(e => e.type === "VACCINATION").length;
  
  return {
    lastConsultation,
    upcomingFollowUp,
    activeMedicinesCount,
    recentReportsCount,
    vaccinationStatus: vaccinations > 0 ? "Up to date" : "Needs review"
  };
}
