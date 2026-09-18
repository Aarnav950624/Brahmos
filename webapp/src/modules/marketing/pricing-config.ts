/** Central HealNexus pricing presentation — not billed by a backend. */

export const PRICING_CURRENCY = "₹";

export const INDIVIDUAL_PLANS = [
  {
    id: "free",
    name: "Free",
    monthlyLabel: "₹0",
    period: "/ month",
    annualLabel: null as string | null,
    subtitle: "For essential everyday care.",
    badge: null as string | null,
    featured: false,
    cta: "Get Started Free",
    href: "/signup",
    features: [
      "Personal Health Profile",
      "Basic Health Passport",
      "Care Plan",
      "Medication Reminders",
      "Daily Care Tasks",
      "Basic Check-ins",
      "Basic Recovery Tracking",
      "Caregiver Connection",
      "Health Education",
      "Hospital / Health Centre Finder",
      "Emergency Contacts",
      "Essential Offline Health Information",
    ],
  },
  {
    id: "care",
    name: "HealNexus Care",
    monthlyLabel: "₹99",
    period: "/ month",
    annualLabel: "₹899 / year",
    subtitle: "Personalized AI-powered care support.",
    badge: "Most popular",
    featured: true,
    cta: "Start with Care",
    href: "/signup",
    includesPrior: "Everything in Free, plus:",
    features: [
      "AI Care Companion",
      "Voice Care Assistant",
      "AI Check-in / AI Checkup",
      "Medicine Camera Scanner",
      "Personalized Care-Plan Assistance",
      "Advanced Recovery Insights",
      "Smart Medication Support",
      "Personal Health Summaries",
      "Enhanced Caregiver Alerts",
      "English / Hindi / Gujarati AI support",
    ],
  },
  {
    id: "family",
    name: "Family",
    monthlyLabel: "₹199",
    period: "/ month",
    annualLabel: "₹1,799 / year",
    subtitle: "Healthcare support for the whole family.",
    badge: null,
    featured: false,
    cta: "Choose Family",
    href: "/signup",
    includesPrior: "Everything in Care, plus:",
    features: [
      "Up to 5 family members",
      "Shared Family Dashboard",
      "Family Medication Tracking",
      "Caregiver Access",
      "Family Appointment Reminders",
      "Important Care Alerts",
      "Individual Health Passports",
      "Voice AI for family members",
      "Family recovery overview",
    ],
  },
] as const;

export const COMPARISON_ROWS: Array<{
  feature: string;
  free: boolean;
  care: boolean;
  family: boolean;
}> = [
  { feature: "Health Passport", free: true, care: true, family: true },
  { feature: "Care Plan", free: true, care: true, family: true },
  { feature: "Medication reminders", free: true, care: true, family: true },
  { feature: "Daily check-ins", free: true, care: true, family: true },
  { feature: "Recovery tracking", free: true, care: true, family: true },
  { feature: "AI Care Companion", free: false, care: true, family: true },
  { feature: "Voice AI", free: false, care: true, family: true },
  { feature: "AI Checkup", free: false, care: true, family: true },
  { feature: "Medicine Scanner", free: false, care: true, family: true },
  { feature: "Advanced insights", free: false, care: true, family: true },
  { feature: "Caregiver support", free: true, care: true, family: true },
  { feature: "Family members", free: false, care: false, family: true },
];

export const FAMILY_CIRCLE = [
  "Parent",
  "Grandparent",
  "Spouse",
  "Child",
] as const;

export const FAMILY_PLAN = {
  monthlyLabel: "₹199 / month",
  seats: "Up to 5 family members",
  href: "/signup",
};

export const ORG_PLANS = [
  {
    id: "starter",
    name: "Starter",
    priceLabel: "₹4,999",
    period: "/ month",
    capacity: "Up to 100 active patients",
    badge: null as string | null,
    featured: false,
    cta: "Talk to Us",
    href: "/contact",
    features: [
      "Doctor Dashboard",
      "Patient Monitoring",
      "Care Plans",
      "Medication Tracking",
      "Check-ins",
      "AI Doctor Visit Brief",
      "Caregiver Support",
      "Basic Analytics",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    priceLabel: "₹14,999",
    period: "/ month",
    capacity: "Up to 500 active patients",
    badge: "For growing teams",
    featured: true,
    cta: "Talk to Us",
    href: "/contact",
    includesPrior: "Everything in Starter, plus:",
    features: [
      "Advanced Analytics",
      "AI-assisted Workflows",
      "Rural / Health Worker Module",
      "Health Camps",
      "Organization Administration",
      "Advanced Reporting",
      "Offline Field Workflows",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "Custom",
    period: "",
    capacity: "Hospitals, networks and large organizations",
    badge: null,
    featured: false,
    cta: "Contact Sales",
    href: "/contact",
    features: [
      "Multi-hospital support",
      "Organization-level administration",
      "Custom deployment",
      "Healthcare integrations",
      "Advanced security controls",
      "Dedicated support",
      "Custom workflows",
      "Scalable patient management",
    ],
  },
] as const;

export const ORG_PRICING_DISCLAIMER =
  "Proposed pricing — final plans may vary based on deployment and requirements.";

export const SPONSORED_STEPS = [
  "Hospital / NGO / CSR / Public Health Program",
  "Sponsors HealNexus access",
  "Village / Community",
  "Patients + Families + Health Workers",
] as const;

export const SPONSORED_CAPABILITIES = [
  "Offline health workflows",
  "Health-worker screening",
  "Health camps",
  "Essential Health Passport",
  "Voice accessibility",
  "Multilingual support",
] as const;

export const PRICING_FAQS = [
  {
    q: "Can I use HealNexus for free?",
    a: "Yes. The Free plan provides core care-management features. Advanced AI capabilities are available in paid plans.",
  },
  {
    q: "Does HealNexus replace my doctor?",
    a: "No. HealNexus provides care organization and AI-assisted support. It does not diagnose, prescribe or replace healthcare professionals.",
  },
  {
    q: "What does the ₹99 Care plan include?",
    a: "It adds AI Care Companion, Voice AI, AI Checkup, Medicine Camera Scanner and advanced personalized care-support features.",
  },
  {
    q: "Can I manage my family members?",
    a: "Yes. The Family plan supports up to 5 family members with caregiver and shared-care features.",
  },
  {
    q: "Can HealNexus work without internet?",
    a: "Selected rural/field workflows and essential health information can work offline and synchronize when connectivity becomes available.",
  },
  {
    q: "Can hospitals deploy HealNexus?",
    a: "Yes. HealNexus includes organization-focused workflows for patient monitoring, doctor dashboards, care plans, AI Visit Briefs and analytics.",
  },
  {
    q: "Does HealNexus diagnose medical conditions?",
    a: "No. AI features are designed to assist with care information and organization, not diagnosis or prescribing.",
  },
  {
    q: "Are ABHA and PM-JAY features real integrations?",
    a: "No. Current ABHA identity and PM-JAY guidance in HealNexus are demo / prototype flows for education and navigation — not live government APIs or official enrolments.",
  },
];

/** Legacy alias for any remaining marketing imports. */
export const PRICING = INDIVIDUAL_PLANS;
