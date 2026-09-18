import { fetchVisitBrief } from "@/services/ai.service";
import { buildVisitBriefContext } from "@/modules/doctor/visit-brief/build-context";
import { buildLocalVisitBrief } from "@/modules/doctor/visit-brief/fallback";
import {
  VERIFICATION_LABEL,
  visitBriefSchema,
  type VisitBrief,
} from "@/modules/doctor/visit-brief/schema";

/**
 * Generate an AI Visit Brief for a doctor-authorized patient.
 * Falls back to deterministic local summary if AI is unavailable/malformed.
 */
export async function generateVisitBrief(
  patientId: string,
): Promise<VisitBrief> {
  const context = buildVisitBriefContext(patientId);
  if (!context) {
    return visitBriefSchema.parse({
      period_days: 0,
      period_label: "0 days",
      overview: "Patient record not found in the local care store.",
      care_plan_progress_percent: null,
      medication: { adherence_percent: null, missed_doses: 0, notes: [] },
      check_ins: { completed: 0, expected: 0, notes: ["No patient context"] },
      concerns: [],
      vitals: [],
      care_plan_items: [],
      recent_events: [],
      discussion_points: ["Confirm patient chart access and regenerate"],
      missing_information: ["Patient not found"],
      source: "local_fallback",
      generated_at: new Date().toISOString(),
      disclaimer: VERIFICATION_LABEL,
    });
  }

  const local = buildLocalVisitBrief(context);

  try {
    const remote = await fetchVisitBrief({
      patient: context.patient,
      period: context.period,
      medications: context.medications,
      adherence: context.adherence,
      checkIns: context.checkIns.slice(0, 30),
      vitals: context.vitals.map((v) => ({
        label: v.label,
        values: v.values.slice(0, 12),
      })),
      carePlan: context.carePlan,
      escalations: context.escalations,
      appointments: context.appointments,
      recentEvents: context.recentEvents,
      investigations: context.investigations,
      local_draft: {
        overview: local.overview,
        concerns: local.concerns,
        discussion_points: local.discussion_points,
        care_plan_items: local.care_plan_items,
        vitals: local.vitals,
      },
    });

    if (!remote) return local;

    const ai = remote as Partial<VisitBrief>;

    const merged = {
      ...local,
      ...ai,
      medication: {
        ...local.medication,
        ...(ai.medication || {}),
        notes: ai.medication?.notes?.length
          ? ai.medication.notes
          : local.medication.notes,
      },
      check_ins: {
        ...local.check_ins,
        ...(ai.check_ins || {}),
        notes: ai.check_ins?.notes?.length
          ? ai.check_ins.notes
          : local.check_ins.notes,
      },
      concerns: ai.concerns?.length ? ai.concerns : local.concerns,
      vitals: ai.vitals?.length ? ai.vitals : local.vitals,
      care_plan_items: ai.care_plan_items?.length
        ? ai.care_plan_items
        : local.care_plan_items,
      recent_events: ai.recent_events?.length
        ? ai.recent_events
        : local.recent_events,
      discussion_points: ai.discussion_points?.length
        ? ai.discussion_points
        : local.discussion_points,
      missing_information: ai.missing_information?.length
        ? ai.missing_information
        : local.missing_information,
      source: "ai" as const,
      generated_at: new Date().toISOString(),
      disclaimer: VERIFICATION_LABEL,
      period_days: ai.period_days ?? local.period_days,
      period_label: ai.period_label || local.period_label,
    };

    return visitBriefSchema.parse(merged);
  } catch {
    return local;
  }
}
