import type { MedicineRow } from "@/data/store";

import type { MatchCandidate, MatchOutcome } from "./schema";

const SALT_WORDS = new Set([
  "hydrochloride",
  "hcl",
  "hydrobromide",
  "sulphate",
  "sulfate",
  "sodium",
  "potassium",
  "calcium",
  "magnesium",
  "ip",
  "bp",
  "usp",
  "tablet",
  "tablets",
  "capsule",
  "capsules",
  "syrup",
  "injection",
  "cream",
  "ointment",
  "gel",
  "drops",
  "suspension",
  "film",
  "coated",
  "extended",
  "release",
  "sr",
  "xr",
  "er",
  "mr",
]);

const STRENGTH_RE = /(\d+(?:\.\d+)?)\s*(mg|mcg|µg|ug|g|ml|iu)\b/i;

export function normalizeMedicineText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[®™©]/g, "")
    .replace(/[^a-z0-9.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractStrength(text: string): string | null {
  const match = text.match(STRENGTH_RE);
  if (!match) return null;
  const unit = match[2].toLowerCase().replace("µg", "mcg").replace("ug", "mcg");
  return `${match[1]}${unit}`;
}

function nameTokens(text: string): string[] {
  const withoutStrength = text.replace(STRENGTH_RE, " ");
  return normalizeMedicineText(withoutStrength)
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !SALT_WORDS.has(t) && !/^\d+(\.\d+)?$/.test(t));
}

function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let inter = 0;
  for (const t of setA) {
    if (setB.has(t)) inter += 1;
  }
  const union = new Set([...setA, ...setB]).size;
  return union ? inter / union : 0;
}

function containsCoreName(queryTokens: string[], candidateTokens: string[]): boolean {
  if (!queryTokens.length || !candidateTokens.length) return false;
  // Prefer the longest query token as core brand/generic signal
  const core = [...queryTokens].sort((x, y) => y.length - x.length)[0];
  return candidateTokens.some(
    (t) => t === core || (core.length >= 4 && (t.includes(core) || core.includes(t))),
  );
}

export function scoreMedicineMatch(
  extractedName: string,
  extractedStrength: string | null | undefined,
  medicine: MedicineRow,
): number {
  const query = `${extractedName} ${extractedStrength || ""}`.trim();
  const candidate = `${medicine.name} ${medicine.dose || ""}`.trim();
  const qTokens = nameTokens(query);
  const cTokens = nameTokens(candidate);
  if (!qTokens.length || !cTokens.length) return 0;

  let score = jaccard(qTokens, cTokens);
  if (containsCoreName(qTokens, cTokens)) {
    score = Math.max(score, 0.55);
  } else {
    // Different core names — do not treat as equivalent
    score *= 0.35;
  }

  const qStrength =
    extractStrength(extractedStrength || "") || extractStrength(extractedName);
  const cStrength =
    extractStrength(medicine.dose || "") || extractStrength(medicine.name);

  if (qStrength && cStrength) {
    if (qStrength === cStrength) {
      score = Math.min(1, score + 0.2);
    } else {
      // Same family, different strength — keep as possible, never auto-prefer
      score = Math.min(score, 0.72);
    }
  }

  return Math.round(score * 1000) / 1000;
}

const AUTO_MATCH_MIN = 0.72;
const CANDIDATE_MIN = 0.45;
const MULTI_GAP = 0.12;

export function matchAgainstMedicines(
  extractedName: string,
  extractedStrength: string | null | undefined,
  medicines: MedicineRow[],
): MatchOutcome {
  const scored: MatchCandidate[] = medicines
    .map((m) => ({
      id: m.id,
      name: m.name,
      dose: m.dose,
      frequency: m.frequency,
      time_slots: m.time_slots,
      instructions: m.instructions,
      active: m.active,
      score: scoreMedicineMatch(extractedName, extractedStrength, m),
    }))
    .filter((m) => m.score >= CANDIDATE_MIN)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return { kind: "none" };

  const top = scored[0];
  const close = scored.filter(
    (m) => m.score >= top.score - MULTI_GAP && m.score >= CANDIDATE_MIN,
  );

  // Different strengths that both match the name → ask user to select
  if (close.length > 1) {
    return { kind: "multiple", medicines: close.slice(0, 5) };
  }

  if (top.score < AUTO_MATCH_MIN) {
    // Single weak candidate — still ask rather than auto-match
    if (scored.length === 1 && top.score >= 0.55) {
      return { kind: "multiple", medicines: [top] };
    }
    return { kind: "none" };
  }

  return { kind: "single", medicine: top };
}

export function displayExtractedLabel(
  name: string | null | undefined,
  strength: string | null | undefined,
): string {
  const n = (name || "").trim();
  const s = (strength || "").trim();
  if (n && s && !n.toLowerCase().includes(s.toLowerCase().replace(/\s/g, ""))) {
    return `${n} ${s}`;
  }
  return n || s || "Unknown";
}
