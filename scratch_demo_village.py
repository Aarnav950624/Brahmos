import os

demo_data_ts = '''export const VILLAGE_ID = "navjeevan-gram";
export const VILLAGE_NAME = "Navjeevan Gram";

export const mockFamilyMembers = [
  { id: "member-ramesh", name: "Ramesh Patel", relationship: "Self", age: 42, role: "CITIZEN", gender: "Male" },
  { id: "member-sita", name: "Sita Patel", relationship: "Mother", age: 62, role: "CITIZEN", gender: "Female" },
  { id: "member-aarav", name: "Aarav Patel", relationship: "Son", age: 4, role: "CITIZEN", gender: "Male" }
];

export const mockCitizen = {
  id: "cit-123",
  name: "Ramesh Patel",
  age: 42,
  village: VILLAGE_NAME,
  phone: "+91 98765 43210",
  language: "hi",
  healthWallet: {
    activeMedicines: 2,
    recentReports: 1,
    pendingFollowUps: 1,
  },
  alerts: [
    { id: 1, title: "Diagnostic Report Ready", description: "Your latest CBC report is available.", type: "info" },
    { id: 2, title: "Medicine Dispatched", description: "Your prescription for Paracetamol has been dispatched.", type: "success" },
    { id: 3, title: "Follow-up Reminder", description: "Doctor follow-up is due next week.", type: "warning" },
    { id: 4, title: "Ayushman Bharat", description: "Potentially relevant welfare opportunity based on the information provided.", type: "info" }
  ],
  reports: [
    { id: "rep-001", type: "CBC", date: "2023-10-01", file: "cbc_oct.pdf", previousId: "rep-000" },
    { id: "rep-000", type: "CBC", date: "2023-08-15", file: "cbc_aug.pdf" }
  ],
  prescriptions: [
    { id: "rx-001", doctorId: "doc-001", date: "2023-10-02", medicine: "Paracetamol 500mg", status: "DISPATCHED" }
  ],
  followUps: [
    { id: "fu-001", date: "2023-10-15", reason: "Post-fever review", status: "UPCOMING" }
  ]
};

export const mockAshaStats = {
  householdsVisited: 12,
  followUpsDue: 5,
  highRiskCases: 2,
  pendingSync: 4,
};

export const mockDoctorQueue = [
  { id: "q1", patient: "Suresh Kumar", age: 55, reason: "Chest pain", waitTime: "15 mins", urgency: "high", memberId: "member-suresh" },
  { id: "q2", patient: "Anita Devi", age: 34, reason: "Fever and cough", waitTime: "30 mins", urgency: "medium", memberId: "member-anita" },
  { id: "q3", patient: "Ramesh Patel", age: 42, reason: "Follow-up post fever", waitTime: "45 mins", urgency: "low", memberId: "member-ramesh" },
];

export const mockPharmacyRequests = [
  { id: "r1", patient: "Ramesh Patel", type: "Medicine", item: "Paracetamol 500mg", status: "Dispatched", time: "10:30 AM", prescriptionId: "rx-001" },
  { id: "r2", patient: "Geeta", type: "Lab", item: "Complete Blood Count", status: "Ready", time: "09:15 AM" },
];

export const mockPanchayatStats = {
  population: 1542,
  householdsCovered: 320,
  healthFollowUps: 145,
  awarenessActions: 89,
  villageName: VILLAGE_NAME,
  vaccinationCoverage: "88%",
  recentTrends: ["Increased reports of viral fever in East Block", "High adherence to maternal checkups"]
};

export const resetDemoData = () => {
  // In a real application, this would clear localStorage, invalidate caches, and send a reset signal to the backend.
  console.log("Demo data has been reset to its initial synthetic state.");
  if (typeof window !== "undefined") {
    localStorage.removeItem("asha-offline-store");
    localStorage.removeItem("auth-storage");
    alert("Synthetic Demo Data has been reset. Please reload the page.");
    window.location.reload();
  }
};
'''

demo_data_py = '''from typing import Dict, List, Any

VILLAGE_ID = "navjeevan-gram"
VILLAGE_NAME = "Navjeevan Gram"

DEMO_MEMBERS = {
    "member-ramesh": {"name": "Ramesh Patel", "age": 42, "role": "CITIZEN", "gender": "Male"},
    "member-sita": {"name": "Sita Patel", "age": 62, "role": "CITIZEN", "gender": "Female"},
    "member-aarav": {"name": "Aarav Patel", "age": 4, "role": "CITIZEN", "gender": "Male"},
    "member-suresh": {"name": "Suresh Kumar", "age": 55, "role": "CITIZEN", "gender": "Male"},
    "member-anita": {"name": "Anita Devi", "age": 34, "role": "CITIZEN", "gender": "Female"}
}

DEMO_REPORTS = [
    {"id": "rep-001", "member_id": "member-ramesh", "type": "CBC", "date": "2023-10-01", "findings": "Hemoglobin slightly low, WBC normal."},
    {"id": "rep-000", "member_id": "member-ramesh", "type": "CBC", "date": "2023-08-15", "findings": "Hemoglobin low, WBC normal."}
]

DEMO_PRESCRIPTIONS = [
    {"id": "rx-001", "member_id": "member-ramesh", "medicine": "Paracetamol 500mg", "status": "DISPATCHED", "date": "2023-10-02"}
]

DEMO_FOLLOW_UPS = [
    {"id": "fu-001", "member_id": "member-ramesh", "reason": "Post-fever review", "date": "2023-10-15", "status": "UPCOMING"},
    {"id": "fu-002", "member_id": "member-sita", "reason": "Routine Checkup", "date": "2023-10-20", "status": "UPCOMING"}
]

def get_member(member_id: str) -> Dict[str, Any]:
    return DEMO_MEMBERS.get(member_id, {"name": "Unknown Patient", "age": 0})
'''

# Write frontend demo data
frontend_path = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/frontend/src/lib/mock-data.ts'
with open(frontend_path, 'w', encoding='utf-8') as f:
    f.write(demo_data_ts)

# Write backend demo data
backend_dir = 'c:/Users/Dhairya Bhansali/OneDrive/Documents/CodeCraft/backend/app/services'
os.makedirs(backend_dir, exist_ok=True)
backend_path = os.path.join(backend_dir, 'demo_data.py')
with open(backend_path, 'w', encoding='utf-8') as f:
    f.write(demo_data_py)

print("Created centralized demo data logic.")
