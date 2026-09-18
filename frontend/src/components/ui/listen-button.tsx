"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Square } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ListenButtonProps {
  text: string;
  className?: string;
}

export function ListenButton({ text, className = "" }: ListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const { language, t } = useTranslation();

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  const getLanguageCode = () => {
    switch (language) {
      case "hi": return "hi-IN";
      case "gu": return "gu-IN";
      default: return "en-IN";
    }
  };

  const handleSpeak = () => {
    if (!supported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode();

    // Try to find a matching voice if possible
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(language) || v.lang.startsWith(getLanguageCode()));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stop playing if unmounted
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported) return null;

  return (
    <Button 
      variant={isPlaying ? "default" : "outline"}
      size="sm" 
      onClick={handleSpeak}
      className={`min-h-[44px] min-w-[44px] flex items-center gap-2 ${className}`}
      aria-label={isPlaying ? t("actions.stop") : t("actions.listen")}
    >
      {isPlaying ? (
        <>
          <Square className="h-4 w-4 fill-current" />
          <span className="sr-only">{t("actions.stop")}</span>
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4" />
          <span className="sr-only">{t("actions.listen")}</span>
        </>
      )}
    </Button>
  );
}
