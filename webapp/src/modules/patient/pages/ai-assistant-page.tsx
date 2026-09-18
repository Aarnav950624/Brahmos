import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, FlaskConical } from "lucide-react";

import { AiDisclaimer } from "@/components/ai/ai-disclaimer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { subscribeStore } from "@/data/store";
import type { AppLocale } from "@/i18n/dictionaries";
import { useAppLocale } from "@/i18n/locale-context";
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

interface ChatItem {
  role: "user" | "assistant";
  content: string;
}

const PROMPTS = [
  { en: "When do I take my medicines?", hi: "मेरी दवा कब लेनी है?", gu: "મારી દવા ક્યારે લેવાની છે?" },
  { en: "What was my last BP?", hi: "मेरा BP कितना आया?", gu: "મારું BP કેટલું આવ્યું છે?" },
  {
    en: "I have hospital tomorrow — what should I bring?",
    hi: "कल अस्पताल जाना है, क्या ले जाऊँ?",
    gu: "મારે કાલે દવાખાને જવું છે, શું લઈ જવું?",
  },
  { en: "I can't find my medicine", hi: "मेरी दवा नहीं मिल रही", gu: "મારી દવા મળતી નથી" },
];

const VOICE_LOCALES: { id: AppLocale; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "hi", label: "HI" },
  { id: "gu", label: "GU" },
];

export function AiAssistantPage() {
  const { user } = useAuth();
  const { locale, setLocale } = useAppLocale();
  const voiceLocale = toVoiceLocale(locale);
  const [tick, setTick] = useState(0);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatItem[]>([]);

  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const markProcessingRef = useRef<() => void>(() => undefined);
  const markIdleRef = useRef<() => void>(() => undefined);

  useEffect(() => subscribeStore(() => setTick((t) => t + 1)), []);

  const checkup = useMemo(
    () => (user?.id ? runAiCheckup(user.id) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, tick],
  );

  useEffect(() => {
    if (!user?.id) return;
    setMessages([
      {
        role: "assistant",
        content: greetingFromLive(user.id),
      },
    ]);
  }, [user?.id]);

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
    <div className="mx-auto flex max-w-2xl flex-col gap-5 pb-10">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          <Bot className="h-4 w-4" />
          Voice Health Guide
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold">
          Talk to HealNexus
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Speak Gujarati, Hindi, or English. Answers use your saved care plan,
          medicines, check-ins, and approved education — never a diagnosis or
          new prescription.
        </p>
        {checkup ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Live: risk {checkup.overall_risk} · recovery {checkup.recovery_score}{" "}
            · {checkup.missing_investigations.length} missing lab suggestion(s)
          </p>
        ) : null}
      </div>
      <AiDisclaimer />

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1"
          role="tablist"
          aria-label="Language"
        >
          {VOICE_LOCALES.map((l) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={voiceLocale === l.id}
              onClick={() => setLocale(l.id)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-bold transition",
                voiceLocale === l.id
                  ? "bg-white text-teal-800 shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <Link
          to="/patient/ai-checkup"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <FlaskConical className="mr-1 h-3.5 w-3.5" />
          Open AI Checkup
        </Link>
        {PROMPTS.map((p) => {
          const label =
            voiceLocale === "gu" ? p.gu : voiceLocale === "hi" ? p.hi : p.en;
          return (
            <Button
              key={p.en}
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => void sendText(label)}
            >
              {label}
            </Button>
          );
        })}
      </div>

      <Card className="min-h-[420px]">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
            {messages.map((m, i) => (
              <motion.div
                key={`${m.role}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
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
              </motion.div>
            ))}
          </div>

          <VoiceMicButton
            state={busy ? "processing" : voice.state}
            statusMessage={busy ? "Thinking…" : voice.statusMessage || undefined}
            supported={voice.supported.recognition}
            onToggle={voice.toggleListening}
            onCancel={() => {
              voice.cancelListening();
              voice.stopPlayback();
            }}
            disabled={busy}
          />

          <Textarea
            rows={3}
            placeholder="Talk to HealNexus — tap the mic, then Send. Nothing is sent until you tap Send."
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
            onClick={() => void sendText(input)}
            disabled={busy || !input.trim()}
          >
            {busy ? "Thinking…" : "Send"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
