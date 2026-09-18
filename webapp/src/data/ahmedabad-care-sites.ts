import {
  AHMEDABAD_DEMO_HOSPITALS,
  haversineKm,
} from "@/data/ahmedabad-hospitals";
import type { DemoHospital } from "@/types/domain";

export type CareKind =
  | "phc"
  | "chc"
  | "district_hospital"
  | "government_hospital"
  | "hospital"
  | "pharmacy"
  | "lab"
  | "emergency";

export type CareNeedFilter =
  | "all"
  | "phc"
  | "hospital"
  | "pharmacy"
  | "lab"
  | "emergency";

export interface CareSite extends DemoHospital {
  care_kind: CareKind;
  hours: string;
  rural_tier: number;
}

const EXTRA_SITES: CareSite[] = [
  {
    id: "phc-sabarmati",
    name: "PHC Sabarmati",
    hospital_type: "government",
    care_kind: "phc",
    rural_tier: 0,
    hours: "08:00-17:00",
    latitude: 23.081,
    longitude: 72.587,
    address: "Sabarmati, Ahmedabad, Gujarat",
    area: "Sabarmati",
    city: "Ahmedabad",
    pmjay_empanelled: false,
    is_emergency: false,
    phone: "108",
    services: ["OPD", "Immunisation", "ANC", "Basic medicines"],
  },
  {
    id: "phc-odhav",
    name: "PHC Odhav",
    hospital_type: "government",
    care_kind: "phc",
    rural_tier: 0,
    hours: "08:00-17:00",
    latitude: 23.025,
    longitude: 72.67,
    address: "Odhav, Ahmedabad, Gujarat",
    area: "Odhav",
    city: "Ahmedabad",
    pmjay_empanelled: false,
    is_emergency: false,
    phone: "108",
    services: ["OPD", "NCD screening", "Basic medicines"],
  },
  {
    id: "chc-sanand",
    name: "CHC Sanand",
    hospital_type: "government",
    care_kind: "chc",
    rural_tier: 1,
    hours: "08:00-20:00",
    latitude: 22.992,
    longitude: 72.382,
    address: "Sanand, Ahmedabad district, Gujarat",
    area: "Sanand",
    city: "Ahmedabad",
    pmjay_empanelled: true,
    is_emergency: true,
    phone: "108",
    services: ["24×7 casualty (limited)", "Delivery", "X-ray", "Pharmacy"],
    pmjay_departments: ["General Medicine", "Maternity"],
  },
  {
    id: "chc-dholka",
    name: "CHC Dholka",
    hospital_type: "government",
    care_kind: "chc",
    rural_tier: 1,
    hours: "08:00-20:00",
    latitude: 22.727,
    longitude: 72.441,
    address: "Dholka, Ahmedabad district, Gujarat",
    area: "Dholka",
    city: "Ahmedabad",
    pmjay_empanelled: true,
    is_emergency: true,
    phone: "108",
    services: ["OPD", "Inpatient", "Lab", "Referral to district hospital"],
  },
  {
    id: "jan-aushadhi-asarwa",
    name: "Jan Aushadhi Kendra — Asarwa",
    hospital_type: "government",
    care_kind: "pharmacy",
    rural_tier: 4,
    hours: "09:00-19:00",
    latitude: 23.048,
    longitude: 72.605,
    address: "Near Civil Hospital, Asarwa, Ahmedabad",
    area: "Asarwa",
    city: "Ahmedabad",
    pmjay_empanelled: false,
    is_emergency: false,
    phone: "18001808080",
    services: ["Generic medicines", "Government scheme drugs"],
  },
  {
    id: "amc-pharmacy-maninagar",
    name: "AMC Municipal Pharmacy — Maninagar",
    hospital_type: "government",
    care_kind: "pharmacy",
    rural_tier: 4,
    hours: "09:00-18:00",
    latitude: 22.997,
    longitude: 72.603,
    address: "Maninagar, Ahmedabad, Gujarat",
    area: "Maninagar",
    city: "Ahmedabad",
    pmjay_empanelled: false,
    is_emergency: false,
    phone: "+91-79-25391811",
    services: ["Retail pharmacy", "OTC + prescribed generics"],
  },
  {
    id: "unipath-lab-navrangpura",
    name: "Unipath Specialty Laboratory",
    hospital_type: "private",
    care_kind: "lab",
    rural_tier: 5,
    hours: "07:00-21:00",
    latitude: 23.036,
    longitude: 72.561,
    address: "Navrangpura, Ahmedabad, Gujarat",
    area: "Navrangpura",
    city: "Ahmedabad",
    pmjay_empanelled: false,
    is_emergency: false,
    phone: "+91-79-26405555",
    services: ["Blood tests", "HbA1c", "Lipid profile", "Home collection"],
  },
  {
    id: "gov-lab-civil",
    name: "Civil Hospital Central Lab",
    hospital_type: "government",
    care_kind: "lab",
    rural_tier: 3,
    hours: "08:00-16:00",
    latitude: 23.0508,
    longitude: 72.6035,
    address: "Civil Hospital campus, Asarwa",
    area: "Asarwa",
    city: "Ahmedabad",
    pmjay_empanelled: true,
    is_emergency: false,
    phone: "+91-79-22683721",
    services: ["Government lab", "OPD investigations"],
  },
];

function kindForHospital(h: DemoHospital): { care_kind: CareKind; rural_tier: number; hours: string } {
  if (h.hospital_type === "emergency" || h.id === "emergency-live") {
    return { care_kind: "emergency", rural_tier: 0, hours: "00:00-24:00" };
  }
  if (h.id === "civil-hospital") {
    return { care_kind: "district_hospital", rural_tier: 3, hours: "00:00-24:00" };
  }
  if (h.hospital_type === "government") {
    return { care_kind: "government_hospital", rural_tier: 2, hours: "00:00-24:00" };
  }
  return {
    care_kind: "hospital",
    rural_tier: 6,
    hours: h.is_emergency ? "00:00-24:00" : "09:00-21:00",
  };
}

export const AHMEDABAD_CARE_SITES: CareSite[] = [
  ...AHMEDABAD_DEMO_HOSPITALS.map((h) => ({
    ...h,
    ...kindForHospital(h),
  })),
  ...EXTRA_SITES,
];

export function parseHours(hours: string): { open: number; close: number } | "24h" {
  if (/24|00:00-24:00|00:00-00:00/i.test(hours)) return "24h";
  const m = hours.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
  if (!m) return "24h";
  return {
    open: Number(m[1]) * 60 + Number(m[2]),
    close: Number(m[3]) * 60 + Number(m[4]),
  };
}

export function isCareSiteOpen(site: CareSite, at = new Date()): boolean {
  const parsed = parseHours(site.hours);
  if (parsed === "24h") return true;
  const mins = at.getHours() * 60 + at.getMinutes();
  if (parsed.close > parsed.open) {
    return mins >= parsed.open && mins < parsed.close;
  }
  return mins >= parsed.open || mins < parsed.close;
}

export function matchesCareNeed(site: CareSite, filter: CareNeedFilter): boolean {
  if (filter === "all") return true;
  if (filter === "emergency") {
    return site.care_kind === "emergency" || site.is_emergency;
  }
  if (filter === "pharmacy") return site.care_kind === "pharmacy";
  if (filter === "lab") return site.care_kind === "lab";
  if (filter === "phc") {
    return site.care_kind === "phc" || site.care_kind === "chc";
  }
  if (filter === "hospital") {
    return (
      site.care_kind === "hospital" ||
      site.care_kind === "government_hospital" ||
      site.care_kind === "district_hospital"
    );
  }
  return true;
}

/** Rural-first ranking: PHC → CHC → gov hospital → district, then distance. */
export function rankCareSites(
  sites: CareSite[],
  origin: [number, number] | null,
  filter: CareNeedFilter,
): Array<CareSite & { distance_km: number | null; open_now: boolean; rank: number }> {
  const filtered = sites.filter((s) => matchesCareNeed(s, filter));
  return filtered
    .map((s) => {
      const distance_km = origin
        ? haversineKm(origin[0], origin[1], s.latitude, s.longitude)
        : null;
      const distPart = distance_km ?? 8;
      const rank = distPart + s.rural_tier * 3.2;
      return {
        ...s,
        distance_km,
        open_now: isCareSiteOpen(s),
        rank,
      };
    })
    .sort((a, b) => a.rank - b.rank);
}

export function careKindLabel(kind: CareKind): string {
  switch (kind) {
    case "phc":
      return "Health Centre (PHC)";
    case "chc":
      return "Health Centre (CHC)";
    case "district_hospital":
      return "District Hospital";
    case "government_hospital":
      return "Government Hospital";
    case "pharmacy":
      return "Pharmacy";
    case "lab":
      return "Lab";
    case "emergency":
      return "Emergency";
    default:
      return "Hospital";
  }
}

export function carePinColor(site: CareSite): string {
  switch (site.care_kind) {
    case "phc":
    case "chc":
      return "#0F766E";
    case "district_hospital":
    case "government_hospital":
      return "#2563EB";
    case "pharmacy":
      return "#7C3AED";
    case "lab":
      return "#CA8A04";
    case "emergency":
      return "#EF4444";
    default:
      return site.pmjay_empanelled ? "#14B8A6" : "#64748B";
  }
}

export function nearbyPharmacies(
  origin: [number, number] | null,
  limit = 3,
) {
  return rankCareSites(AHMEDABAD_CARE_SITES, origin, "pharmacy").slice(0, limit);
}

export function nearbyGovernmentFacilities(
  origin: [number, number] | null,
  limit = 3,
) {
  return rankCareSites(AHMEDABAD_CARE_SITES, origin, "all")
    .filter(
      (s) =>
        s.care_kind === "phc" ||
        s.care_kind === "chc" ||
        s.care_kind === "government_hospital" ||
        s.care_kind === "district_hospital",
    )
    .slice(0, limit);
}
