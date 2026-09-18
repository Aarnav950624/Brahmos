export const mockCitizen = {
  id: "cit-123",
  name: "Ramesh Patel",
  age: 42,
  village: "Navjeevan Gram",
  phone: "+91 98765 43210",
  language: "hi",
  healthWallet: {
    activeMedicines: 2,
    recentReports: 1,
    pendingFollowUps: 1,
  },
  alerts: [
    { id: 1, title: "Vaccination Due", description: "COVID-19 Booster dose is due this week.", type: "warning" },
    { id: 2, title: "Ayushman Bharat", description: "You are eligible for the PM-JAY health scheme.", type: "info" }
  ]
};

export const mockAshaStats = {
  householdsVisited: 12,
  followUpsDue: 5,
  highRiskCases: 2,
  pendingSync: 4,
};

export const mockDoctorQueue = [
  { id: "q1", patient: "Suresh Kumar", age: 55, reason: "Chest pain", waitTime: "15 mins", urgency: "high" },
  { id: "q2", patient: "Anita Devi", age: 34, reason: "Fever and cough", waitTime: "30 mins", urgency: "medium" },
  { id: "q3", patient: "Ramesh Patel", age: 42, reason: "Follow-up", waitTime: "45 mins", urgency: "low" },
];

export const mockPharmacyRequests = [
  { id: "r1", patient: "Kamlesh", type: "Medicine", item: "Paracetamol 500mg", status: "Processing", time: "10:30 AM" },
  { id: "r2", patient: "Geeta", type: "Lab", item: "Complete Blood Count", status: "Ready", time: "09:15 AM" },
];

export const mockPanchayatStats = {
  population: 1542,
  householdsCovered: 320,
  healthFollowUps: 145,
  awarenessActions: 89,
};
