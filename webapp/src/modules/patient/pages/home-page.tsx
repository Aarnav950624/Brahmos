import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

import { AlertBanner } from "@/components/health-engine";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/feedback/loading-screen";
import { ErrorState } from "@/components/feedback/error-state";
import { buttonVariants } from "@/components/ui/button";
import { useHealthIntelligence } from "@/hooks/health-engine";
import { getStore } from "@/data/store";
import { cn } from "@/lib/utils";
import {
  formatAppointmentWhen,
  formatDaysAway,
} from "@/lib/relative-time";
import { PendingInvestigationsPanel } from "@/modules/investigations/components/pending-investigations";
import { AiCompanionStrip } from "@/modules/patient/components/ai-companion-strip";
import { PassportPreview } from "@/modules/patient/components/passport-preview";
import { ProgressBar } from "@/modules/patient/components/progress-ring";
import { QuickActions } from "@/modules/patient/components/quick-actions";
import { TodaysCareList } from "@/modules/patient/components/todays-care-list";
import {
  usePatientMutations,
  usePatientPassport,
  usePatientRecovery,
  useTodayDashboard,
} from "@/modules/patient/hooks";
import { usePatientInvestigations } from "@/modules/investigations/hooks";

function greetingPrefix() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}



export function PatientHomePage() {
  const dash = useTodayDashboard();
  const passport = usePatientPassport();
  const recovery = usePatientRecovery();
  const { setTaskStatus } = usePatientMutations();
  const intel = useHealthIntelligence();
  const patientId = dash.data?.patient_id;
  const investigations = usePatientInvestigations(patientId || "");

  if (dash.isLoading)
    return <LoadingScreen label="Loading your recovery journey…" fullScreen={false} />;
  if (dash.isError || !dash.data)
    return (
      <ErrorState
        description="Could not load today's plan."
        onRetry={() => dash.refetch()}
      />
    );

  const data = dash.data;
  const attentionCount = (investigations.data || []).filter(
    (i) => i.status === "overdue" || i.status === "review_required",
  ).length;

  const checkins = getStore().checkins.filter(
    (c) => c.patient_id === data.patient_id,
  );
  const fourteenDaysAgo = Date.now() - 14 * 86_400_000;
  const recentCheckins = checkins.filter(
    (c) => new Date(c.recorded_at).getTime() >= fourteenDaysAgo,
  ).length;

  const headerAttention = attentionCount;
  const adherence = recovery.data?.factors.medicine_adherence ?? null;
  const apptDays = data.days_until_appointment;
  const apptRelative = formatDaysAway(apptDays);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 pb-8">
      <header>
        <section className="overflow-hidden rounded-[1.75rem] border border-primary/15 bg-gradient-to-r from-primary/10 via-card to-secondary/10 p-5 shadow-soft sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Today&apos;s Recovery Journey
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-[2rem]">
            {greetingPrefix()}, {data.greeting_name}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Morning → afternoon → evening → night tasks from your
            doctor-approved AI Care Companion plan. Complete them to keep
            recovery on track.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Today&apos;s Recovery Progress</span>
              <span className="tabular-nums font-semibold text-primary">
                {data.progress_percent}%
              </span>
            </div>
            <ProgressBar value={data.progress_percent} className="h-2" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="h-7 font-medium">
              Recovery Score{" "}
              {data.recovery_score != null ? data.recovery_score : "NA"}
            </Badge>
            {data.risk_level ? (
              <Badge variant="secondary" className="h-7 capitalize">
                {data.risk_level.replace("_", " ")} risk
              </Badge>
            ) : (
              <Badge variant="outline" className="h-7">
                Risk NA
              </Badge>
            )}
            {adherence != null ? (
              <Badge variant="outline" className="h-7 font-medium">
                Medicines {adherence}%
              </Badge>
            ) : null}
            <Link
              to="/patient/recovery-score"
              className="text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              View insights
            </Link>
          </div>
        </section>

        {headerAttention > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
              {headerAttention === 1
                ? "1 care item needs your attention"
                : `${headerAttention} care items need your attention`}
            </p>
            <a
              href="#needs-attention"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8")}
            >
              Review
            </a>
          </div>
        ) : null}

        {intel ? <AlertBanner alert={intel.alerts} /> : null}
      </header>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <TodaysCareList
            tasks={data.tasks}
            busy={setTaskStatus.isPending}
            onComplete={(taskId) =>
              setTaskStatus.mutate({ taskId, status: "completed" })
            }
            onSkip={(taskId) =>
              setTaskStatus.mutate({ taskId, status: "skipped" })
            }
          />
        </div>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Recovery Snapshot
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Metric
                label="Recovery Score"
                value={
                  data.recovery_score != null ? `${data.recovery_score}` : "NA"
                }
                hint={data.recovery_score != null ? "/ 100" : undefined}
              />
              <Metric
                label="Medication adherence"
                value={adherence != null ? `${adherence}%` : "NA"}
              />
              <Metric label="Check-ins" value={`${recentCheckins} / 14`} />
              <Metric
                label="Care-plan completion"
                value={`${data.progress_percent}%`}
              />
            </div>
            {intel?.trends?.narrative_summary ? (
              <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                {intel.trends.narrative_summary}
              </p>
            ) : null}
            <Link
              to="/patient/recovery-score"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "mt-2 px-0",
              )}
            >
              View recovery details
            </Link>
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Next Appointment
            </h2>
            {data.next_appointment ? (
              <div className="mt-2">
                <p className="text-sm font-semibold">
                  {formatAppointmentWhen(data.next_appointment.scheduled_at)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.next_appointment.doctor_name}
                  {data.next_appointment.location
                    ? ` · ${data.next_appointment.location}`
                    : ""}
                </p>
                <p
                  className={cn(
                    "mt-2 text-xs font-medium",
                    apptDays != null && apptDays < 0
                      ? "text-destructive"
                      : "text-primary",
                  )}
                >
                  {apptRelative}
                </p>
                <Link
                  to="/patient/appointments"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-3",
                  )}
                >
                  View appointment
                </Link>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No upcoming appointments.
              </p>
            )}
          </section>
        </div>
      </div>

      <div id="needs-attention">
        <PendingInvestigationsPanel
          patientId={data.patient_id}
          mode="patient"
          compact
        />
      </div>

      <AiCompanionStrip />
      <QuickActions />
      {passport.data ? <PassportPreview passport={passport.data} /> : null}
    </div>
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
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">
        {value}
        {hint ? (
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </p>
    </div>
  );
}
