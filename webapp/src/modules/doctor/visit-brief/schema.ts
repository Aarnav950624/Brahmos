import { z } from "zod";

export const VERIFICATION_LABEL =
  "AI-generated summary — Doctor verification required";

export const FALLBACK_BANNER =
  "AI unavailable — showing data-based summary.";

export const visitBriefSchema = z.object({
  period_days: z.number().int().nonnegative(),
  period_label: z.string(),
  overview: z.string(),
  care_plan_progress_percent: z.number().nullable(),
  medication: z.object({
    adherence_percent: z.number().nullable(),
    missed_doses: z.number().int().nonnegative(),
    notes: z.array(z.string()).default([]),
  }),
  check_ins: z.object({
    completed: z.number().int().nonnegative(),
    expected: z.number().int().nonnegative(),
    notes: z.array(z.string()).default([]),
  }),
  concerns: z.array(
    z.object({
      topic: z.string(),
      mentions: z.number().int().positive(),
    }),
  ),
  vitals: z.array(
    z.object({
      label: z.string(),
      latest: z.string(),
      trend: z.enum(["up", "down", "flat", "insufficient"]),
      recorded_at: z.string().nullable().optional(),
    }),
  ),
  care_plan_items: z.array(
    z.object({
      title: z.string(),
      status: z.enum(["done", "partial", "missing", "unknown"]),
    }),
  ),
  recent_events: z.array(z.string()),
  discussion_points: z.array(z.string()),
  missing_information: z.array(z.string()).default([]),
  source: z.enum(["ai", "local_fallback"]),
  generated_at: z.string(),
  disclaimer: z.string(),
});

export type VisitBrief = z.infer<typeof visitBriefSchema>;
