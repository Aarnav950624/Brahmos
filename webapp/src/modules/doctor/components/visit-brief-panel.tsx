import { useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { generateVisitBrief } from "@/modules/doctor/visit-brief/generate";
import {
  FALLBACK_BANNER,
  VERIFICATION_LABEL,
  type VisitBrief,
} from "@/modules/doctor/visit-brief/schema";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card/60 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {VERIFICATION_LABEL}
        </span>
      </div>
      {children}
    </section>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function TrendBadge({
  trend,
}: {
  trend: "up" | "down" | "flat" | "insufficient";
}) {
  const label =
    trend === "up"
      ? "Rising"
      : trend === "down"
        ? "Falling"
        : trend === "flat"
          ? "Stable"
          : "Limited data";
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px]",
        trend === "up" && "border-amber-300 text-amber-800",
        trend === "down" && "border-sky-300 text-sky-800",
        trend === "flat" && "border-emerald-300 text-emerald-800",
      )}
    >
      {label}
    </Badge>
  );
}

function CareStatusIcon({
  status,
}: {
  status: "done" | "partial" | "missing" | "unknown";
}) {
  if (status === "done") return <span className="text-emerald-700">✓</span>;
  if (status === "partial") return <span className="text-amber-700">⚠</span>;
  if (status === "missing") return <span className="text-rose-700">○</span>;
  return <span className="text-muted-foreground">·</span>;
}

export function VisitBriefPanel({ patientId }: { patientId: string }) {
  const [brief, setBrief] = useState<VisitBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateVisitBrief(patientId);
      setBrief(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate visit brief. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-teal-900/10 shadow-sm">
      <CardHeader className="border-b border-border/70 bg-gradient-to-r from-[#0F4C5C] to-[#0F766E] text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ClipboardList className="h-4 w-4" />
              AI Visit Brief
            </CardTitle>
            <p className="mt-1 text-xs text-white/75">
              Longitudinal summary since the previous consultation — assistive
              only, not a diagnosis.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white text-teal-900 hover:bg-white/90"
              disabled={loading}
              onClick={() => void run()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Analyzing recent patient activity...
                </>
              ) : brief ? (
                <>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Generate AI Visit Brief
                </>
              )}
            </Button>
            {brief ? (
              <Button
                size="sm"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10"
                disabled={loading}
                onClick={() => void run()}
              >
                Refresh Data
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {!brief && !loading ? (
          <p className="text-sm text-muted-foreground">
            Generate a concise clinician briefing from care-plan progress,
            medication adherence, check-ins, vitals, escalations, and recent
            events. No treatment recommendations are produced.
          </p>
        ) : null}

        {loading && !brief ? (
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-teal-700" />
            Analyzing recent patient activity...
          </div>
        ) : null}

        {brief ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                Since last consultation: {brief.period_label}
              </Badge>
              <Badge variant={brief.source === "ai" ? "default" : "outline"}>
                {brief.source === "ai" ? "AI-assisted" : "Data-based"}
              </Badge>
              <span className="text-[11px] text-muted-foreground">
                Generated {new Date(brief.generated_at).toLocaleString()}
              </span>
            </div>

            {brief.source === "local_fallback" ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {FALLBACK_BANNER}
              </p>
            ) : null}

            <Section title="Patient overview">
              <div className="grid gap-2 sm:grid-cols-3">
                <Metric
                  label="Care-plan progress"
                  value={
                    brief.care_plan_progress_percent != null
                      ? `${brief.care_plan_progress_percent}%`
                      : "—"
                  }
                />
                <Metric
                  label="Medication adherence"
                  value={
                    brief.medication.adherence_percent != null
                      ? `${brief.medication.adherence_percent}%`
                      : "—"
                  }
                  hint={`Missed doses: ${brief.medication.missed_doses}`}
                />
                <Metric
                  label="Check-ins"
                  value={`${brief.check_ins.completed} / ${brief.check_ins.expected}`}
                />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                {brief.overview}
              </p>
            </Section>

            <div className="grid gap-3 lg:grid-cols-2">
              <Section title="Medication">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {brief.medication.notes.length ? (
                    brief.medication.notes.map((n) => <li key={n}>• {n}</li>)
                  ) : (
                    <li>• No medication notes for this window</li>
                  )}
                </ul>
              </Section>

              <Section title="Check-ins">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {brief.check_ins.notes.length ? (
                    brief.check_ins.notes.map((n) => <li key={n}>• {n}</li>)
                  ) : (
                    <li>• No additional check-in notes</li>
                  )}
                </ul>
              </Section>
            </div>

            <Section title="Patient-reported concerns">
              {brief.concerns.length ? (
                <ul className="space-y-1 text-sm">
                  {brief.concerns.map((c) => (
                    <li key={c.topic}>
                      • {c.topic} mentioned {c.mentions} time
                      {c.mentions === 1 ? "" : "s"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No repeated concerns identified in this period.
                </p>
              )}
            </Section>

            <Section title="Vitals">
              {brief.vitals.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {brief.vitals.map((v) => (
                    <div
                      key={v.label}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
                    >
                      <div>
                        <p className="text-xs text-muted-foreground">{v.label}</p>
                        <p className="font-semibold tabular-nums">{v.latest}</p>
                        {v.recorded_at ? (
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(v.recorded_at).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                      <TrendBadge trend={v.trend} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No vitals available for trend review.
                </p>
              )}
            </Section>

            <Section title="Care plan">
              <ul className="space-y-1.5 text-sm">
                {brief.care_plan_items.map((item) => (
                  <li key={item.title} className="flex items-start gap-2">
                    <CareStatusIcon status={item.status} />
                    <span>
                      {item.title}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({item.status})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Recent events">
              {brief.recent_events.length ? (
                <ul className="space-y-1 text-sm">
                  {brief.recent_events.map((e) => (
                    <li key={e}>• {e}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No notable events in this window.
                </p>
              )}
            </Section>

            <Section title="Discussion points">
              <ul className="space-y-1 text-sm">
                {brief.discussion_points.map((d) => (
                  <li key={d}>• {d}</li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Topics for clinician review only — not treatment advice.
              </p>
            </Section>

            {brief.missing_information.length ? (
              <Section title="Missing information">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {brief.missing_information.map((m) => (
                    <li key={m}>• {m}</li>
                  ))}
                </ul>
              </Section>
            ) : null}

            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {brief.disclaimer} This brief never diagnoses, never recommends
              treatment changes, and never replaces clinical judgment.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
