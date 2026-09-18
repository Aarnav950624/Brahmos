import {
  speechSynthesisLang,
  type VoiceLocale,
} from "@/modules/ai-support/voice/types";

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function scoreVoice(voice: SpeechSynthesisVoice, locale: VoiceLocale): number {
  const lang = voice.lang.toLowerCase();
  const name = voice.name.toLowerCase();
  const target = speechSynthesisLang(locale).toLowerCase();
  let score = 0;
  if (lang === target) score += 100;
  else if (lang.startsWith(target.slice(0, 2))) score += 60;
  if (locale === "hi" && (lang.includes("hi") || name.includes("hindi"))) {
    score += 40;
  }
  if (
    locale === "gu" &&
    (lang.includes("gu") || name.includes("gujarati"))
  ) {
    score += 40;
  }
  if (locale === "en" && lang.startsWith("en")) score += 30;
  if (name.includes("natural") || name.includes("neural")) score += 10;
  if (voice.localService) score += 5;
  return score;
}

export function pickVoice(locale: VoiceLocale): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    [...voices].sort(
      (a, b) => scoreVoice(b, locale) - scoreVoice(a, locale),
    )[0] || null
  );
}

export type SpeakHandlers = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
};

export function sanitizeForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_`#~>|-]+/g, " ")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Browser-native TTS. No audio leaves the device. */
export function speakText(
  text: string,
  locale: VoiceLocale,
  handlers: SpeakHandlers = {},
): { stop: () => void } {
  if (!isSpeechSynthesisSupported()) {
    handlers.onError?.("Voice playback isn't supported in this browser.");
    return { stop: () => undefined };
  }

  const clean = sanitizeForSpeech(text);
  if (!clean) {
    handlers.onEnd?.();
    return { stop: () => undefined };
  }

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = speechSynthesisLang(locale);
  const voice = pickVoice(locale);
  if (voice) utter.voice = voice;
  utter.rate = locale === "en" ? 1 : 0.95;

  utter.onstart = () => handlers.onStart?.();
  utter.onend = () => handlers.onEnd?.();
  utter.onerror = () => {
    handlers.onError?.("Could not play the spoken response.");
    handlers.onEnd?.();
  };

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    const once = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", once);
      const v = pickVoice(locale);
      if (v) utter.voice = v;
      window.speechSynthesis.speak(utter);
    };
    window.speechSynthesis.addEventListener("voiceschanged", once);
  } else {
    window.speechSynthesis.speak(utter);
  }

  return {
    stop: () => {
      window.speechSynthesis.cancel();
      handlers.onEnd?.();
    },
  };
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}
