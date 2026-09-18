import { Mic } from "lucide-react";
import { Link } from "react-router-dom";

import { Button, buttonVariants } from "@/components/ui/button";
import { openAiCareChat } from "@/lib/ai-chat-bridge";
import { cn } from "@/lib/utils";

const PROMPTS = [
  "Explain my medicines",
  "What do I need to do today?",
  "Help me understand my care plan",
];

export function AiCompanionStrip() {
  return (
    <section className="rounded-xl border border-primary/20 bg-primary/[0.04] p-4 shadow-soft">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-primary">
        Your AI Care Companion
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Need help with your care plan?
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => openAiCareChat({ startVoice: true })}
        >
          <Mic className="h-4 w-4" aria-hidden />
          Talk to HealNexus
        </Button>
        <Link
          to="/patient/ai-assistant"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Open Assistant
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
            onClick={() => openAiCareChat({ prompt })}
          >
            {prompt}
          </button>
        ))}
      </div>
    </section>
  );
}
