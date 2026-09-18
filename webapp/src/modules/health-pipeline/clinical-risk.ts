import { getStore, type RiskLevel } from "@/data/store";
import {
  evaluateHealth,
  recoveryLevel,
  type HealthIntelligenceBundle,
  type RiskCategory,
} from "@/lib/health-engine";
import { buildObservationsForPatient } from "@/modules/prediction/adapters";

export interface ClinicalRiskResult {
  score: number;
  level: RiskLevel;
  recovery_score: number;
  drivers: string[];
  latest_vitals: string | null;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.floor(ms / 86_400_000));
}

function levelFromScore(score: number): RiskLevel {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 35) return "moderate";
  return "low";
}

/**
 * Live clinical risk from this patient's stored check-ins, medicines,
 * investigations, and alerts — not a static label.
 */
export function computeClinicalRisk(patientId: string): ClinicalRiskResult {
  const store = getStore();
  const patient = store.patients.find((p) => p.id === patientId);
  const obs = buildObservationsForPatient(patientId);
  const health = evaluateHealth(obs);

  const checkins = store.checkins
    .filter((c) => c.patient_id === patientId)
    .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
  const latest = checkins[0];

  const missedMeds7d = store.medicineEvents.filter((e) => {
    if (e.patient_id !== patientId) return false;
    if (e.status !== "missed" && e.status !== "skipped") return false;
    return Date.now() - new Date(e.acted_at).getTime() <= 7 * 86_400_000;
  }).length;

  const overdueLabs = store.investigations.filter(
    (i) =>
      i.patient_id === patientId &&
      (i.status === "overdue" || i.status === "review_required"),
  ).length;

  const openAlerts = store.alerts.filter(
    (a) => a.patient_id === patientId && a.status === "open",
  );
  const criticalAlerts = openAlerts.filter((a) => a.severity === "critical").length;
  const highAlerts = openAlerts.filter((a) => a.severity === "high").length;
  const medGapAlerts = openAlerts.filter((a) =>
    a.alert_type.includes("medicine_unavailable"),
  ).length;

  const idleDays = daysSince(latest?.recorded_at);
  const age = patient?.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(patient.date_of_birth).getTime()) /
          (365.25 * 86_400_000),
      )
    : null;

  let score = health.readmission.readmission_probability_percent;
  const drivers: string[] = [...health.readmission.explanation.slice(0, 2)];

  score += Math.min(18, missedMeds7d * 4);
  if (missedMeds7d >= 2) {
    drivers.push(`${missedMeds7d} missed/skipped doses in 7 days`);
  }

  score += Math.min(12, overdueLabs * 5);
  if (overdueLabs) drivers.push(`${overdueLabs} overdue investigation(s)`);

  score += criticalAlerts * 14 + highAlerts * 8 + medGapAlerts * 6;
  if (criticalAlerts || highAlerts) {
    drivers.push(
      `${openAlerts.length} open care-team alert${openAlerts.length === 1 ? "" : "s"}`,
    );
  }
  if (medGapAlerts) {
    drivers.push("Prescribed medicine reported unavailable");
  }

  if (idleDays != null && idleDays >= 3) {
    score += Math.min(12, idleDays * 2);
    drivers.push(`No check-in for ${idleDays} day(s)`);
  }

  if (age != null && age >= 60) {
    score += 4;
    drivers.push("Age 60+ — closer monitoring");
  }

  if ((patient?.chronic_diseases.length ?? 0) >= 2) {
    score += 5;
    drivers.push("Multiple long-term conditions on file");
  }

  const recovery_score = Math.round(health.recovery.recovery_score);
  if (recovery_score < 50) {
    score += 8;
    drivers.push(`Recovery score ${recovery_score}/100`);
  }

  const sys = latest?.bp_systolic;
  const sugar = latest?.blood_sugar;
  let latest_vitals: string | null = null;
  if (latest) {
    const parts = [
      sys != null ? `BP ${sys}/${latest.bp_diastolic ?? "—"}` : null,
      sugar != null ? `sugar ${sugar}` : null,
    ].filter(Boolean);
    latest_vitals = parts.length
      ? `${parts.join(" · ")} (${new Date(latest.recorded_at).toLocaleDateString()})`
      : `Check-in ${new Date(latest.recorded_at).toLocaleDateString()}`;
  }

  if (sys != null && sys >= 160) {
    score += 10;
    drivers.push(`Latest systolic ${sys} mmHg`);
  }
  if (sugar != null && sugar >= 180) {
    score += 8;
    drivers.push(`Latest sugar ${sugar} mg/dL`);
  }

  const rounded = clamp(score);
  const uniqueDrivers = [...new Set(drivers)].slice(0, 4);
  if (!uniqueDrivers.length) {
    uniqueDrivers.push("No deterioration flags on the latest live record");
  }

  return {
    score: rounded,
    level: levelFromScore(rounded),
    recovery_score,
    drivers: uniqueDrivers,
    latest_vitals,
  };
}

export function clinicalLevelToRiskCategory(level: RiskLevel): RiskCategory {
  if (level === "moderate") return "medium";
  return level;
}

/** Same live numbers the doctor list, Recovery page, and Active Panel share. */
export function overlayClinicalOnHealth(
  health: HealthIntelligenceBundle,
  clinical: ClinicalRiskResult,
): HealthIntelligenceBundle {
  const recovery_score = clinical.recovery_score;
  return {
    ...health,
    recovery: {
      ...health.recovery,
      recovery_score,
      recovery_level: recoveryLevel(recovery_score),
      summary: `Recovery Score is ${recovery_score}/100 (${recoveryLevel(recovery_score).replaceAll("_", " ")}). ${
        clinical.drivers.slice(0, 3).join("; ") || health.recovery.summary
      }`,
    },
    readmission: {
      ...health.readmission,
      readmission_probability_percent: clinical.score,
      risk_category: clinicalLevelToRiskCategory(clinical.level),
      explanation: clinical.drivers,
    },
  };
}
