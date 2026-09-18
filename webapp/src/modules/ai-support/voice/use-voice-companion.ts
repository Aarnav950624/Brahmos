import { useCallback, useEffect, useRef, useState } from "react";

import type { AppLocale } from "@/i18n/dictionaries";
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
} from "@/modules/ai-support/voice/speech-recognition";
import {
  isSpeechSynthesisSupported,
  speakText,
  stopSpeaking,
} from "@/modules/ai-support/voice/speech-synthesis";
import {
  toVoiceLocale,
  type VoiceLocale,
  type VoiceUxState,
} from "@/modules/ai-support/voice/types";

type Options = {
  locale: AppLocale;
  onTranscriptReady?: (text: string) => void;
  onLiveTranscript?: (text: string) => void;
};

export function useVoiceCompanion({
  locale,
  onTranscriptReady,
  onLiveTranscript,
}: Options) {
  const voiceLocale: VoiceLocale = toVoiceLocale(locale);
  const [state, setState] = useState<VoiceUxState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [supported] = useState(() => ({
    recognition: isSpeechRecognitionSupported(),
    synthesis: isSpeechSynthesisSupported(),
  }));

  const recognizerRef = useRef<ReturnType<
    typeof createSpeechRecognizer
  > | null>(null);
  const speakStopRef = useRef<(() => void) | null>(null);
  const transcriptRef = useRef("");
  const sessionRef = useRef(0);
  const cancelledRef = useRef(false);
  const onReadyRef = useRef(onTranscriptReady);
  const onLiveRef = useRef(onLiveTranscript);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    onReadyRef.current = onTranscriptReady;
    onLiveRef.current = onLiveTranscript;
  }, [onTranscriptReady, onLiveTranscript]);

  const resetIdle = useCallback(() => {
    setState("idle");
    setStatusMessage("");
  }, []);

  const stopPlayback = useCallback(() => {
    speakStopRef.current?.();
    speakStopRef.current = null;
    stopSpeaking();
  }, []);

  const stopListening = useCallback(() => {
    cancelledRef.current = false;
    recognizerRef.current?.stop();
  }, []);

  const cancelListening = useCallback(() => {
    cancelledRef.current = true;
    sessionRef.current += 1;
    recognizerRef.current?.abort();
    recognizerRef.current = null;
    transcriptRef.current = "";
    stopPlayback();
    resetIdle();
  }, [resetIdle, stopPlayback]);

  const startListening = useCallback(() => {
    setError(null);
    if (!supported.recognition) {
      const msg =
        "Voice input isn't supported in this browser. You can type your message instead.";
      setError(msg);
      setState("error");
      setStatusMessage(msg);
      return;
    }

    stopPlayback();
    transcriptRef.current = "";
    cancelledRef.current = false;
    const session = ++sessionRef.current;

    const recognizer = createSpeechRecognizer(voiceLocale, {
      onStart: () => {
        if (session !== sessionRef.current || cancelledRef.current) return;
        setState("listening");
        setStatusMessage("Listening…");
      },
      onInterim: (text) => {
        if (session !== sessionRef.current || cancelledRef.current) return;
        transcriptRef.current = text;
        onLiveRef.current?.(text);
      },
      onFinal: (text) => {
        if (session !== sessionRef.current || cancelledRef.current) return;
        transcriptRef.current = text;
        onLiveRef.current?.(text);
      },
      onEnd: () => {
        if (session !== sessionRef.current || cancelledRef.current) {
          recognizerRef.current = null;
          return;
        }
        recognizerRef.current = null;
        const finalText = transcriptRef.current.trim();
        if (finalText) {
          onLiveRef.current?.(finalText);
          setState("idle");
          setStatusMessage("Review the text, then tap Send");
        } else {
          resetIdle();
        }
      },
      onError: (message) => {
        if (session !== sessionRef.current || cancelledRef.current) {
          recognizerRef.current = null;
          return;
        }
        recognizerRef.current = null;
        setError(message);
        setState("error");
        setStatusMessage(message);
      },
    });

    if (!recognizer) {
      const msg =
        "Voice input isn't supported in this browser. You can type your message instead.";
      setError(msg);
      setState("error");
      setStatusMessage(msg);
      return;
    }

    recognizerRef.current = recognizer;
    recognizer.start();
  }, [resetIdle, stopPlayback, supported.recognition, voiceLocale]);

  const toggleListening = useCallback(() => {
    if (stateRef.current === "listening") {
      stopListening();
      return;
    }
    if (stateRef.current === "speaking") {
      stopPlayback();
      resetIdle();
    }
    startListening();
  }, [resetIdle, startListening, stopListening, stopPlayback]);

  const speak = useCallback(
    (text: string) => {
      if (!supported.synthesis) {
        setError("Voice playback isn't supported in this browser.");
        return;
      }
      if (stateRef.current === "listening") {
        recognizerRef.current?.abort();
        recognizerRef.current = null;
      }
      speakStopRef.current?.();
      stopSpeaking();

      const handle = speakText(text, voiceLocale, {
        onStart: () => {
          setState("speaking");
          setStatusMessage("Playing response…");
        },
        onEnd: () => {
          speakStopRef.current = null;
          resetIdle();
        },
        onError: (message) => {
          speakStopRef.current = null;
          setError(message);
          setState("error");
          setStatusMessage(message);
        },
      });
      speakStopRef.current = handle.stop;
    },
    [resetIdle, supported.synthesis, voiceLocale],
  );

  useEffect(() => {
    return () => {
      recognizerRef.current?.abort();
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (stateRef.current === "listening") {
      cancelledRef.current = true;
      sessionRef.current += 1;
      recognizerRef.current?.abort();
      recognizerRef.current = null;
      transcriptRef.current = "";
      resetIdle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceLocale]);

  return {
    state,
    statusMessage,
    error,
    supported,
    voiceLocale,
    startListening,
    stopListening,
    cancelListening,
    toggleListening,
    speak,
    stopPlayback: () => {
      stopPlayback();
      if (stateRef.current === "speaking") resetIdle();
    },
    markProcessing: () => {
      setState("processing");
      setStatusMessage("Thinking…");
    },
    markIdle: resetIdle,
  };
}
