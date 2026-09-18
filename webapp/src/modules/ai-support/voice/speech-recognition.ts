import {
  speechRecognitionLang,
  type VoiceLocale,
} from "@/modules/ai-support/voice/types";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getCtor());
}

export type RecognitionHandlers = {
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
};

/**
 * Browser Web Speech API recognizer.
 * Audio stays on-device; only text transcripts are returned.
 */
export function createSpeechRecognizer(
  locale: VoiceLocale,
  handlers: RecognitionHandlers,
): { start: () => void; stop: () => void; abort: () => void } | null {
  const Ctor = getCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = speechRecognitionLang(locale);
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let finalBuffer = "";

  recognition.onstart = () => handlers.onStart?.();

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const piece = result[0]?.transcript ?? "";
      if (result.isFinal) {
        finalBuffer = `${finalBuffer} ${piece}`.trim();
        handlers.onFinal?.(finalBuffer);
      } else {
        interim += piece;
      }
    }
    const live = `${finalBuffer} ${interim}`.trim();
    if (live) handlers.onInterim?.(live);
  };

  recognition.onerror = (event) => {
    const code = event.error || "unknown";
    if (code === "aborted" || code === "no-speech") {
      handlers.onEnd?.();
      return;
    }
    const messages: Record<string, string> = {
      "not-allowed":
        "Microphone permission denied. Allow mic access or type your message.",
      "service-not-allowed":
        "Speech recognition is blocked in this browser. Please type instead.",
      network:
        "Speech recognition needs a network connection. Please type instead.",
      "audio-capture": "No microphone found. Please type your message.",
    };
    handlers.onError?.(
      messages[code] ||
        "Voice input failed. You can type your message instead.",
    );
  };

  recognition.onend = () => handlers.onEnd?.();

  return {
    start: () => {
      finalBuffer = "";
      try {
        recognition.start();
      } catch {
        handlers.onError?.(
          "Could not start the microphone. Try again or type your message.",
        );
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    },
    abort: () => {
      try {
        recognition.abort();
      } catch {
        /* already stopped */
      }
    },
  };
}
