import {
  concernCounts,
  vitalTrends,
  type VisitBriefContext,
} from "@/modules/doctor/visit-brief/build-context";
import {
  FALLBACK_BANNER,
  VERIFICATION_LABEL,
  type VisitBrief,
} from "@/modules/doctor/visit-brief/schema";

/** Deterministic Visit Brief from structured store data (no LLM). */
export function buildLocalVisitBrief(context: VisitBriefContext): VisitBrief {
  const concerns = concernCounts(context.checkIns);
  const vitals = vitalTrends(context);
  const expectedCheckins = context.period.days;
  const completedCheckins = context.checkIns.length;

  const carePlanItems = context.carePlan.tasks.length
    ? context.carePlan.tasks.slice(0, 8).map((t) => {
        const rate = t.completion_rate;
        const status =
          rate >= 85
            ? ("done" as const)
            : rate >= 40
              ? ("partial" as const)
              : ("missing" as const);
        return { title: t.title, status };
      })
    : [{ title: "Care plan tasks", status: "unknown" as const }];

  const missing: string[] = [];
  if (context.adherence.total_events === 0) {
    missing.push("No medication confirmation events in this period");
  }
  if (completedCheckins === 0) {
    missing.push("No check-ins recorded since last consultation window");
  }
  if (!context.carePlan.tasks.length) {
    missing.push("No active care-plan tasks found");
  }
  if (!vitals.length) {
    missing.push("Insufficient vitals history for trend review");
  }

  const discussion: string[] = [];
  for (const c of concerns.slice(0, 3)) {
    discussion.push(
      `Review repeated patient-reported concern: ${c.topic} (${c.mentions}×)`,
    );
  }
  if (context.adherence.percent != null && context.adherence.percent < 85) {
    discussion.push("Review medication adherence and barriers to dosing");
  }
  if (completedCheckins < Math.max(3, Math.floor(expectedCheckins * 0.5))) {
    discussion.push("Review check-in engagement and follow-up cadence");
  }
  for (const v of vitals) {
    if (v.trend === "up" || v.trend === "down") {
      discussion.push(`Review ${v.label} trend (${v.trend})`);
    }
  }
  if (context.escalations.some((e) => e.status === "open")) {
    discussion.push("Review open escalations recorded in this period");
  }
  if (!discussion.length) {
    discussion.push("Confirm care-plan progress and upcoming follow-up timing");
  }

  const medNotes: string[] = [];
  if (context.adherence.percent == null) {
    medNotes.push("Medication adherence not calculable — no dose events logged");
  } else {
    medNotes.push(
      `Logged dose events: ${context.adherence.taken} taken/late, ${context.adherence.missed} missed, ${context.adherence.skipped} skipped`,
    );
  }

  const checkInNotes: string[] = [];
  if (completedCheckins === 0) {
    checkInNotes.push("No check-ins available in this window");
  } else {
    checkInNotes.push(
      `Latest check-in ${context.checkIns[0]?.recorded_at.slice(0, 10) || "—"}`,
    );
  }

  const overviewParts = [
    `${context.patient.name} — period since last consultation: ${context.period.days} day(s)`,
    context.patient.recovery_score != null
      ? `Recovery score on file: ${context.patient.recovery_score}`
      : null,
    context.carePlan.overall_progress_percent != null
      ? `Care-plan task progress ≈ ${context.carePlan.overall_progress_percent}%`
      : "Care-plan progress not available",
    context.adherence.percent != null
      ? `Medication adherence ≈ ${context.adherence.percent}%`
      : "Medication adherence unavailable",
    `Check-ins completed ${completedCheckins}/${expectedCheckins}`,
  ].filter(Boolean);

  return {
    period_days: context.period.days,
    period_label: `${context.period.days} days`,
    overview: overviewParts.join(". ") + ".",
    care_plan_progress_percent: context.carePlan.overall_progress_percent,
    medication: {
      adherence_percent: context.adherence.percent,
      missed_doses: context.adherence.missed,
      notes: medNotes,
    },
    check_ins: {
      completed: completedCheckins,
      expected: expectedCheckins,
      notes: checkInNotes,
    },
    concerns: concerns.map((c) => ({
      topic: c.topic,
      mentions: c.mentions,
    })),
    vitals,
    care_plan_items: carePlanItems,
    recent_events: context.recentEvents.slice(0, 8),
    discussion_points: discussion.slice(0, 8),
    missing_information: missing,
    source: "local_fallback",
    generated_at: new Date().toISOString(),
    disclaimer: `${VERIFICATION_LABEL}. ${FALLBACK_BANNER}`,
  };
}
