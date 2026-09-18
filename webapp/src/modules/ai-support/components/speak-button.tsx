import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  speaking?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  label?: boolean;
};

/** Play / stop spoken playback for an assistant message. */
export function SpeakButton({
  speaking,
  disabled,
  onClick,
  className,
  label,
}: Props) {
  return (
    <Button
      type="button"
      size={label ? "sm" : "icon"}
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      aria-label={speaking ? "Stop speaking" : "Play response aloud"}
      aria-pressed={Boolean(speaking)}
      className={cn(
        "rounded-full text-muted-foreground hover:text-teal-700",
        label ? "h-8 gap-1 px-2 text-xs" : "h-7 w-7",
        speaking && "bg-teal-50 text-teal-700",
        className,
      )}
    >
      {speaking ? (
        <VolumeX className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Volume2 className="h-3.5 w-3.5" aria-hidden />
      )}
      {label ? (speaking ? "Stop" : "Play voice") : null}
    </Button>
  );
}
