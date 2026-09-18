import type { EmergencyProfile } from "@/modules/identity/types";

const CACHE_KEY = "healnexus.public-passports.v1";

const DISCLAIMER =
  "Emergency Medical Profile — limited public details only. Not a diagnosis. Seek urgent care for red-flag symptoms.";

type Packed = {
  t: string;
  n: string;
  b?: string;
  a?: string[];
  m?: Array<{ n: string; d?: string }>;
  e?: { n?: string; p?: string; r?: string };
  d?: { n?: string; p?: string; h?: string };
};

function toPacked(p: EmergencyProfile): Packed {
  return {
    t: p.token,
    n: p.full_name.slice(0, 80),
    b: p.blood_group || undefined,
    a: (p.allergies || []).slice(0, 6).map((x) => x.slice(0, 40)),
    m: (p.medicines || []).slice(0, 8).map((med) => ({
      n: med.name.slice(0, 40),
      d: med.dose ? med.dose.slice(0, 24) : undefined,
    })),
    e: p.emergency_contact
      ? {
          n: p.emergency_contact.name?.slice(0, 40),
          p: p.emergency_contact.phone?.slice(0, 20),
          r: p.emergency_contact.relationship?.slice(0, 24),
        }
      : undefined,
    d: p.doctor
      ? {
          n: p.doctor.name.slice(0, 48),
          p: p.doctor.phone?.slice(0, 20),
          h: p.doctor.hospital.slice(0, 48),
        }
      : undefined,
  };
}

function fromPacked(p: Packed): EmergencyProfile {
  return {
    token: p.t,
    full_name: p.n,
    blood_group: p.b || null,
    allergies: p.a || [],
    medicines: (p.m || []).map((med) => ({ name: med.n, dose: med.d })),
    emergency_contact: p.e
      ? { name: p.e.n, phone: p.e.p, relationship: p.e.r }
      : null,
    doctor: p.d
      ? { name: p.d.n || "Doctor", phone: p.d.p || null, hospital: p.d.h || "" }
      : null,
    disclaimer: DISCLAIMER,
  };
}

function b64urlEncode(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(raw: string): string {
  const pad = raw.length % 4 === 0 ? "" : "=".repeat(4 - (raw.length % 4));
  const b64 = raw.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function readCache(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}") as Record<
      string,
      string
    >;
  } catch {
    return {};
  }
}

function writeCache(token: string, packed: string) {
  if (typeof window === "undefined") return;
  const next = { ...readCache(), [token.toLowerCase()]: packed };
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(next));
}

export function encodePublicPassport(profile: EmergencyProfile): string {
  const packed = b64urlEncode(JSON.stringify(toPacked(profile)));
  writeCache(profile.token, packed);
  return packed;
}

export function decodePublicPassport(raw: string | null | undefined): EmergencyProfile | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(b64urlDecode(raw.trim())) as Packed;
    if (!parsed?.t || !parsed?.n) return null;
    const profile = fromPacked(parsed);
    writeCache(profile.token, raw.trim());
    return profile;
  } catch {
    return null;
  }
}

export function cachedPublicPassport(token: string): EmergencyProfile | null {
  const packed = readCache()[token.toLowerCase()];
  return packed ? decodePublicPassport(packed) : null;
}
