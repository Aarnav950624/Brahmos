import { Pill } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MedicineSlotView, MedicineView } from "@/modules/patient/types";

function slotBadge(status: MedicineSlotView["status"]) {
  if (status === "completed") return "Taken";
  if (status === "late") return "Late taken";
  if (status === "skipped") return "Skipped";
  return "Due";
}

export function MedicineCard({
  medicine,
  onTaken,
  onLate,
  onSkipped,
  busy,
}: {
  medicine: MedicineView;
  onTaken: (slot: string) => void;
  onLate?: (slot: string) => void;
  onSkipped: (slot: string) => void;
  busy?: boolean;
}) {
  const slots = medicine.slots.length
    ? medicine.slots
    : medicine.time_slots.map((slot) => ({
        slot,
        status: medicine.today_status === "none" ? "pending" : medicine.today_status,
      }));
  const doneCount = slots.filter(
    (s) => s.status === "completed" || s.status === "late",
  ).length;
  const statusLabel =
    doneCount === slots.length && slots.length
      ? slots.some((s) => s.status === "late")
        ? "Late taken"
        : "Taken"
      : doneCount
        ? `${doneCount} of ${slots.length} taken`
        : slots.every((s) => s.status === "skipped")
          ? "Skipped"
          : "Due";

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Pill className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-semibold">{medicine.name}</h3>
              <Badge
                variant={
                  doneCount === slots.length && slots.length
                    ? "secondary"
                    : "outline"
                }
              >
                {statusLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {medicine.dose || "Dose as prescribed"} · {medicine.frequency}
            </p>
            {medicine.instructions ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {medicine.instructions}
              </p>
            ) : null}
          </div>
        </div>

        <ul className="space-y-2">
          {slots.map((row) => {
            const pending = row.status === "pending";
            return (
              <li
                key={row.slot}
                className="flex flex-col gap-2 rounded-xl border border-border/80 bg-muted/20 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{row.slot}</p>
                  <p className="text-xs text-muted-foreground">
                    {pending
                      ? "Log this dose when you take it"
                      : slotBadge(row.status)}
                  </p>
                </div>
                {pending ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => onTaken(row.slot)}
                    >
                      Taken
                    </Button>
                    {onLate ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => onLate(row.slot)}
                      >
                        Late taken
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => onSkipped(row.slot)}
                    >
                      Skipped
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary">{slotBadge(row.status)}</Badge>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
