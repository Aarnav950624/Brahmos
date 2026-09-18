from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import AiMeta


class MedicineExtractRequest(BaseModel):
    """Temporary image payload — not persisted by the AI service."""

    model_config = ConfigDict(populate_by_name=True)

    image_base64: str = Field(
        ...,
        alias="imageBase64",
        min_length=32,
        description="Raw base64 image bytes (no data: URL prefix required).",
    )
    mime_type: str = Field(
        default="image/jpeg",
        alias="mimeType",
        description="image/jpeg | image/png | image/webp",
    )

    @field_validator("image_base64")
    @classmethod
    def strip_data_url(cls, value: str) -> str:
        text = value.strip()
        if "," in text and text.lower().startswith("data:"):
            text = text.split(",", 1)[1]
        # Reject obviously tiny / empty payloads
        if len(text) < 32:
            raise ValueError("imageBase64 is too short")
        return text

    @field_validator("mime_type")
    @classmethod
    def normalize_mime(cls, value: str) -> str:
        mime = (value or "image/jpeg").strip().lower()
        allowed = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
        if mime == "image/jpg":
            mime = "image/jpeg"
        if mime not in allowed:
            raise ValueError("mimeType must be image/jpeg, image/png, or image/webp")
        return mime


class MedicineExtractResponse(BaseModel):
    """Identification-only result. Never a prescription or dosage advice."""

    model_config = ConfigDict(populate_by_name=True)

    medicineName: str | None = None
    strength: str | None = None
    form: str | None = None
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    rawHints: list[str] = Field(default_factory=list)
    source: str = "ai"
    disclaimer: str
    meta: AiMeta
