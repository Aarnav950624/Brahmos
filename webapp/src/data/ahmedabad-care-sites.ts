import {
  AHMEDABAD_DEMO_HOSPITALS,
  haversineKm,
} from "@/data/ahmedabad-hospitals";
import { AHMEDABAD_DISTRICT_VILLAGES } from "@/data/ahmedabad-villages";
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

function shop(input: {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  area: string;
  hours: string;
  services: string[];
  phone?: string;
  government?: boolean;
}): CareSite {
  return {
    id: input.id,
    name: input.name,
    hospital_type: input.government ? "government" : "private",
    care_kind: "pharmacy",
    rural_tier: input.government ? 3 : 4,
    hours: input.hours,
    latitude: input.lat,
    longitude: input.lng,
    address: input.address,
    area: input.area,
    city: "Ahmedabad",
    pmjay_empanelled: false,
    is_emergency: false,
    phone: input.phone,
    services: input.services,
  };
}

/** Neighbourhood medical shops, Jan Aushadhi, and chain pharmacies across Ahmedabad. */
const AHMEDABAD_MEDICAL_SHOPS: CareSite[] = [
  shop({
    id: "jan-aushadhi-asarwa",
    name: "Jan Aushadhi Kendra — Civil Hospital",
    lat: 23.048,
    lng: 72.605,
    address: "Near Civil Hospital, Asarwa",
    area: "Asarwa",
    hours: "08:00-20:00",
    phone: "18001808080",
    government: true,
    services: ["Generic medicines", "Scheme drugs", "Low-cost chronic meds"],
  }),
  shop({
    id: "jan-aushadhi-ellisbridge",
    name: "Jan Aushadhi Kendra — SVP / VS Hospital",
    lat: 23.0334,
    lng: 72.5664,
    address: "VS Hospital campus, Ellisbridge",
    area: "Ellisbridge",
    hours: "08:00-20:00",
    phone: "18001808080",
    government: true,
    services: ["Generic medicines", "Government scheme drugs"],
  }),
  shop({
    id: "jan-aushadhi-maninagar",
    name: "Jan Aushadhi Kendra — Maninagar",
    lat: 22.996,
    lng: 72.604,
    address: "Near LG Hospital, Maninagar",
    area: "Maninagar",
    hours: "09:00-19:00",
    phone: "18001808080",
    government: true,
    services: ["Generic medicines", "OPD prescriptions"],
  }),
  shop({
    id: "jan-aushadhi-sabarmati",
    name: "Jan Aushadhi Kendra — Sabarmati",
    lat: 23.082,
    lng: 72.586,
    address: "Sabarmati, Ahmedabad",
    area: "Sabarmati",
    hours: "09:00-19:00",
    phone: "18001808080",
    government: true,
    services: ["Generic medicines", "PHC linked supply"],
  }),
  shop({
    id: "jan-aushadhi-odhav",
    name: "Jan Aushadhi Kendra — Odhav",
    lat: 23.026,
    lng: 72.669,
    address: "Odhav GIDC road",
    area: "Odhav",
    hours: "09:00-19:00",
    phone: "18001808080",
    government: true,
    services: ["Generic medicines"],
  }),
  shop({
    id: "jan-aushadhi-naroda",
    name: "Jan Aushadhi Kendra — Naroda",
    lat: 23.071,
    lng: 72.656,
    address: "Naroda Patiya road",
    area: "Naroda",
    hours: "09:00-19:00",
    phone: "18001808080",
    government: true,
    services: ["Generic medicines"],
  }),
  shop({
    id: "amc-pharmacy-maninagar",
    name: "AMC Municipal Pharmacy — Maninagar",
    lat: 22.997,
    lng: 72.603,
    address: "Maninagar, Ahmedabad",
    area: "Maninagar",
    hours: "09:00-18:00",
    phone: "+91-79-25391811",
    government: true,
    services: ["Municipal pharmacy", "OTC + prescribed generics"],
  }),
  shop({
    id: "amc-pharmacy-asarsi",
    name: "AMC Medical Store — Shahibaug",
    lat: 23.055,
    lng: 72.595,
    address: "Shahibaug, Ahmedabad",
    area: "Shahibaug",
    hours: "09:00-18:00",
    government: true,
    services: ["Municipal pharmacy", "Basic chronic medicines"],
  }),
  shop({
    id: "apollo-pharmacy-cgroad",
    name: "Apollo Pharmacy — CG Road",
    lat: 23.0278,
    lng: 72.5615,
    address: "CG Road, Navrangpura",
    area: "CG Road",
    hours: "00:00-24:00",
    phone: "+91-79-26401234",
    services: ["24×7 pharmacy", "Prescription refill", "OTC"],
  }),
  shop({
    id: "apollo-pharmacy-satellite",
    name: "Apollo Pharmacy — Satellite",
    lat: 23.026,
    lng: 72.52,
    address: "Satellite Road, Ahmedabad",
    area: "Satellite",
    hours: "08:00-23:00",
    services: ["Prescription medicines", "Diabetes / BP supplies"],
  }),
  shop({
    id: "apollo-pharmacy-bopal",
    name: "Apollo Pharmacy — Bopal",
    lat: 23.03,
    lng: 72.465,
    address: "SP Ring Road, Bopal",
    area: "Bopal",
    hours: "08:00-23:00",
    services: ["Retail pharmacy", "Home delivery (local)"],
  }),
  shop({
    id: "apollo-pharmacy-chandkheda",
    name: "Apollo Pharmacy — Chandkheda",
    lat: 23.108,
    lng: 72.58,
    address: "Visat–Gandhinagar highway, Chandkheda",
    area: "Chandkheda",
    hours: "08:00-22:00",
    services: ["Retail pharmacy", "OTC"],
  }),
  shop({
    id: "apollo-pharmacy-maninagar",
    name: "Apollo Pharmacy — Maninagar",
    lat: 22.995,
    lng: 72.601,
    address: "Rambaug, Maninagar",
    area: "Maninagar",
    hours: "08:00-23:00",
    services: ["Retail pharmacy", "Prescription refill"],
  }),
  shop({
    id: "medplus-paldi",
    name: "MedPlus — Paldi",
    lat: 23.013,
    lng: 72.563,
    address: "Paldi Char Rasta",
    area: "Paldi",
    hours: "08:00-22:00",
    services: ["Discount pharmacy", "OTC", "Surgical items"],
  }),
  shop({
    id: "medplus-naranpura",
    name: "MedPlus — Naranpura",
    lat: 23.05,
    lng: 72.555,
    address: "Naranpura, Ahmedabad",
    area: "Naranpura",
    hours: "08:00-22:00",
    services: ["Retail pharmacy", "Generic + branded"],
  }),
  shop({
    id: "medplus-vastrapur",
    name: "MedPlus — Vastrapur",
    lat: 23.038,
    lng: 72.531,
    address: "Vastrapur Lake road",
    area: "Vastrapur",
    hours: "08:00-22:00",
    services: ["Retail pharmacy"],
  }),
  shop({
    id: "medplus-nikol",
    name: "MedPlus — Nikol",
    lat: 23.048,
    lng: 72.672,
    address: "Nikol, Ahmedabad",
    area: "Nikol",
    hours: "08:00-22:00",
    services: ["Retail pharmacy"],
  }),
  shop({
    id: "wellness-prahladnagar",
    name: "Wellness Forever — Prahlad Nagar",
    lat: 23.012,
    lng: 72.506,
    address: "Prahlad Nagar, Ahmedabad",
    area: "Prahlad Nagar",
    hours: "08:00-23:00",
    services: ["Pharmacy", "Wellness", "OTC"],
  }),
  shop({
    id: "wellness-sghighway",
    name: "Guardian Pharmacy — S.G. Highway",
    lat: 23.047,
    lng: 72.508,
    address: "S.G. Highway, Ahmedabad",
    area: "S.G. Highway",
    hours: "08:00-23:00",
    services: ["Retail pharmacy", "Chronic care packs"],
  }),
  shop({
    id: "medical-relief-road",
    name: "Relief Road Medical Stores",
    lat: 23.0265,
    lng: 72.581,
    address: "Relief Road, Ahmedabad",
    area: "Relief Road",
    hours: "08:00-22:00",
    services: ["Old-city medical shop", "Prescription medicines"],
  }),
  shop({
    id: "medical-kalupur",
    name: "Kalupur Chemist & Druggist",
    lat: 23.028,
    lng: 72.599,
    address: "Kalupur, Ahmedabad",
    area: "Kalupur",
    hours: "08:00-21:00",
    services: ["Neighbourhood medical shop"],
  }),
  shop({
    id: "medical-dariapur",
    name: "Dariapur Medical & General Store",
    lat: 23.038,
    lng: 72.588,
    address: "Dariapur, Ahmedabad",
    area: "Dariapur",
    hours: "08:00-21:00",
    services: ["Local medical shop", "OTC"],
  }),
  shop({
    id: "medical-khadia",
    name: "Khadia Medical Hall",
    lat: 23.019,
    lng: 72.59,
    address: "Khadia, Ahmedabad",
    area: "Khadia",
    hours: "08:00-21:00",
    services: ["Local medical shop"],
  }),
  shop({
    id: "medical-bapunagar",
    name: "Bapunagar Medical Stores",
    lat: 23.038,
    lng: 72.63,
    address: "Bapunagar, Ahmedabad",
    area: "Bapunagar",
    hours: "08:00-22:00",
    services: ["Retail pharmacy", "East Ahmedabad"],
  }),
  shop({
    id: "medical-rakhial",
    name: "Rakhial Chemists",
    lat: 23.03,
    lng: 72.62,
    address: "Rakhial, Ahmedabad",
    area: "Rakhial",
    hours: "08:00-21:00",
    services: ["Local medical shop"],
  }),
  shop({
    id: "medical-amraiwadi",
    name: "Amraiwadi Medical & Surgical",
    lat: 23.01,
    lng: 72.625,
    address: "Amraiwadi, Ahmedabad",
    area: "Amraiwadi",
    hours: "08:00-21:00",
    services: ["Pharmacy", "Dressings"],
  }),
  shop({
    id: "medical-vatva",
    name: "Vatva GIDC Medical Store",
    lat: 22.962,
    lng: 72.628,
    address: "GIDC Vatva",
    area: "Vatva",
    hours: "08:00-21:00",
    services: ["Shift-worker pharmacy", "OTC"],
  }),
  shop({
    id: "medical-isanpur",
    name: "Isanpur Medical Stores",
    lat: 22.975,
    lng: 72.595,
    address: "Isanpur, Ahmedabad",
    area: "Isanpur",
    hours: "08:00-22:00",
    services: ["Neighbourhood medical shop"],
  }),
  shop({
    id: "medical-juhapura",
    name: "Juhapura Medical & General",
    lat: 23.001,
    lng: 72.531,
    address: "Juhapura, Ahmedabad",
    area: "Juhapura",
    hours: "08:00-22:00",
    services: ["Local medical shop", "OTC"],
  }),
  shop({
    id: "medical-vasna",
    name: "Vasna Cross Roads Chemist",
    lat: 23.002,
    lng: 72.545,
    address: "Vasna, Ahmedabad",
    area: "Vasna",
    hours: "08:00-22:00",
    services: ["Retail pharmacy"],
  }),
  shop({
    id: "medical-sarkhej",
    name: "Sarkhej Medical Stores",
    lat: 22.982,
    lng: 72.5,
    address: "Sarkhej, Ahmedabad",
    area: "Sarkhej",
    hours: "08:00-21:00",
    services: ["Highway-side pharmacy"],
  }),
  shop({
    id: "medical-makarba",
    name: "Makarba 24x7 Medical",
    lat: 22.995,
    lng: 72.5,
    address: "Makarba, Ahmedabad",
    area: "Makarba",
    hours: "00:00-24:00",
    services: ["24×7 medical shop", "Night medicines"],
  }),
  shop({
    id: "medical-gota",
    name: "Gota Medical & Surgical",
    lat: 23.1,
    lng: 72.54,
    address: "Gota, Ahmedabad",
    area: "Gota",
    hours: "08:00-22:00",
    services: ["Retail pharmacy"],
  }),
  shop({
    id: "medical-ranip",
    name: "Ranip Medical Stores",
    lat: 23.08,
    lng: 72.57,
    address: "Ranip, Ahmedabad",
    area: "Ranip",
    hours: "08:00-22:00",
    services: ["Neighbourhood medical shop"],
  }),
  shop({
    id: "medical-motera",
    name: "Motera Stadium Road Chemist",
    lat: 23.09,
    lng: 72.597,
    address: "Motera, Ahmedabad",
    area: "Motera",
    hours: "08:00-22:00",
    services: ["Retail pharmacy"],
  }),
  shop({
    id: "medical-thaltej",
    name: "Thaltej Medical Stores",
    lat: 23.07,
    lng: 72.515,
    address: "Thaltej, Ahmedabad",
    area: "Thaltej",
    hours: "08:00-23:00",
    services: ["Retail pharmacy", "OTC"],
  }),
  shop({
    id: "medical-bodakdev",
    name: "Bodakdev Chemists",
    lat: 23.04,
    lng: 72.51,
    address: "Bodakdev, Ahmedabad",
    area: "Bodakdev",
    hours: "08:00-23:00",
    services: ["Retail pharmacy"],
  }),
  shop({
    id: "medical-memnagar",
    name: "Memnagar Medical Hall",
    lat: 23.04,
    lng: 72.528,
    address: "Memnagar, Ahmedabad",
    area: "Memnagar",
    hours: "08:00-22:00",
    services: ["Near Sterling Hospital", "Prescription refill"],
  }),
  shop({
    id: "medical-science-city",
    name: "Science City Road Pharmacy",
    lat: 23.075,
    lng: 72.5,
    address: "Science City Road, Ahmedabad",
    area: "Science City",
    hours: "08:00-23:00",
    services: ["Retail pharmacy"],
  }),
  shop({
    id: "medical-sola",
    name: "Sola Civil Road Medical",
    lat: 23.075,
    lng: 72.52,
    address: "Sola, Ahmedabad",
    area: "Sola",
    hours: "08:00-22:00",
    services: ["Near Unjha Hospital", "Prescription medicines"],
  }),
  shop({
    id: "medical-ghatlodia",
    name: "Ghatlodia Medical Stores",
    lat: 23.065,
    lng: 72.54,
    address: "Ghatlodia, Ahmedabad",
    area: "Ghatlodia",
    hours: "08:00-22:00",
    services: ["Neighbourhood medical shop"],
  }),
  shop({
    id: "medical-navrangpura",
    name: "Navrangpura Medical & Surgical",
    lat: 23.036,
    lng: 72.56,
    address: "Navrangpura, Ahmedabad",
    area: "Navrangpura",
    hours: "08:00-23:00",
    services: ["Retail pharmacy", "Surgical"],
  }),
  shop({
    id: "medical-ashram-road",
    name: "Ashram Road Chemist",
    lat: 23.04,
    lng: 72.571,
    address: "Ashram Road, Ahmedabad",
    area: "Ashram Road",
    hours: "08:00-22:00",
    services: ["Retail pharmacy"],
  }),
  shop({
    id: "medical-ambawadi",
    name: "Ambawadi Medical Stores",
    lat: 23.022,
    lng: 72.55,
    address: "Ambawadi, Ahmedabad",
    area: "Ambawadi",
    hours: "08:00-22:00",
    services: ["Retail pharmacy"],
  }),
  shop({
    id: "medical-nehrunagar",
    name: "Nehrunagar Circle Pharmacy",
    lat: 23.025,
    lng: 72.53,
    address: "Nehrunagar, Ahmedabad",
    area: "Nehrunagar",
    hours: "08:00-23:00",
    services: ["24-evening pharmacy"],
  }),
];

function villageFieldSites(): CareSite[] {
  return AHMEDABAD_DISTRICT_VILLAGES.flatMap((v) => [
    {
      id: `phc-village-${v.id}`,
      name: `PHC ${v.name}`,
      hospital_type: "government",
      care_kind: "phc" as const,
      rural_tier: 0,
      hours: "08:00-17:00",
      latitude: v.lat,
      longitude: v.lng,
      address: `${v.name}, ${v.taluka} taluka, Ahmedabad district, Gujarat`,
      area: v.name,
      city: "Ahmedabad",
      pmjay_empanelled: false,
      is_emergency: false,
      phone: "108",
      services: [
        "Village OPD",
        "ASHA coordination",
        "NCD register",
        "Basic medicines",
        v.catchment,
      ],
    },
    shop({
      id: `jan-aushadhi-village-${v.id}`,
      name: `Jan Aushadhi Kendra — ${v.name}`,
      lat: v.lat + 0.004,
      lng: v.lng + 0.003,
      address: `Near PHC, ${v.name}`,
      area: v.name,
      hours: "09:00-18:00",
      phone: "18001808080",
      government: true,
      services: ["Generic medicines", "Scheme NCD drugs", "Low-cost chronic meds"],
    }),
    shop({
      id: `medical-village-${v.id}`,
      name: `${v.name} Medical Stores`,
      lat: v.lat - 0.003,
      lng: v.lng + 0.002,
      address: `Main bazaar, ${v.name}, ${v.taluka}`,
      area: v.name,
      hours: "08:00-21:00",
      services: ["Retail pharmacy", "BP/sugar strips", "ORS"],
    }),
  ]);
}

const EXTRA_SITES: CareSite[] = [
  ...villageFieldSites(),
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
    id: "phc-naroda",
    name: "UHC / PHC Naroda",
    hospital_type: "government",
    care_kind: "phc",
    rural_tier: 0,
    hours: "08:00-17:00",
    latitude: 23.072,
    longitude: 72.657,
    address: "Naroda, Ahmedabad, Gujarat",
    area: "Naroda",
    city: "Ahmedabad",
    pmjay_empanelled: false,
    is_emergency: false,
    phone: "108",
    services: ["OPD", "NCD screening", "Basic medicines"],
  },
  {
    id: "phc-vatva",
    name: "UHC / PHC Vatva",
    hospital_type: "government",
    care_kind: "phc",
    rural_tier: 0,
    hours: "08:00-17:00",
    latitude: 22.96,
    longitude: 72.63,
    address: "Vatva, Ahmedabad, Gujarat",
    area: "Vatva",
    city: "Ahmedabad",
    pmjay_empanelled: false,
    is_emergency: false,
    phone: "108",
    services: ["OPD", "Industrial-area clinic", "Basic medicines"],
  },
  {
    id: "phc-chandkheda",
    name: "UHC Chandkheda",
    hospital_type: "government",
    care_kind: "phc",
    rural_tier: 0,
    hours: "08:00-17:00",
    latitude: 23.11,
    longitude: 72.581,
    address: "Chandkheda, Ahmedabad, Gujarat",
    area: "Chandkheda",
    city: "Ahmedabad",
    pmjay_empanelled: false,
    is_emergency: false,
    phone: "108",
    services: ["OPD", "Immunisation", "Basic medicines"],
  },
  ...AHMEDABAD_MEDICAL_SHOPS,
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
  {
    id: "thyrocare-maninagar",
    name: "Thyrocare — Maninagar",
    hospital_type: "private",
    care_kind: "lab",
    rural_tier: 5,
    hours: "07:00-20:00",
    latitude: 22.996,
    longitude: 72.6,
    address: "Maninagar, Ahmedabad",
    area: "Maninagar",
    city: "Ahmedabad",
    pmjay_empanelled: false,
    is_emergency: false,
    services: ["Blood tests", "Thyroid", "Home collection"],
  },
  {
    id: "neuberg-satellite",
    name: "Neuberg Supratech — Satellite",
    hospital_type: "private",
    care_kind: "lab",
    rural_tier: 5,
    hours: "07:00-21:00",
    latitude: 23.028,
    longitude: 72.518,
    address: "Satellite, Ahmedabad",
    area: "Satellite",
    city: "Ahmedabad",
    pmjay_empanelled: false,
    is_emergency: false,
    services: ["Pathology", "HbA1c", "Lipid profile"],
  },
  {
    id: "accuris-thaltej",
    name: "Sterling Accuris — Thaltej",
    hospital_type: "private",
    care_kind: "lab",
    rural_tier: 5,
    hours: "07:00-20:00",
    latitude: 23.068,
    longitude: 72.516,
    address: "Thaltej, Ahmedabad",
    area: "Thaltej",
    city: "Ahmedabad",
    pmjay_empanelled: false,
    is_emergency: false,
    services: ["Diagnostics", "Home collection"],
  },
  {
    id: "gov-lab-lg",
    name: "LG Hospital Pathology Lab",
    hospital_type: "government",
    care_kind: "lab",
    rural_tier: 3,
    hours: "08:00-16:00",
    latitude: 22.9955,
    longitude: 72.6028,
    address: "LG Hospital campus, Maninagar",
    area: "Maninagar",
    city: "Ahmedabad",
    pmjay_empanelled: true,
    is_emergency: false,
    phone: "+91-79-25462101",
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
  limit = 6,
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
