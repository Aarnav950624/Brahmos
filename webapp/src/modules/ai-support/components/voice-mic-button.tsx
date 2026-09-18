import { Loader2, Mic, MicOff, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  voiceStatusLabel,
  type VoiceUxState,
} from "@/modules/ai-support/voice/types";

type Props = {
  state: VoiceUxState;
  statusMessage?: string;
  supported: boolean;
  onToggle: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
};

export function VoiceMicButton({
  state,
  statusMessage,
  supported,
  onToggle,
  onCancel,
  disabled,
  className,
}: Props) {
  const listening = state === "listening";
  const processing = state === "processing";
  const speaking = state === "speaking";
  const errored = state === "error";
  const label = statusMessage || voiceStatusLabel(state);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        size="icon"
        variant={listening ? "destructive" : "secondary"}
        disabled={disabled || processing || !supported}
        onClick={onToggle}
        aria-label={
          listening
            ? "Stop dictation"
            : supported
              ? "Tap to dictate"
              : "Voice input not supported"
        }
        aria-pressed={listening}
        className={cn(
          "relative h-11 w-11 shrink-0 rounded-full",
          listening && "animate-pulse shadow-md shadow-red-500/30",
          speaking && "ring-2 ring-teal-500/40",
        )}
      >
        {processing ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : listening ? (
          <MicOff className="h-5 w-5" aria-hidden />
        ) : (
          <Mic className="h-5 w-5" aria-hidden />
        )}
        {listening ? (
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background"
            aria-hidden
          />
        ) : null}
      </Button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-xs font-medium",
            listening && "text-red-600",
            processing && "text-amber-700",
            speaking && "text-teal-700",
            errored && "text-destructive",
            state === "idle" && "text-muted-foreground",
          )}
          aria-live="polite"
        >
          {!supported
            ? "Voice input isn’t supported — type instead"
            : label}
        </p>
      </div>

      {listening ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onToggle}
          aria-label="Stop dictation"
          className="h-8 shrink-0 px-2 text-xs"
        >
          <Square className="mr-1 h-3 w-3" aria-hidden />
          Done
        </Button>
      ) : (speaking || processing) && onCancel ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCancel}
          aria-label="Cancel voice"
          className="h-8 shrink-0 px-2 text-xs"
        >
          <Square className="mr-1 h-3 w-3" aria-hidden />
          Stop
        </Button>
      ) : null}
    </div>
  );
}
