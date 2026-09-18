import { getStore } from "@/data/store";

export type VisitBriefContext = {
  patient: {
    id: string;
    name: string;
    age: number | null;
    sex: string | null;
    chronic_diseases: string[];
    risk_level: string | null;
    recovery_score: number | null;
  };
  period: {
    days: number;
    since: string;
    until: string;
    source: "last_completed_appointment" | "default_window";
  };
  medications: Array<{
    name: string;
    dose: string | null;
    frequency: string | null;
    active: boolean;
  }>;
  adherence: {
    percent: number | null;
    taken: number;
    missed: number;
    skipped: number;
    total_events: number;
  };
  checkIns: Array<{
    recorded_at: string;
    symptoms: string[];
    notes: string | null;
    pain_score: number | null;
    mood: string | null;
    sleep_hours: number | null;
    medicine_taken: boolean | null;
    bp_systolic: number | null;
    bp_diastolic: number | null;
    blood_sugar: number | null;
    oxygen: number | null;
    weight: number | null;
  }>;
  vitals: Array<{
    label: string;
    values: Array<{ at: string; value: number }>;
  }>;
  carePlan: {
    status: string | null;
    tasks: Array<{
      title: string;
      period: string;
      completions: number;
      expected: number;
      completion_rate: number;
    }>;
    overall_progress_percent: number | null;
  };
  escalations: Array<{
    title: string;
    severity: string;
    status: string;
    reason: string;
    created_at: string;
  }>;
  appointments: Array<{
    scheduled_at: string;
    status: string;
    appointment_type: string;
    notes: string | null;
  }>;
  recentEvents: string[];
  investigations: Array<{
    name: string;
    status: string;
    due_date: string | null;
  }>;
};

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

function ageFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const born = new Date(dob);
  if (Number.isNaN(born.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const m = now.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age -= 1;
  return age;
}

export function trendValues(
  values: number[],
): "up" | "down" | "flat" | "insufficient" {
  if (values.length < 2) return "insufficient";
  const mid = Math.floor(values.length / 2);
  const first = values.slice(0, Math.max(1, mid));
  const second = values.slice(mid);
  const avg = (xs: number[]) => xs.reduce((s, n) => s + n, 0) / xs.length;
  const a = avg(first);
  const b = avg(second);
  const delta = b - a;
  const threshold = Math.max(2, Math.abs(a) * 0.05);
  if (delta > threshold) return "up";
  if (delta < -threshold) return "down";
  return "flat";
}

/** Build privacy-minimized visit context from the local HealNexus store. */
export function buildVisitBriefContext(
  patientId: string,
  options?: { defaultWindowDays?: number },
): VisitBriefContext | null {
  const store = getStore();
  const patient = store.patients.find((p) => p.id === patientId);
  if (!patient) return null;

  const profile = store.profiles.find((p) => p.id === patient.user_id);
  const risk = store.risks.find((r) => r.patient_id === patientId);
  const recovery = store.recoveryScores.find((r) => r.patient_id === patientId);

  const now = new Date();
  const completedAppts = store.appointments
    .filter(
      (a) =>
        a.patient_id === patientId &&
        a.status === "completed" &&
        a.scheduled_at,
    )
    .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));

  const defaultDays = options?.defaultWindowDays ?? 14;
  let sinceDate: Date;
  let periodSource: VisitBriefContext["period"]["source"];
  if (completedAppts[0]) {
    sinceDate = new Date(completedAppts[0].scheduled_at);
    periodSource = "last_completed_appointment";
  } else {
    sinceDate = new Date(now.getTime() - defaultDays * 86_400_000);
    periodSource = "default_window";
  }

  const periodDays = Math.max(1, daysBetween(sinceDate, now) || defaultDays);
  const sinceIso = sinceDate.toISOString();
  const sinceDay = sinceIso.slice(0, 10);
  const inPeriodIso = (iso: string) => iso >= sinceIso;
  const inPeriodDay = (day: string) => day >= sinceDay;

  const medicines = store.medicines.filter((m) => m.patient_id === patientId);
  const events = store.medicineEvents.filter(
    (e) =>
      e.patient_id === patientId &&
      (inPeriodDay(e.date) || inPeriodIso(e.acted_at)),
  );
  const taken = events.filter(
    (e) => e.status === "taken" || e.status === "late",
  ).length;
  const missed = events.filter((e) => e.status === "missed").length;
  const skipped = events.filter((e) => e.status === "skipped").length;
  const adherencePercent =
    events.length > 0 ? Math.round((taken / events.length) * 100) : null;

  const checkIns = store.checkins
    .filter((c) => c.patient_id === patientId && inPeriodIso(c.recorded_at))
    .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));

  const vitalSeries = (
    label: string,
    pick: (c: (typeof checkIns)[number]) => number | null,
  ) => ({
    label,
    values: checkIns
      .map((c) => {
        const value = pick(c);
        return value == null ? null : { at: c.recorded_at, value };
      })
      .filter((x): x is { at: string; value: number } => Boolean(x)),
  });

  const vitals = [
    vitalSeries("BP systolic", (c) => c.bp_systolic),
    vitalSeries("BP diastolic", (c) => c.bp_diastolic),
    vitalSeries("Blood sugar", (c) => c.blood_sugar),
    vitalSeries("Oxygen", (c) => c.oxygen),
    vitalSeries("Weight", (c) => c.weight),
    vitalSeries("Pain score", (c) => c.pain_score),
  ].filter((v) => v.values.length > 0);

  const carePlan =
    store.carePlans.find(
      (p) =>
        p.patient_id === patientId &&
        (p.status === "active" || p.status === "doctor_approved"),
    ) ||
    store.carePlans
      .filter((p) => p.patient_id === patientId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0] ||
    null;

  const tasks = store.careTasks.filter(
    (t) => t.patient_id === patientId && t.active,
  );
  const completions = store.taskCompletions.filter(
    (c) => c.patient_id === patientId && c.date >= sinceDay,
  );

  const taskSummaries = tasks.map((task) => {
    const rows = completions.filter((c) => c.task_id === task.id);
    const done = rows.filter((c) => c.status === "completed").length;
    const expected = Math.max(rows.length, 1);
    return {
      title: task.title,
      period: task.period,
      completions: done,
      expected,
      completion_rate: Math.round((done / expected) * 100),
    };
  });

  const overallProgress =
    taskSummaries.length > 0
      ? Math.round(
          taskSummaries.reduce((s, t) => s + t.completion_rate, 0) /
            taskSummaries.length,
        )
      : null;

  const escalations = store.alerts
    .filter((a) => a.patient_id === patientId && inPeriodIso(a.created_at))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 12)
    .map((a) => ({
      title: a.title,
      severity: a.severity,
      status: a.status,
      reason: a.reason,
      created_at: a.created_at,
    }));

  const appointments = store.appointments
    .filter((a) => a.patient_id === patientId && inPeriodIso(a.scheduled_at))
    .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))
    .slice(0, 10)
    .map((a) => ({
      scheduled_at: a.scheduled_at,
      status: a.status,
      appointment_type: a.appointment_type,
      notes: a.notes,
    }));

  const investigations = store.investigations
    .filter((i) => i.patient_id === patientId)
    .slice(0, 10)
    .map((i) => ({
      name: i.name,
      status: i.status,
      due_date: i.due_date ?? null,
    }));

  const recentEvents: string[] = [];
  for (const a of appointments.slice(0, 3)) {
    recentEvents.push(
      `Appointment ${a.status}: ${a.appointment_type || "visit"} (${a.scheduled_at.slice(0, 10)})`,
    );
  }
  if (missed > 0) {
    recentEvents.push(`${missed} missed medication confirmation(s)`);
  }
  if (skipped > 0) {
    recentEvents.push(`${skipped} skipped medication dose(s)`);
  }
  for (const e of escalations.slice(0, 3)) {
    recentEvents.push(`Escalation (${e.severity}): ${e.title}`);
  }
  const concernNotes = checkIns.filter(
    (c) => c.symptoms.length > 0 || Boolean((c.notes || "").trim()),
  );
  if (concernNotes.length) {
    recentEvents.push(
      `${concernNotes.length} check-in(s) with patient-reported concerns`,
    );
  }

  return {
    patient: {
      id: patientId,
      name: profile?.full_name || "Patient",
      age: ageFromDob(patient.date_of_birth),
      sex: patient.sex,
      chronic_diseases: patient.chronic_diseases || [],
      risk_level: risk?.level ?? null,
      recovery_score: recovery?.score ?? null,
    },
    period: {
      days: periodDays,
      since: sinceIso,
      until: now.toISOString(),
      source: periodSource,
    },
    medications: medicines.map((m) => ({
      name: m.name,
      dose: m.dose,
      frequency: m.frequency,
      active: m.active,
    })),
    adherence: {
      percent: adherencePercent,
      taken,
      missed,
      skipped,
      total_events: events.length,
    },
    checkIns: checkIns.map((c) => ({
      recorded_at: c.recorded_at,
      symptoms: c.symptoms || [],
      notes: c.notes,
      pain_score: c.pain_score,
      mood: c.mood,
      sleep_hours: c.sleep_hours,
      medicine_taken: c.medicine_taken,
      bp_systolic: c.bp_systolic,
      bp_diastolic: c.bp_diastolic,
      blood_sugar: c.blood_sugar,
      oxygen: c.oxygen,
      weight: c.weight,
    })),
    vitals,
    carePlan: {
      status: carePlan?.status ?? null,
      tasks: taskSummaries,
      overall_progress_percent: overallProgress,
    },
    escalations,
    appointments,
    recentEvents,
    investigations,
  };
}

export function concernCounts(
  checkIns: VisitBriefContext["checkIns"],
): Array<{ topic: string; mentions: number }> {
  const counts = new Map<string, number>();
  for (const c of checkIns) {
    for (const raw of c.symptoms || []) {
      const topic = raw.trim().toLowerCase();
      if (!topic) continue;
      counts.set(topic, (counts.get(topic) || 0) + 1);
    }
    const note = (c.notes || "").toLowerCase();
    for (const key of [
      "fatigue",
      "sleep",
      "pain",
      "dizzy",
      "nausea",
      "breath",
      "anxiety",
      "fever",
    ]) {
      if (note.includes(key)) counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([topic, mentions]) => ({ topic, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 8);
}

export function vitalTrends(context: VisitBriefContext) {
  return context.vitals.map((v) => {
    const chronological = [...v.values].sort((a, b) =>
      a.at.localeCompare(b.at),
    );
    const latest = chronological[chronological.length - 1];
    return {
      label: v.label,
      latest: latest ? String(latest.value) : "—",
      trend: trendValues(chronological.map((x) => x.value)),
      recorded_at: latest?.at ?? null,
    };
  });
}
