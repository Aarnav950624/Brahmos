import { z } from "zod";

export const medicineExtractResultSchema = z.object({
  medicineName: z.string().nullable().optional(),
  strength: z.string().nullable().optional(),
  form: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1),
  rawHints: z.array(z.string()).optional().default([]),
  source: z.string().optional(),
  disclaimer: z.string().optional(),
});

export type MedicineExtractResult = z.infer<typeof medicineExtractResultSchema>;

export type ConfidenceBand = "high" | "medium" | "low";

export function confidenceBand(confidence: number): ConfidenceBand {
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.5) return "medium";
  return "low";
}

export type MatchCandidate = {
  id: string;
  name: string;
  dose: string | null;
  frequency: string | null;
  time_slots: string[];
  instructions: string | null;
  active: boolean;
  score: number;
};

export type MatchOutcome =
  | { kind: "single"; medicine: MatchCandidate }
  | { kind: "multiple"; medicines: MatchCandidate[] }
  | { kind: "none" };
