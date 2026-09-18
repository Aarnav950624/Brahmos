import type { AppLocale } from "@/i18n/dictionaries";

/** Voice UX states for the Care Companion mic/speaker. */
export type VoiceUxState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

/** Voice-capable locales (no Marathi). */
export type VoiceLocale = Extract<AppLocale, "en" | "hi" | "gu">;

export function toVoiceLocale(locale: AppLocale): VoiceLocale {
  if (locale === "hi" || locale === "gu") return locale;
  return "en";
}

/** BCP-47 tags for Web Speech API. */
export function speechRecognitionLang(locale: VoiceLocale): string {
  if (locale === "hi") return "hi-IN";
  if (locale === "gu") return "gu-IN";
  return "en-IN";
}

export function speechSynthesisLang(locale: VoiceLocale): string {
  return speechRecognitionLang(locale);
}

export function voiceStatusLabel(state: VoiceUxState): string {
  switch (state) {
    case "listening":
      return "Listening…";
    case "processing":
      return "Processing…";
    case "speaking":
      return "Playing response…";
    case "error":
      return "Voice error";
    default:
      return "Tap to dictate";
  }
}
