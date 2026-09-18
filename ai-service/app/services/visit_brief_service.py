"""AI Visit Brief — longitudinal clinician summary. Never diagnoses or treats."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone

from app.core.constants import CLINICAL_DISCLAIMER
from app.core.errors import ProviderUnavailableError
from app.core.logging import get_logger
from app.providers.openrouter_provider import OpenRouterLLM
from app.schemas.common import AiMeta
from app.schemas.visit_brief import (
    CarePlanItem,
    CheckInBriefOut,
    ConcernItem,
    MedicationBrief,
    VisitBriefRequest,
    VisitBriefResponse,
    VitalItem,
)

logger = get_logger(__name__)

SYSTEM = (
    "You are HealNexus AI Visit Brief assistant for licensed clinicians.\n"
    "Summarize longitudinal patient activity since the previous consultation.\n"
    "You MUST NOT diagnose, prescribe, recommend treatment changes, assess "
    "disease severity, or replace clinical judgment.\n"
    "You MAY summarize records, adherence, check-ins, repeated concerns, "
    "missing information, vital trends, and discussion topics for the doctor.\n"
    "Return ONLY valid JSON matching the required keys."
)


class VisitBriefService:
    module_name = "visit_brief"

    def __init__(self, llm: OpenRouterLLM | None = None) -> None:
        self._llm = llm or OpenRouterLLM()

    async def generate(self, payload: VisitBriefRequest) -> VisitBriefResponse:
        rules = self._from_rules(payload)
        if not self._llm.configured:
            return rules.model_copy(
                update={
                    "source": "local_fallback",
                    "disclaimer": (
                        f"{CLINICAL_DISCLAIMER} AI unavailable — "
                        "showing data-based summary."
                    ),
                }
            )

        try:
            llm = await self._from_llm(payload, rules)
            if llm:
                return llm
        except ProviderUnavailableError as exc:
            logger.warning("Visit brief LLM unavailable: %s", exc.detail)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Visit brief LLM error: %s", exc)

        return rules.model_copy(
            update={
                "source": "local_fallback",
                "disclaimer": (
                    f"{CLINICAL_DISCLAIMER} AI unavailable — "
                    "showing data-based summary."
                ),
            }
        )

    def _from_rules(self, payload: VisitBriefRequest) -> VisitBriefResponse:
        draft = payload.local_draft or {}
        period = payload.period or {}
        adherence = payload.adherence or {}
        care = payload.carePlan or {}
        days = int(period.get("days") or 14)

        concerns = [
            ConcernItem(topic=str(c.get("topic")), mentions=int(c.get("mentions") or 1))
            for c in (draft.get("concerns") or [])
            if c.get("topic")
        ]
        vitals = [
            VitalItem(
                label=str(v.get("label") or "Vital"),
                latest=str(v.get("latest") or "—"),
                trend=str(v.get("trend") or "insufficient"),
                recorded_at=v.get("recorded_at"),
            )
            for v in (draft.get("vitals") or [])
        ]
        care_items = [
            CarePlanItem(
                title=str(i.get("title") or "Task"),
                status=str(i.get("status") or "unknown"),
            )
            for i in (draft.get("care_plan_items") or care.get("tasks") or [])
        ]

        return VisitBriefResponse(
            period_days=days,
            period_label=f"{days} days",
            overview=str(
                draft.get("overview")
                or "Structured longitudinal summary prepared from care records."
            ),
            care_plan_progress_percent=care.get("overall_progress_percent"),
            medication=MedicationBrief(
                adherence_percent=adherence.get("percent"),
                missed_doses=int(adherence.get("missed") or 0),
                notes=list(draft.get("medication_notes") or []),
            ),
            check_ins=CheckInBriefOut(
                completed=len(payload.checkIns or []),
                expected=days,
                notes=[],
            ),
            concerns=concerns,
            vitals=vitals,
            care_plan_items=care_items,
            recent_events=list(payload.recentEvents or [])[:8],
            discussion_points=list(draft.get("discussion_points") or [])[:8]
            or ["Review care-plan progress and adherence with the patient"],
            missing_information=list(draft.get("missing_information") or []),
            source="local_fallback",
            generated_at=datetime.now(timezone.utc).isoformat(),
            disclaimer=(
                f"{CLINICAL_DISCLAIMER} AI-generated summary — "
                "Doctor verification required."
            ),
            meta=AiMeta(
                module=self.module_name,
                provider="rules",
                model_hint="deterministic_visit_brief_v1",
            ),
        )

    async def _from_llm(
        self,
        payload: VisitBriefRequest,
        rules: VisitBriefResponse,
    ) -> VisitBriefResponse | None:
        compact = {
            "patient": payload.patient,
            "period": payload.period,
            "adherence": payload.adherence,
            "medications": payload.medications[:12],
            "checkIns": payload.checkIns[:20],
            "vitals": payload.vitals[:8],
            "carePlan": payload.carePlan,
            "escalations": payload.escalations[:8],
            "appointments": payload.appointments[:8],
            "recentEvents": payload.recentEvents[:10],
            "investigations": payload.investigations[:8],
            "local_draft": payload.local_draft,
        }
        prompt = (
            "Create an AI Visit Brief JSON for a clinician from this context.\n"
            "Required keys: period_days (int), period_label (string), overview "
            "(string), care_plan_progress_percent (number|null), "
            "medication {adherence_percent, missed_doses, notes[]}, "
            "check_ins {completed, expected, notes[]}, "
            "concerns [{topic, mentions}], "
            "vitals [{label, latest, trend, recorded_at}], "
            "care_plan_items [{title, status}], "
            "recent_events [string], discussion_points [string], "
            "missing_information [string].\n"
            "trend must be one of: up, down, flat, insufficient.\n"
            "care_plan_items status must be one of: done, partial, missing, unknown.\n"
            "Do not invent labs, diagnoses, prescriptions, or severity labels.\n"
            "Keep overview to 2-4 sentences. Keep lists short.\n\n"
            f"Context:\n{json.dumps(compact)[:7000]}"
        )
        raw = await self._llm.complete(
            prompt,
            system=SYSTEM,
            temperature=0.2,
            max_tokens=900,
        )
        text = raw.strip()
        fenced = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if fenced:
            text = fenced.group(1).strip()
        data = json.loads(text)

        overview = str(data.get("overview") or "").strip()
        if not overview:
            return None

        med = data.get("medication") or {}
        check = data.get("check_ins") or {}
        concerns = [
            ConcernItem(
                topic=str(c.get("topic")),
                mentions=max(1, int(c.get("mentions") or 1)),
            )
            for c in (data.get("concerns") or [])
            if c.get("topic")
        ] or rules.concerns
        vitals = [
            VitalItem(
                label=str(v.get("label") or "Vital"),
                latest=str(v.get("latest") or "—"),
                trend=str(v.get("trend") or "insufficient"),
                recorded_at=v.get("recorded_at"),
            )
            for v in (data.get("vitals") or [])
        ] or rules.vitals
        care_items = [
            CarePlanItem(
                title=str(i.get("title") or "Task"),
                status=str(i.get("status") or "unknown"),
            )
            for i in (data.get("care_plan_items") or [])
        ] or rules.care_plan_items

        return VisitBriefResponse(
            period_days=int(data.get("period_days") or rules.period_days),
            period_label=str(data.get("period_label") or rules.period_label),
            overview=overview,
            care_plan_progress_percent=data.get(
                "care_plan_progress_percent",
                rules.care_plan_progress_percent,
            ),
            medication=MedicationBrief(
                adherence_percent=med.get(
                    "adherence_percent", rules.medication.adherence_percent
                ),
                missed_doses=int(
                    med.get("missed_doses", rules.medication.missed_doses) or 0
                ),
                notes=[str(n) for n in (med.get("notes") or []) if str(n).strip()]
                or rules.medication.notes,
            ),
            check_ins=CheckInBriefOut(
                completed=int(check.get("completed", rules.check_ins.completed) or 0),
                expected=int(check.get("expected", rules.check_ins.expected) or 0),
                notes=[str(n) for n in (check.get("notes") or []) if str(n).strip()]
                or rules.check_ins.notes,
            ),
            concerns=concerns[:8],
            vitals=vitals[:8],
            care_plan_items=care_items[:8],
            recent_events=[
                str(e) for e in (data.get("recent_events") or []) if str(e).strip()
            ][:8]
            or rules.recent_events,
            discussion_points=[
                str(e)
                for e in (data.get("discussion_points") or [])
                if str(e).strip()
            ][:8]
            or rules.discussion_points,
            missing_information=[
                str(e)
                for e in (data.get("missing_information") or [])
                if str(e).strip()
            ][:8]
            or rules.missing_information,
            source="ai",
            generated_at=datetime.now(timezone.utc).isoformat(),
            disclaimer=(
                f"{CLINICAL_DISCLAIMER} AI-generated summary — "
                "Doctor verification required."
            ),
            meta=AiMeta(
                module=self.module_name,
                provider=f"openrouter:{self._llm.model}",
                model_hint=self._llm.model,
            ),
        )
