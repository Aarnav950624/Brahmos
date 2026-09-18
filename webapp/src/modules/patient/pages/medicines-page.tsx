import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { ErrorState } from "@/components/feedback/error-state";
import { LoadingScreen } from "@/components/feedback/loading-screen";
import { Button } from "@/components/ui/button";
import { MedicineCard } from "@/modules/patient/components/medicine-card";
import { MedicineScanner } from "@/modules/patient/medicine-scan";
import {
  usePatientMedicines,
  usePatientMutations,
  useTodayDashboard,
} from "@/modules/patient/hooks";
import { MedicinesEditor } from "@/modules/medicines/medicines-editor";
import { listMedicinesForPatient } from "@/modules/medicines/repository";
import { subscribeStore, type MedicineRow } from "@/data/store";
import { cn } from "@/lib/utils";

export function MedicinesPage() {
  const meds = usePatientMedicines();
  const dash = useTodayDashboard();
  const { markMedicine, reportMedicineUnavailable } = usePatientMutations();
  const [searchParams, setSearchParams] = useSearchParams();
  const [scannerOpen, setScannerOpen] = useState(
    () => searchParams.get("scan") === "1",
  );
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [medicineRows, setMedicineRows] = useState<MedicineRow[]>([]);
  const highlightTimer = useRef<number | null>(null);

  const patientId = dash.data?.patient_id;

  useEffect(() => {
    if (!patientId) {
      setMedicineRows([]);
      return;
    }
    const refresh = () => setMedicineRows(listMedicinesForPatient(patientId));
    refresh();
    return subscribeStore(refresh);
  }, [patientId]);

  useEffect(() => {
    if (searchParams.get("scan") !== "1") return;
    setScannerOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("scan");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    return () => {
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    };
  }, []);

  if (meds.isLoading || dash.isLoading)
    return <LoadingScreen label="Loading medicines…" fullScreen={false} />;
  if (meds.isError || !meds.data)
    return (
      <ErrorState
        description="Could not load medicine reminders."
        onRetry={() => meds.refetch()}
      />
    );

  const scoreUnits = meds.data.reduce((sum, m) => {
    const slots = m.slots.length ? m.slots : [{ status: m.today_status }];
    return (
      sum +
      slots.reduce((inner, s) => {
        if (s.status === "completed") return inner + 1;
        if (s.status === "late") return inner + 0.7;
        return inner;
      }, 0)
    );
  }, 0);
  const slotCount = meds.data.reduce(
    (n, m) => n + (m.slots.length || m.time_slots.length || 1),
    0,
  );
  const adherence = slotCount ? Math.round((scoreUnits / slotCount) * 100) : 0;

  const viewMedication = (medicineId: string) => {
    setHighlightId(medicineId);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`medicine-card-${medicineId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setHighlightId(null), 3200);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Medicine Reminder</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Today&apos;s adherence:{" "}
            <span className="font-medium text-primary">{adherence}%</span>
            . Log Morning / Lunch / Dinner / Night separately when a medicine
            is due more than once.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={() => setScannerOpen(true)}
        >
          <Camera className="h-4 w-4" aria-hidden />
          Scan Medicine
        </Button>
      </div>

      {patientId ? (
        <MedicinesEditor patientId={patientId} actor="patient" />
      ) : null}

      {meds.data.length ? (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Medicine support</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Need help getting a prescribed pack? We can point you to a nearby
            pharmacy or government facility, or notify your health worker.
            HealNexus will not suggest a replacement medicine.
          </p>
          <div className="mt-3 space-y-2">
            {meds.data.map((m) => (
              <div
                key={`support-${m.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 px-3 py-2"
              >
                <p className="text-sm">
                  <span className="font-medium">{m.name}</span>
                  {m.dose ? (
                    <span className="text-muted-foreground"> · {m.dose}</span>
                  ) : null}
                  {m.time_slots.length ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {m.time_slots.join(", ")}
                    </span>
                  ) : null}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={reportMedicineUnavailable.isPending}
                  onClick={() => reportMedicineUnavailable.mutate(m.id)}
                >
                  I can&apos;t find my medicine
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/maps"
              className="text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              Nearby pharmacy
            </Link>
            <Link
              to="/maps"
              className="text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              Government health facility
            </Link>
          </div>
        </section>
      ) : null}

      <div className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Today&apos;s doses</h2>
        {meds.data.map((medicine) => (
          <div
            key={medicine.id}
            id={`medicine-card-${medicine.id}`}
            className={cn(
              "rounded-2xl transition ring-offset-2 ring-offset-background",
              highlightId === medicine.id && "ring-2 ring-primary",
            )}
          >
            <MedicineCard
              medicine={medicine}
              busy={markMedicine.isPending}
              onTaken={(slot) =>
                markMedicine.mutate({
                  medicineId: medicine.id,
                  status: "taken",
                  slot,
                })
              }
              onLate={(slot) =>
                markMedicine.mutate({
                  medicineId: medicine.id,
                  status: "late",
                  slot,
                })
              }
              onSkipped={(slot) =>
                markMedicine.mutate({
                  medicineId: medicine.id,
                  status: "skipped",
                  slot,
                })
              }
            />
          </div>
        ))}
      </div>

      <MedicineScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        medicines={medicineRows}
        onViewMedication={viewMedication}
      />
    </div>
  );
}
