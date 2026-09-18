/** Ahmedabad-district villages / taluka towns for rural field work (demo). */

export interface VillageRecord {
  id: string;
  name: string;
  taluka: string;
  lat: number;
  lng: number;
  catchment: string;
  notes: string;
}

export const AHMEDABAD_DISTRICT_VILLAGES: VillageRecord[] = [
  {
    id: "sanand",
    name: "Sanand",
    taluka: "Sanand",
    lat: 22.992,
    lng: 72.382,
    catchment: "CHC Sanand + village sub-centres",
    notes: "Industrial belt + surrounding villages. NCD follow-up volume is high.",
  },
  {
    id: "sanathal",
    name: "Sanathal",
    taluka: "Sanand",
    lat: 22.978,
    lng: 72.418,
    catchment: "PHC Sanathal",
    notes: "Highway-adjacent village; medicine pickup often at Sanand Jan Aushadhi.",
  },
  {
    id: "bavla",
    name: "Bavla",
    taluka: "Bavla",
    lat: 22.83,
    lng: 72.361,
    catchment: "CHC Bavla",
    notes: "COPD and seasonal respiratory load from dust and brick kilns.",
  },
  {
    id: "dholka",
    name: "Dholka",
    taluka: "Dholka",
    lat: 22.727,
    lng: 72.441,
    catchment: "CHC Dholka",
    notes: "Referral hub toward Civil Hospital for complicated diabetes.",
  },
  {
    id: "koth",
    name: "Koth",
    taluka: "Dholka",
    lat: 22.69,
    lng: 72.39,
    catchment: "PHC Koth",
    notes: "Older adults with hypertension; ASHA home visits twice weekly.",
  },
  {
    id: "viramgam",
    name: "Viramgam",
    taluka: "Viramgam",
    lat: 23.124,
    lng: 72.05,
    catchment: "CHC Viramgam",
    notes: "Western taluka; longer travel time to district hospital.",
  },
  {
    id: "detroj",
    name: "Detroj",
    taluka: "Detroj-Rampura",
    lat: 23.25,
    lng: 72.18,
    catchment: "PHC Detroj",
    notes: "Sparse transport; offline health card is the usual fallback.",
  },
  {
    id: "dhandhuka",
    name: "Dhandhuka",
    taluka: "Dhandhuka",
    lat: 22.382,
    lng: 71.987,
    catchment: "CHC Dhandhuka",
    notes: "Coastal-adjacent taluka; heat and dehydration check-ins in summer.",
  },
];

export function villageLabelFromAddress(
  address: Record<string, unknown> | null | undefined,
): string | null {
  if (!address) return null;
  const village = String(address.village ?? "").trim();
  const taluka = String(address.taluka ?? "").trim();
  const line1 = String(address.line1 ?? address.area ?? "").trim();
  if (village && taluka) return `${village} · ${taluka} taluka`;
  if (village) return village;
  if (taluka) return `${taluka} taluka`;
  if (line1) return line1;
  return null;
}
