import type { CareCompanionResult } from "@/services/ai.service";

/** Offline / demo fallback when ai-service is unreachable — organizes doctor text only. */
export function organizeCareCompanionLocal(input: {
  diagnosis?: string;
  medicines?: string;
  doctor_notes?: string;
  diet_advice?: string;
  exercise_advice?: string;
  restrictions?: string;
  follow_up_date?: string;
  patient_name?: string;
  hospital_name?: string;
  investigations?: string;
}): CareCompanionResult {
  const meds = (input.medicines || "")
    .split("\n")
    .map((l) => l.trim().replace(/^[-•]\s*/, ""))
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[-–—,]/).map((p) => p.trim());
      return {
        name: parts[0] || line,
        dose: parts[1] || null,
        frequency: parts[2] || "As directed by doctor",
        instructions: "Take exactly as prescribed by your doctor.",
      };
    });

  const diet =
    input.diet_advice || "Follow the diet advice written by your doctor.";
  const exercise =
    input.exercise_advice ||
    "Do only the activity level approved in your discharge plan.";
  const name = input.patient_name || "You";

  return {
    daily_schedule: {
      morning: [
        { title: "Breakfast", detail: diet, category: "meal" },
        {
          title: "Water reminder",
          detail: "Drink a full glass of water unless restricted by your doctor.",
          category: "hydration",
        },
        {
          title: "Home vitals",
          detail: "Record BP / sugar if your doctor asked you to monitor at home.",
          category: "monitoring",
        },
      ],
      afternoon: [
        {
          title: "Gentle activity",
          detail: exercise,
          category: "activity",
        },
        ...(input.investigations
          ? [
              {
                title: "Investigation reminder",
                detail:
                  "Complete prescribed lab/imaging tests on time. Follow preparation instructions. Do not interpret results yourself — your doctor will review them.",
                category: "monitoring",
              },
            ]
          : []),
        {
          title: "Hydration",
          detail: "Sip water through the afternoon.",
          category: "hydration",
        },
      ],
      evening: [
        { title: "Dinner", detail: diet, category: "meal" },
        {
          title: "Daily check-in",
          detail: "Log vitals, mood, and symptoms in HealNexus.",
          category: "monitoring",
        },
      ],
      night: [
        {
          title: "Sleep reminder",
          detail: "Aim for restful sleep; avoid late heavy meals if advised.",
          category: "rest",
        },
      ],
    },
    patient_friendly_explanation:
      `${name} is recovering after care related to ${input.diagnosis || "your recent hospital stay"}. ` +
      `This plan organizes your doctor's advice into meals, activity, and check-ins. ` +
      `Log each prescribed dose on the Medicines page (${meds.length} medicine item(s) listed exactly as written). ` +
      (input.follow_up_date
        ? `Follow-up is planned for ${input.follow_up_date}. `
        : "") +
      "The AI Care Companion does not diagnose or change prescriptions.",
    caregiver_instructions:
      "Help the patient take medicines on the written schedule, keep a vitals/symptom log, support meals and hydration, and escort them for follow-up. " +
      (input.investigations
        ? "Remind them about upcoming investigations and help with fasting/travel to the lab if needed. "
        : "") +
      "Do not add new medicines. Escalate for chest pain, severe breathlessness, confusion, fainting, or sudden worsening. " +
      "Never interpret lab or imaging results.",
    warning_signs: [
      "Chest pain or pressure",
      "Severe shortness of breath",
      "Confusion, fainting, or inability to wake normally",
      "Uncontrolled vomiting or inability to keep medicines down",
      "Very high fever or blood sugar far outside the doctor's range",
    ],
    next_steps: [
      "Follow today's meals, hydration, and activity. Log each medicine dose on the Medicines page",
      "Complete daily health check-ins in HealNexus",
      "Do not change medicines without speaking to your doctor",
      ...(input.investigations
        ? [
            "Complete prescribed investigations on or before the due date",
            "Upload the report in HealNexus if available — your doctor reviews it (AI never interprets results)",
          ]
        : []),
      input.follow_up_date
        ? `Attend follow-up on ${input.follow_up_date}`
        : "Confirm your next clinic appointment with the care team",
    ],
    organized_medicines: meds,
    meta: {
      provider: "local_organizer",
      disclaimer:
        "AI Care Companion assists only. It never diagnoses, never prescribes, and never replaces your doctor.",
    },
  };
}
