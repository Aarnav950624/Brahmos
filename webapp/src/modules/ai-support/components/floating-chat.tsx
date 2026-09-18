import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, MessageCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { subscribeStore } from "@/data/store";
import type { AppLocale } from "@/i18n/dictionaries";
import { useAppLocale } from "@/i18n/locale-context";
import { OPEN_AI_CHAT_EVENT, type OpenAiChatDetail } from "@/lib/ai-chat-bridge";
import { cn } from "@/lib/utils";
import { SpeakButton } from "@/modules/ai-support/components/speak-button";
import { VoiceMicButton } from "@/modules/ai-support/components/voice-mic-button";
import {
  askGroundedAssistant,
  formatAssistantBubble,
  greetingFromLive,
} from "@/modules/ai-support/chat-engine";
import { runAiCheckup } from "@/modules/ai-support/checkup-engine";
import { useVoiceCompanion } from "@/modules/ai-support/voice/use-voice-companion";
import { toVoiceLocale } from "@/modules/ai-support/voice/types";

const VOICE_LOCALES: { id: AppLocale; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "hi", label: "HI" },
  { id: "gu", label: "GU" },
];

export function FloatingAiChat() {
  const { user } = useAuth();
  const { locale, setLocale } = useAppLocale();
  const voiceLocale = toVoiceLocale(locale);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => subscribeStore(() => setTick((t) => t + 1)), []);

  const checkup = useMemo(
    () => (user?.role === "patient" && user.id ? runAiCheckup(user.id) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, user?.role, tick],
  );

  useEffect(() => {
    if (!open || !user?.id || user.role !== "patient") return;
    if (messages.length) return;
    setMessages([{ role: "assistant", content: greetingFromLive(user.id) }]);
  }, [open, user?.id, user?.role, messages.length]);

  const markProcessingRef = useRef<() => void>(() => undefined);
  const markIdleRef = useRef<() => void>(() => undefined);

  const sendText = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busyRef.current || !user?.id) return;
      setInput("");
      const prior = messagesRef.current;
      setMessages((m) => [...m, { role: "user", content: text }]);
      setBusy(true);
      markProcessingRef.current();
      try {
        const result = await askGroundedAssistant(
          [
            ...prior.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
          user.id,
          { locale: voiceLocale },
        );
        const content = formatAssistantBubble(result);
        setMessages((m) => [...m, { role: "assistant", content }]);
      } finally {
        setBusy(false);
        markIdleRef.current();
      }
    },
    [user?.id, voiceLocale],
  );

  const voice = useVoiceCompanion({
    locale: voiceLocale,
    onLiveTranscript: (text) => setInput(text),
  });

  markProcessingRef.current = voice.markProcessing;
  markIdleRef.current = voice.markIdle;

  useEffect(() => {
    if (voice.state !== "speaking") setSpeakingIndex(null);
  }, [voice.state]);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<OpenAiChatDetail>).detail || {};
      setOpen(true);
      if (detail.prompt) {
        queueMicrotask(() => {
          void sendText(detail.prompt!);
        });
      }
      if (detail.startVoice) {
        queueMicrotask(() => {
          voice.toggleListening();
        });
      }
    };
    window.addEventListener(OPEN_AI_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_AI_CHAT_EVENT, onOpen);
  }, [sendText, voice.toggleListening]);

  if (!user || user.role !== "patient") return null;

  const onSpeakMessage = (index: number, content: string) => {
    if (speakingIndex === index && voice.state === "speaking") {
      voice.stopPlayback();
      setSpeakingIndex(null);
      return;
    }
    setSpeakingIndex(index);
    voice.speak(content);
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="pointer-events-auto flex h-[min(540px,72dvh)] w-[min(400px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-[#0F4C5C] to-[#0F766E] px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Bot className="h-4 w-4 shrink-0" />
                AI Care Companion
              </p>
              <p className="truncate text-[11px] text-white/70">
                {checkup
                  ? `Live risk ${checkup.overall_risk} · Recovery ${checkup.recovery_score}`
                  : "How can I help you today?"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="flex rounded-full bg-white/15 p-0.5"
                role="group"
                aria-label="Voice language"
              >
                {VOICE_LOCALES.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLocale(l.id)}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold transition",
                      voiceLocale === l.id
                        ? "bg-white text-teal-900"
                        : "text-white/80 hover:bg-white/10",
                    )}
                    aria-pressed={voiceLocale === l.id}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="rounded-full p-1 hover:bg-white/10"
                onClick={() => {
                  voice.cancelListening();
                  voice.stopPlayback();
                  setOpen(false);
                }}
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={cn(
                  "max-w-[92%] whitespace-pre-wrap rounded-2xl px-3 py-2",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                {m.content}
                {m.role === "assistant" ? (
                  <div className="mt-1 flex justify-end">
                    <SpeakButton
                      speaking={
                        speakingIndex === i && voice.state === "speaking"
                      }
                      disabled={!voice.supported.synthesis || busy}
                      onClick={() => onSpeakMessage(i, m.content)}
                      label
                    />
                  </div>
                ) : null}
              </div>
            ))}
            {busy ? (
              <p className="text-xs text-muted-foreground" aria-live="polite">
                Thinking…
              </p>
            ) : null}
          </div>

          <div className="space-y-2 border-t border-border p-3">
            <div className="flex flex-wrap gap-1.5">
              <Link
                to="/patient/ai-checkup"
                className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium"
                onClick={() => setOpen(false)}
              >
                AI Checkup
              </Link>
              <Link
                to="/patient/ai-assistant"
                className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium"
                onClick={() => setOpen(false)}
              >
                Full chat
              </Link>
            </div>

            <VoiceMicButton
              state={busy ? "processing" : voice.state}
              statusMessage={
                busy ? "Thinking…" : voice.statusMessage || undefined
              }
              supported={voice.supported.recognition}
              onToggle={voice.toggleListening}
              onCancel={() => {
                voice.cancelListening();
                voice.stopPlayback();
              }}
              disabled={busy}
            />

            <Textarea
              rows={2}
              placeholder="Dictate with the mic, review the text, then Send…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void sendText(input);
                }
              }}
              aria-label="Message"
            />
            <Button
              size="sm"
              className="w-full"
              disabled={busy || !input.trim()}
              onClick={() => void sendText(input)}
            >
              {busy ? "Thinking…" : "Send"}
            </Button>
            <p className="text-[10px] leading-snug text-muted-foreground">
              Assistive only — never diagnoses or changes medicines. Call 108
              for emergencies.
            </p>
          </div>
        </div>
      ) : null}

      <Button
        size="icon"
        className="pointer-events-auto h-14 w-14 rounded-full bg-[#0F766E] shadow-lg hover:bg-[#0F5F5A]"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI Care Companion"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
