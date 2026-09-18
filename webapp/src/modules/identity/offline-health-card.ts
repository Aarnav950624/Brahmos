import { getStore } from "@/data/store";
import type { DigitalPassport } from "@/modules/identity/types";

const KEY = "healnexus.offline-health-cards.v1";

export interface OfflineHealthCard {
  patient_id: string;
  qr_token: string;
  full_name: string;
  blood_group: string | null;
  allergies: string[];
  conditions: string[];
  medical_history: string | null;
  medicines: Array<{ name: string; dose?: string; time?: string }>;
  emergency_contact: DigitalPassport["emergency_contact"];
  preferred_language: string;
  documents: Array<{ title: string; recorded_at: string }>;
  last_checkin_at: string | null;
  saved_at: string;
}

function readAll(): Record<string, OfflineHealthCard> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<
      string,
      OfflineHealthCard
    >;
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, OfflineHealthCard>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function saveOfflineHealthCard(card: OfflineHealthCard) {
  const all = readAll();
  all[card.patient_id] = card;
  if (card.qr_token) all[`token:${card.qr_token.toLowerCase()}`] = card;
  writeAll(all);
}

export function loadOfflineHealthCard(
  patientIdOrToken: string,
): OfflineHealthCard | null {
  const all = readAll();
  return (
    all[patientIdOrToken] ||
    all[`token:${patientIdOrToken.toLowerCase()}`] ||
    null
  );
}

export function listCachedOfflineCards(): OfflineHealthCard[] {
  const all = readAll();
  const seen = new Set<string>();
  const rows: OfflineHealthCard[] = [];
  for (const [key, card] of Object.entries(all)) {
    if (key.startsWith("token:")) continue;
    if (seen.has(card.patient_id)) continue;
    seen.add(card.patient_id);
    rows.push(card);
  }
  return rows.sort((a, b) => b.saved_at.localeCompare(a.saved_at));
}

export function cardFromPassport(
  passport: DigitalPassport,
  preferredLanguage?: string,
): OfflineHealthCard {
  const store = getStore();
  const documents = (store.healthRecords ?? [])
    .filter((r) => r.patient_id === passport.patient_id)
    .slice(0, 8)
    .map((r) => ({ title: r.title, recorded_at: r.recorded_at }));
  const patient = store.patients.find((p) => p.id === passport.patient_id);
  return {
    patient_id: passport.patient_id,
    qr_token: passport.qr_token,
    full_name: passport.full_name,
    blood_group: passport.blood_group,
    allergies: passport.allergies,
    conditions: passport.conditions,
    medical_history: passport.medical_history,
    medicines: passport.medicines,
    emergency_contact: passport.emergency_contact,
    preferred_language:
      preferredLanguage ||
      patient?.preferred_language ||
      "en",
    documents,
    last_checkin_at: passport.last_checkin_at,
    saved_at: new Date().toISOString(),
  };
}
