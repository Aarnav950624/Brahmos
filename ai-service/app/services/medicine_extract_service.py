"""Medicine label identification from a photo — OCR/vision extract only.

Never prescribes, never recommends medicines or dosage changes, never judges
medical appropriateness. Confidence must stay honest when the label is unclear.
"""

from __future__ import annotations

import json
import re
from typing import Any

from app.core.constants import CLINICAL_DISCLAIMER
from app.core.errors import ProviderUnavailableError
from app.core.logging import get_logger
from app.providers.openrouter_provider import OpenRouterLLM
from app.schemas.common import AiMeta
from app.schemas.medicine_extract import (
    MedicineExtractRequest,
    MedicineExtractResponse,
)

logger = get_logger(__name__)

IDENTIFY_DISCLAIMER = (
    f"{CLINICAL_DISCLAIMER} Medicine camera scan identifies packaging text only. "
    "It never confirms whether a medicine is appropriate for you. "
    "Verify with your doctor or pharmacist before taking any medicine."
)

SYSTEM = (
    "You extract printed medicine names from packaging photos for HealNexus.\n"
    "You MUST NOT prescribe, recommend medicines, suggest dosages, or judge "
    "whether a medicine is medically appropriate.\n"
    "Read only what is visible on the box, strip, or blister pack.\n"
    "If the label is blurry, partial, or unclear, set confidence low "
    "(below 0.5) and leave medicineName null or best-guess with low confidence.\n"
    "Return ONLY valid JSON with keys: medicineName, strength, form, "
    "confidence (0-1), rawHints (array of short visible text snippets)."
)

USER_PROMPT = (
    "Identify the medicine printed on this photo.\n"
    "Extract:\n"
    "- medicineName: brand or generic name if clearly readable\n"
    "- strength: e.g. 500 mg if visible, else null\n"
    "- form: tablet, capsule, syrup, etc. if visible, else null\n"
    "- confidence: 0.0–1.0 honest estimate of label readability\n"
    "- rawHints: up to 5 short text fragments you can see\n"
    "Do not invent a name that is not visible. "
    "If unsure, lower confidence and say so via null/empty name."
)


class MedicineExtractService:
    module_name = "medicine_extract"

    def __init__(self, llm: OpenRouterLLM | None = None) -> None:
        self._llm = llm or OpenRouterLLM()

    async def extract(
        self, payload: MedicineExtractRequest
    ) -> MedicineExtractResponse:
        if not self._llm.configured:
            return self._unavailable("AI vision is not configured.")

        data_url = f"data:{payload.mime_type};base64,{payload.image_base64}"

        try:
            raw = await self._llm.complete_vision(
                USER_PROMPT,
                image_data_url=data_url,
                system=SYSTEM,
                temperature=0.05,
                max_tokens=350,
            )
        except ProviderUnavailableError as exc:
            logger.warning("Medicine extract unavailable: %s", exc.detail)
            return self._unavailable(str(exc.detail))
        except Exception as exc:  # noqa: BLE001
            logger.warning("Medicine extract error: %s", exc)
            return self._unavailable("Unable to read medicine image.")

        parsed = self._parse_llm_json(raw)
        name = self._clean_str(parsed.get("medicineName") or parsed.get("medicine_name"))
        strength = self._clean_str(parsed.get("strength"))
        form = self._clean_str(parsed.get("form"))
        confidence = self._clamp_confidence(parsed.get("confidence"))
        hints = self._clean_hints(parsed.get("rawHints") or parsed.get("raw_hints"))

        # Honest confidence: no name → force low
        if not name:
            confidence = min(confidence, 0.35)
        elif confidence >= 0.5 and len(name) < 3:
            confidence = min(confidence, 0.4)

        return MedicineExtractResponse(
            medicineName=name,
            strength=strength,
            form=form,
            confidence=confidence,
            rawHints=hints,
            source="ai",
            disclaimer=IDENTIFY_DISCLAIMER,
            meta=AiMeta(
                module=self.module_name,
                provider=self._llm.name,
                model_hint=self._llm.model,
                disclaimer=IDENTIFY_DISCLAIMER,
            ),
        )

    def _unavailable(self, reason: str) -> MedicineExtractResponse:
        return MedicineExtractResponse(
            medicineName=None,
            strength=None,
            form=None,
            confidence=0.0,
            rawHints=[],
            source="unavailable",
            disclaimer=f"{IDENTIFY_DISCLAIMER} ({reason})",
            meta=AiMeta(
                module=self.module_name,
                provider="unavailable",
                model_hint="none",
                disclaimer=IDENTIFY_DISCLAIMER,
            ),
        )

    @staticmethod
    def _parse_llm_json(raw: str) -> dict[str, Any]:
        text = raw.strip()
        fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", text, re.IGNORECASE)
        if fence:
            text = fence.group(1).strip()
        try:
            data = json.loads(text)
            if isinstance(data, dict):
                return data
        except json.JSONDecodeError:
            pass
        # Best-effort: find first {...}
        brace = re.search(r"\{[\s\S]*\}", text)
        if brace:
            try:
                data = json.loads(brace.group(0))
                if isinstance(data, dict):
                    return data
            except json.JSONDecodeError:
                pass
        return {}

    @staticmethod
    def _clean_str(value: Any) -> str | None:
        if value is None:
            return None
        text = str(value).strip()
        if not text or text.lower() in {"null", "none", "n/a", "unknown", "-"}:
            return None
        return text[:120]

    @staticmethod
    def _clamp_confidence(value: Any) -> float:
        try:
            num = float(value)
        except (TypeError, ValueError):
            return 0.0
        return max(0.0, min(1.0, num))

    @staticmethod
    def _clean_hints(value: Any) -> list[str]:
        if not isinstance(value, list):
            return []
        out: list[str] = []
        for item in value[:5]:
            text = str(item or "").strip()
            if text:
                out.append(text[:80])
        return out
