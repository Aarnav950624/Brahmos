import { runAiCheckup } from "@/modules/ai-support/checkup-engine";
import {
  formatHospitalAnswer,
  queryAiDatabase,
  shouldPreferDatabase,
} from "@/modules/ai-support/database";
import { buildLivePatientSnapshot } from "@/modules/ai-support/patient-snapshot";
import {
  nearbyGovernmentFacilities,
  nearbyPharmacies,
} from "@/data/ahmedabad-care-sites";
import { getEducationCards } from "@/modules/rural/services/education.service";
import type { AiAssistantResult } from "@/services/ai.service";
import {
  askHealthAssistant as askRemote,
  isAiServiceConfigured,
} from "@/services/ai.service";

const DISCLAIMER =
  "AI Care Companion assists only. It never diagnoses, never prescribes, and never replaces your doctor. Hospital/PM-JAY answers come from the HealNexus database.";

function foldQuery(raw: string): string {
  let q = raw.toLowerCase();
  const pairs: Array<[RegExp, string]> = [
    [/દવાખાને|અસ્પતાલ|अस्पताल|हॉस्पिटल/g, " hospital "],
    [/દવા|दवा|दवाई|dava|dawai/g, " medicine "],
    [/ક્યારે|कब|समय/g, " when "],
    [/લેવાની|लेनी|लेना/g, " take "],
    [/બીપી|बीपी|\bbp\b/g, " bp "],
    [/શુગર|शुगर|sugar/g, " sugar "],
    [/કેટલું|कितना|कितनी/g, " how much "],
    [/કાલે|कल /g, " tomorrow "],
    [/લઈ જવું|ले जाना|ले जाऊं/g, " bring "],
    [/મળતી નથી|नहीं मिल|unavailable|can'?t find|cannot find|not available/g, " medicine unavailable "],
    [/જવું છે|जाना है/g, " visit "],
  ];
  for (const [re, en] of pairs) q = q.replace(re, en);
  return q.replace(/\s+/g, " ").trim();
}

function localReply(
  question: string,
  userOrPatientId: string,
): AiAssistantResult {
  const db = queryAiDatabase(question, userOrPatientId);
  const snap = buildLivePatientSnapshot(userOrPatientId);
  const checkup = runAiCheckup(userOrPatientId);
  const q = foldQuery(question);

  if (!snap || !checkup) {
    // Still answer hospital/PM-JAY from registry without patient login
    if (db.topic === "hospitals" || db.topic === "pmjay" || /hospital|pm-?jay|opd/.test(q)) {
      const formatted = formatHospitalAnswer(db, question);
      return {
        summary: formatted.summary,
        key_points: formatted.key_points,
        when_to_contact_doctor: [
          "For emergencies dial 108",
          "Verify PM-JAY packages at the hospital help desk",
        ],
        disclaimer: DISCLAIMER,
        provider: "healnexus-db",
      };
    }
    return {
      summary:
        "I could not load your live patient record. Sign in as a patient, or ask about PM-JAY hospitals in our database.",
      key_points: [],
      when_to_contact_doctor: [
        "Chest pain, severe breathlessness, confusion, or fainting",
      ],
      disclaimer: DISCLAIMER,
      provider: "healnexus-db",
    };
  }

  const key_points: string[] = [];
  let summary = "";
  let provider = "healnexus-db";

  // --- Database-first topics (never invent hospitals / meds / labs) ---
  if (
    db.topic === "hospitals" ||
    db.topic === "pmjay" ||
    (/hospital|opd/.test(q) && /pm-?jay|ayushman|empanel|cashless|opd/.test(q)) ||
    (/hospital/.test(q) && !/refer|specialist/.test(q))
  ) {
    const formatted = formatHospitalAnswer(db, question);
    summary = formatted.summary;
    key_points.push(...formatted.key_points);
    if (db.benefits_summary) key_points.push(db.benefits_summary);
  } else if (db.topic === "benefits") {
    summary =
      db.benefits_summary ||
      "Open Benefits & PM-JAY in the app to assess eligibility and link ABHA.";
    key_points.push(
      ...db.hospitals.slice(0, 3).map((h) => `${h.name} · ${h.area} · PM-JAY`),
      "Helpline 14555 for national PM-JAY guidance",
    );
  } else if (/hello|hi\b|hey|namaste|good morning|good evening/.test(q)) {
    summary = `Hi ${snap.full_name.split(" ")[0]} — I'm here for your care plan, medicines, labs, and hospitals. What would you like to know?`;
    key_points.push(
      "Ask about today's tasks, medicines, labs, or PM-JAY hospitals",
      `Live recovery ${checkup.recovery_score} · risk ${checkup.overall_risk}`,
    );
  } else if (/thank/.test(q)) {
    summary =
      "You're welcome. Follow your doctor-approved plan, and ask anytime if a task or medicine is unclear.";
  } else if (
    /risk|score|recover|readmit|checkup|assess/.test(q)
  ) {
    summary = checkup.summary;
    key_points.push(
      `Overall risk: ${checkup.overall_risk}`,
      `Recovery Score: ${checkup.recovery_score}`,
      `Readmission ≈ ${checkup.readmission_probability_percent}%`,
      ...checkup.disease_scores
        .filter((d) => d.score > 0)
        .slice(0, 3)
        .map((d) => `${d.label} score ${d.score} (${d.band})`),
    );
  } else if (/lab|investig|test|screen|missing|blood report/.test(q)) {
    summary = checkup.missing_investigations.length
      ? `From your live investigations record: ${checkup.missing_investigations.length} screening test(s) look missing or not yet ordered.`
      : "No major missing screening tests vs your conditions and ordered labs in the database.";
    key_points.push(
      ...checkup.missing_investigations
        .slice(0, 5)
        .map((m) => `${m.test_name}: ${m.reason}`),
      ...db.investigations.slice(0, 4),
    );
  } else if (
    /medicine unavailable|cannot find medicine|can't find/.test(q)
  ) {
    const pharmacies = nearbyPharmacies(null, 2);
    const gov = nearbyGovernmentFacilities(null, 2);
    summary =
      "Do not change your medicine yourself. Contact your doctor or health worker. HealNexus will not suggest a substitute drug.";
    key_points.push(
      snap.medicines.length
        ? `On your list: ${snap.medicines.map((m) => m.name).join(", ")}`
        : "No active medicines on file",
      "On Medicines, tap “I can't find my medicine” so your health worker gets a task",
      ...pharmacies.map(
        (p) => `Nearby pharmacy: ${p.name}${p.open_now ? " (open)" : " (closed)"}`,
      ),
      ...gov.map((p) => `Government facility: ${p.name}`),
    );
  } else if (
    (/tomorrow|visit|hospital|appointment/.test(q) &&
      /bring|take|pack|what (do i|should i) (take|bring)/.test(q)) ||
    (/hospital/.test(q) && /tomorrow|visit/.test(q) && /bring|take|what/.test(q))
  ) {
    const next = db.appointments.find((a) => a.status === "scheduled");
    summary = next
      ? `Your next visit on file is ${new Date(next.when).toLocaleString()} with ${next.doctor} at ${next.location}. Pack only what is already on your care record.`
      : "I do not see a dated appointment yet. Pack your Health Passport (offline card), current medicine strips, and latest reports — your doctor decides the rest.";
    key_points.push(
      "Health Passport / offline health card on this phone",
      snap.medicines.length
        ? `Medicines on file: ${snap.medicines.map((m) => m.name).join(", ")}`
        : "No medicines listed — ask your doctor what to bring",
      "Do not start a new medicine for the visit",
    );
  } else if (/medicine|pill|dose|tablet|drug/.test(q)) {
    const named = snap.medicines.find((m) =>
      q.includes(m.name.toLowerCase()),
    );
    if (named) {
      summary = `${named.name}${named.dose ? ` ${named.dose}` : ""} is on your care plan${
        named.time_slots.length ? ` — ${named.time_slots.join(", ")}` : ""
      }. Take it only as your doctor prescribed; I cannot change dose.`;
      key_points.push(
        named.frequency
          ? `Frequency on file: ${named.frequency}`
          : "Follow the instructions on your Medicines page",
      );
    } else if (/when|time|schedule|morning|night|lunch/.test(q)) {
      summary = snap.medicines.length
        ? "Here is when your listed medicines are scheduled. Confirm with your doctor or pharmacist if a pack looks different."
        : "No active medicines in your list yet.";
      key_points.push(
        ...snap.medicines.map(
          (m) =>
            `${m.name}${m.dose ? ` ${m.dose}` : ""} · ${m.time_slots.join(", ") || m.frequency || "as directed"}`,
        ),
      );
    } else if (/explain|what|why|for/.test(q)) {
      summary = snap.medicines.length
        ? `You have ${snap.medicines.length} active medicine(s) on file. I can list names and times from your care plan — I cannot explain why they were prescribed or suggest changes.`
        : "No active medicines in the database — add them under Medicines or ask your doctor.";
      key_points.push(
        ...snap.medicines.map(
          (m) =>
            `${m.name}${m.dose ? ` ${m.dose}` : ""} · ${m.time_slots.join(", ") || m.frequency || "as directed"}`,
        ),
        "Use Scan Medicine on the Medicines page to match a pack to this list",
      );
    } else {
      summary = snap.medicines.length
        ? `From your medicines list: ${snap.medicines.length} active medicine(s).`
        : "No active medicines in the database — add them under Medicines or ask your doctor.";
      key_points.push(
        ...snap.medicines.map(
          (m) =>
            `${m.name}${m.dose ? ` ${m.dose}` : ""} · ${m.time_slots.join(", ") || m.frequency || "as directed"}`,
        ),
      );
    }
  } else if (/appointment|visit|schedule|book/.test(q)) {
    summary = db.appointments.length
      ? `You have ${db.appointments.length} recent appointment(s) in the database.`
      : "No appointments on file — open Appointments to request one.";
    key_points.push(
      ...db.appointments.map(
        (a) =>
          `${new Date(a.when).toLocaleString()} · ${a.doctor} · ${a.status} · ${a.location}`,
      ),
    );
  } else if (/symptom|warning|danger|emergency|pain|breath/.test(q)) {
    summary = checkup.warning_signs.length
      ? `From your live alerts/vitals: ${checkup.warning_signs.length} warning signal(s).`
      : "No acute warning signs on your latest live data.";
    key_points.push(...checkup.warning_signs.slice(0, 6));
    if (/emergency|108/.test(q)) {
      const emerg = queryAiDatabase("emergency hospital", userOrPatientId).hospitals;
      key_points.push(
        ...emerg.slice(0, 3).map((h) => `Emergency: ${h.name} · ${h.phone}`),
      );
    }
  } else if (
    /when to (call|contact|see)|contact (a |the |my )?doctor|warning signs?/.test(
      q,
    )
  ) {
    summary =
      "Contact your doctor or emergency services if warning signs appear. I cannot decide urgency for you.";
    key_points.push(
      ...(checkup.warning_signs.slice(0, 5).length
        ? checkup.warning_signs.slice(0, 5)
        : ["Chest pain, severe breathlessness, confusion, fainting, or sudden weakness"]),
    );
  } else if (
    /specialist|referr|who is my doctor|my (assigned )?doctor|care team/.test(q)
  ) {
    summary = checkup.referral.message;
    key_points.push(
      `Urgency: ${checkup.referral.urgency}`,
      `Specialty: ${checkup.referral.specialty}`,
      ...checkup.referral.reasons,
      ...db.doctors.slice(0, 2).map((d) => `Panel: ${d.name} · ${d.specialty} · ${d.hospital}`),
    );
  } else if (/habit|lifestyle|exercise|sleep|salt|sugar control/.test(q)) {
    summary = `Your saved lifestyle targets in the database: exercise ${snap.lifestyle.exercise_minutes_week} min/week, sleep ${snap.lifestyle.sleep_hours} hrs, salt ${snap.lifestyle.salt_level}, sugar control ${snap.lifestyle.sugar_control}.`;
    key_points.push(
      "Open Care Plan → Lifestyle Simulator to adjust habits",
      `Current Recovery Score ${checkup.recovery_score}`,
      `Risk band ${checkup.overall_risk}`,
    );
  } else if (/vital|bp|sugar|check-?in|weight/.test(q)) {
    const v = checkup.latest_vitals;
    summary = v.recorded_at
      ? `Latest check-in in the database (${new Date(v.recorded_at).toLocaleString()}): BP ${v.bp}, sugar ${v.sugar || "—"}, weight ${v.weight || "—"}.`
      : "No check-in vitals in the database yet — complete Check-in.";
    key_points.push(
      ...(v.symptoms.length
        ? [`Symptoms: ${v.symptoms.join(", ")}`]
        : ["No symptoms logged on latest check-in"]),
      `Check-ins on file: ${snap.checkin_count}`,
    );
  } else if (/care plan|today'?s (care|task)|my (care )?tasks/.test(q)) {
    summary =
      snap.care_plan_summary ||
      "Your care plan is doctor-approved recovery guidance stored in HealNexus.";
    key_points.push(
      ...checkup.next_actions.slice(0, 4),
      ...snap.care_plan_warning_signs.slice(0, 2).map((w) => `Watch: ${w}`),
    );
  } else if (
    /who is my doctor|my care team|which doctor|assigned doctor/.test(q)
  ) {
    summary = db.doctors.length
      ? `Doctors linked in the HealNexus database: ${db.doctors.length}.`
      : "No doctor profiles found.";
    key_points.push(
      ...db.doctors.map((d) => `${d.name} · ${d.specialty} · ${d.hospital}`),
    );
  } else if (/educat|learn|diet|salt|walk|tip/.test(q)) {
    const locale =
      /[\u0A80-\u0AFF]/.test(question)
        ? "gu"
        : /[\u0900-\u097F]/.test(question)
          ? "hi"
          : "en";
    const cards = getEducationCards(locale);
    const topic = /medicine/.test(q)
      ? "medicine"
      : /walk|exercise/.test(q)
        ? "exercise"
        : /diet|salt/.test(q)
          ? "diet"
          : "warning_signs";
    const card = cards.find((c) => c.topic === topic) || cards[0];
    summary = card
      ? `${card.title}: ${card.body} This is approved education, not a diagnosis.`
      : "Open Education in the app for doctor-approved tips.";
    key_points.push(...(card?.bullets || []).slice(0, 3));
  } else {
    const asked = question.trim().replace(/\s+/g, " ").slice(0, 140);
    summary = `About “${asked}”: I can help from your HealNexus record — medicines, today's care tasks, labs, appointments, and PM-JAY hospitals. I cannot diagnose or change prescriptions.`;
    key_points.push(
      `Live recovery ${checkup.recovery_score} · risk ${checkup.overall_risk}`,
      "Ask a specific question (for example: when do I take Metformin?)",
    );
    provider = "healnexus-db";
  }

  const wantsSafety =
    /symptom|warning|danger|emergency|pain|breath|urgent|chest|when to (call|contact)|contact (a |the |my )?doctor/.test(
      q,
    );
  const when_to_contact_doctor = wantsSafety
    ? [
        ...checkup.warning_signs.slice(0, 3),
        "Chest pain, severe breathlessness, confusion, fainting, or sudden weakness",
        "Contact your doctor if symptoms worsen or medicines cannot be taken",
      ]
    : [];

  return {
    summary,
    key_points: key_points.filter(Boolean).slice(0, 8),
    when_to_contact_doctor: [...new Set(when_to_contact_doctor)].slice(0, 5),
    disclaimer: DISCLAIMER,
    provider,
  };
}

/**
 * Grounded assistant linked to HealNexus database.
 * Optional ai-service (OpenRouter) answers with HealNexus patient_context.
 * Hospital / PM-JAY registry stays local so facilities are never invented.
 */
export async function askGroundedAssistant(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  userOrPatientId: string,
  options?: { locale?: "en" | "hi" | "gu" },
): Promise<AiAssistantResult> {
  const locale = options?.locale === "hi" || options?.locale === "gu"
    ? options.locale
    : "en";
  const last = [...messages].reverse().find((m) => m.role === "user");
  if (!last?.content) {
    const checkup = runAiCheckup(userOrPatientId);
    return {
      summary: checkup
        ? `Hi ${checkup.patient_name.split(" ")[0]} — connected to your HealNexus record (risk ${checkup.overall_risk}, recovery ${checkup.recovery_score}).`
        : "Ask about hospitals, PM-JAY, labs, or recovery — I read the HealNexus database.",
      key_points: checkup?.next_actions.slice(0, 4) || [],
      when_to_contact_doctor: checkup?.warning_signs.slice(0, 3) || [],
      disclaimer: DISCLAIMER,
      provider: "healnexus-db",
    };
  }

  const db = queryAiDatabase(last.content, userOrPatientId);
  const local = localReply(last.content, userOrPatientId);

  // Hospital / PM-JAY registry only — never let the LLM invent facilities.
  if (shouldPreferDatabase(db.topic)) {
    return { ...local, provider: "healnexus-db" };
  }

  if (!isAiServiceConfigured()) {
    return { ...local, provider: "healnexus-db (AI service URL missing)" };
  }

  try {
    const remote = await askRemote(messages, {
      patient_context: db.context_json,
      local_summary: local.summary,
      locale,
    });
    if (remote.provider === "stub" || remote.provider === "error") {
      return {
        ...local,
        summary: `${remote.summary || local.summary}`,
        provider: `local-fallback (${remote.provider})`,
      };
    }
    return {
      summary: remote.summary,
      key_points: (remote.key_points || []).slice(0, 8),
      when_to_contact_doctor: (remote.when_to_contact_doctor || []).slice(0, 4),
      disclaimer: DISCLAIMER,
      provider: remote.provider.includes("openrouter")
        ? remote.provider
        : `openrouter+${remote.provider}`,
    };
  } catch {
    return {
      ...local,
      provider: "local-fallback (AI request failed)",
    };
  }
}

export function formatAssistantBubble(result: AiAssistantResult): string {
  const parts = [result.summary.trim()];
  if (result.key_points?.length) {
    parts.push("", ...result.key_points.map((p) => `• ${p}`));
  }
  if (result.when_to_contact_doctor?.length) {
    parts.push(
      "",
      "When to contact a doctor:",
      ...result.when_to_contact_doctor.map((p) => `• ${p}`),
    );
  }
  return parts.join("\n");
}

export function greetingFromLive(userOrPatientId: string): string {
  const checkup = runAiCheckup(userOrPatientId);
  if (!checkup) {
    return "Hi — I'm linked to the HealNexus hospital & care database. Ask about PM-JAY hospitals, OPD, or sign in as a patient for your live risk scores.";
  }
  return `Hi ${checkup.patient_name.split(" ")[0]} — I'm your AI support assistant linked to the HealNexus database. Live risk ${checkup.overall_risk} · Recovery ${checkup.recovery_score}. Ask about PM-JAY hospitals, missing labs, medicines, or warning signs.`;
}
