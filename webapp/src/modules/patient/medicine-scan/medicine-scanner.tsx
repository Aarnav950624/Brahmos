import { useEffect, useId, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  ScanLine,
  ShieldAlert,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MedicineRow } from "@/data/store";
import { cn } from "@/lib/utils";

import { extractMedicineLabel, MedicineExtractError } from "./extract";
import {
  displayExtractedLabel,
  matchAgainstMedicines,
} from "./match";
import { prepareMedicineImage, revokePreview } from "./prepare-image";
import {
  confidenceBand,
  type ConfidenceBand,
  type MatchCandidate,
  type MatchOutcome,
  type MedicineExtractResult,
} from "./schema";

type Step =
  | "capture"
  | "reading"
  | "found"
  | "match"
  | "multi"
  | "no-match"
  | "verify"
  | "manual";

type Props = {
  open: boolean;
  onClose: () => void;
  medicines: MedicineRow[];
  onViewMedication: (medicineId: string) => void;
};

function bandLabel(band: ConfidenceBand) {
  if (band === "high") return "High";
  if (band === "medium") return "Medium";
  return "Low";
}

function scheduleLabel(med: MatchCandidate) {
  if (med.time_slots?.length) {
    return med.time_slots
      .map((slot) => `${slot} — ${med.dose || "as prescribed"}`)
      .join("\n");
  }
  return med.frequency || "As directed in your care plan";
}

export function MedicineScanner({
  open,
  onClose,
  medicines,
  onViewMedication,
}: Props) {
  const titleId = useId();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("capture");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extract, setExtract] = useState<MedicineExtractResult | null>(null);
  const [match, setMatch] = useState<MatchOutcome | null>(null);
  const [selected, setSelected] = useState<MatchCandidate | null>(null);
  const [manualName, setManualName] = useState("");
  const [cameraDenied, setCameraDenied] = useState(false);

  const reset = () => {
    revokePreview(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setExtract(null);
    setMatch(null);
    setSelected(null);
    setManualName("");
    setStep("capture");
  };

  useEffect(() => {
    if (open) return;
    revokePreview(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setExtract(null);
    setMatch(null);
    setSelected(null);
    setManualName("");
    setStep("capture");
    setCameraDenied(false);
    // Only when dialog closes — intentional one-shot cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const runMatch = (name: string, strength?: string | null) => {
    const outcome = matchAgainstMedicines(name, strength, medicines);
    setMatch(outcome);
    if (outcome.kind === "single") {
      setSelected(outcome.medicine);
      setStep("match");
    } else if (outcome.kind === "multiple") {
      setStep("multi");
    } else {
      setStep("no-match");
    }
  };

  const processFile = async (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a photo of the medicine box or strip.");
      return;
    }
    setError(null);
    setStep("reading");
    try {
      const prepared = await prepareMedicineImage(file);
      revokePreview(previewUrl);
      setPreviewUrl(prepared.previewUrl);

      const result = await extractMedicineLabel(prepared);
      setExtract(result);

      const band = confidenceBand(result.confidence);
      const name = (result.medicineName || "").trim();

      if (!name || band === "low" || result.source === "unavailable") {
        setManualName(name);
        setStep("verify");
        return;
      }

      setStep("found");
    } catch (err) {
      const message =
        err instanceof MedicineExtractError
          ? err.message
          : "Could not read this photo. Enter the name manually.";
      setError(message);
      setStep("verify");
    }
  };

  const onCameraClick = async () => {
    setError(null);
    // Probe permission when possible; always fall back to file input capture
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        stream.getTracks().forEach((t) => t.stop());
        setCameraDenied(false);
      }
    } catch {
      setCameraDenied(true);
      setError(
        "Camera permission was denied. You can still upload a photo from your gallery.",
      );
    }
    cameraInputRef.current?.click();
  };

  const band = extract ? confidenceBand(extract.confidence) : "low";
  const foundLabel = displayExtractedLabel(
    extract?.medicineName,
    extract?.strength,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border-0 shadow-lift sm:rounded-3xl">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
          <div>
            <CardTitle id={titleId} className="font-display text-xl">
              Scan Medicine
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Identification support only — never a prescription.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close medicine scanner"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 pb-6">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              void processFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              void processFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          {step === "capture" ? (
            <CapturePanel
              onCamera={onCameraClick}
              onUpload={() => uploadInputRef.current?.click()}
              onDropFile={(file) => void processFile(file)}
              cameraDenied={cameraDenied}
              error={error}
            />
          ) : null}

          {step === "reading" ? (
            <ReadingPanel previewUrl={previewUrl} />
          ) : null}

          {step === "found" && extract ? (
            <FoundPanel
              label={foundLabel}
              band={band}
              form={extract.form}
              previewUrl={previewUrl}
              onMatch={() =>
                runMatch(extract.medicineName || foundLabel, extract.strength)
              }
              onRetake={reset}
            />
          ) : null}

          {step === "match" && selected ? (
            <MatchPanel
              medicine={selected}
              scannedLabel={foundLabel}
              onView={() => {
                onViewMedication(selected.id);
                onClose();
              }}
              onClose={onClose}
            />
          ) : null}

          {step === "multi" && match?.kind === "multiple" ? (
            <MultiMatchPanel
              scannedLabel={foundLabel}
              medicines={match.medicines}
              onSelect={(m) => {
                setSelected(m);
                setStep("match");
              }}
              onRetake={reset}
            />
          ) : null}

          {step === "no-match" ? (
            <NoMatchPanel
              scannedLabel={foundLabel}
              onRetry={reset}
              onManual={() => {
                setManualName(extract?.medicineName || "");
                setStep("manual");
              }}
            />
          ) : null}

          {step === "verify" || step === "manual" ? (
            <VerifyPanel
              error={error}
              manualName={manualName}
              setManualName={setManualName}
              showManual={step === "manual" || Boolean(error)}
              onRetake={reset}
              onManualEntry={() => setStep("manual")}
              onSubmitManual={() => {
                const name = manualName.trim();
                if (!name) {
                  setError("Enter the medicine name to continue.");
                  return;
                }
                setExtract({
                  medicineName: name,
                  strength: null,
                  form: null,
                  confidence: 1,
                  rawHints: [],
                  source: "manual",
                });
                runMatch(name, null);
              }}
            />
          ) : null}

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Photos are processed temporarily for identification and are not saved
            to your care record. Always verify with your doctor or pharmacist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CapturePanel({
  onCamera,
  onUpload,
  onDropFile,
  cameraDenied,
  error,
}: {
  onCamera: () => void;
  onUpload: () => void;
  onDropFile: (file: File) => void;
  cameraDenied: boolean;
  error: string | null;
}) {
  const [dragging, setDragging] = useState(false);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onDropFile(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dashed border-primary/30",
          "bg-gradient-to-b from-primary/5 to-muted/40",
          dragging && "border-primary bg-primary/10",
        )}
      >
        <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="relative flex h-24 w-36 items-center justify-center rounded-xl border-2 border-primary/40 bg-background/80 shadow-soft">
            <ScanLine className="h-8 w-8 text-primary" aria-hidden />
            <span className="pointer-events-none absolute inset-x-3 top-2 h-0.5 animate-pulse bg-primary/70" />
            <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-primary" />
            <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-primary" />
            <span className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-primary" />
            <span className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-primary" />
          </div>
          <p className="max-w-[16rem] text-sm text-muted-foreground">
            {dragging
              ? "Drop the photo here"
              : "Take a clear photo of the medicine strip or box — or drag a photo here."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button type="button" size="lg" className="w-full" onClick={onCamera}>
          <Camera className="h-4 w-4" />
          Open Camera
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="w-full"
          onClick={onUpload}
        >
          <ImagePlus className="h-4 w-4" />
          Upload Photo
        </Button>
      </div>

      {cameraDenied ? (
        <p className="text-sm text-amber-700 dark:text-amber-400" role="status">
          Camera access denied — use Upload Photo instead.
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        <p className="font-medium text-foreground/80">Tips</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          <li>Keep the medicine name visible</li>
          <li>Avoid glare</li>
          <li>Hold the camera steady</li>
        </ul>
      </div>
    </div>
  );
}

function ReadingPanel({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="space-y-4 text-center">
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Medicine photo being scanned"
            className="aspect-[4/3] w-full object-cover opacity-80"
          />
        ) : (
          <div className="aspect-[4/3] w-full" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/25">
          <Loader2 className="h-8 w-8 animate-spin text-primary-foreground" />
          <div className="h-0.5 w-2/3 overflow-hidden rounded-full bg-primary-foreground/30">
            <div className="h-full w-1/2 animate-pulse bg-primary-foreground" />
          </div>
        </div>
      </div>
      <p className="text-sm font-medium" role="status" aria-live="polite">
        Reading medicine information…
      </p>
    </div>
  );
}

function FoundPanel({
  label,
  band,
  form,
  previewUrl,
  onMatch,
  onRetake,
}: {
  label: string;
  band: ConfidenceBand;
  form?: string | null;
  previewUrl: string | null;
  onMatch: () => void;
  onRetake: () => void;
}) {
  return (
    <div className="space-y-4">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Scanned medicine packaging"
          className="aspect-video w-full rounded-xl object-cover"
        />
      ) : null}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Medicine found
        </p>
        <h3 className="mt-1 font-display text-2xl font-semibold">{label}</h3>
        {form ? (
          <p className="mt-1 text-sm text-muted-foreground">Form: {form}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Confidence:</span>
        <Badge
          variant={band === "high" ? "secondary" : "outline"}
          className={cn(
            band === "high" && "bg-emerald-100 text-emerald-800",
            band === "medium" && "border-amber-300 text-amber-800",
            band === "low" && "border-destructive/40 text-destructive",
          )}
        >
          {bandLabel(band)}
        </Badge>
      </div>
      <div className="flex flex-col gap-2">
        <Button type="button" className="w-full" onClick={onMatch}>
          Match With My Medicines
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={onRetake}>
          Retake Photo
        </Button>
      </div>
    </div>
  );
}

function MatchPanel({
  medicine,
  scannedLabel,
  onView,
  onClose,
}: {
  medicine: MatchCandidate;
  scannedLabel: string;
  onView: () => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-5 w-5" aria-hidden />
        <p className="text-sm font-semibold uppercase tracking-wide">
          Match found
        </p>
      </div>
      <div>
        <h3 className="font-display text-2xl font-semibold">{medicine.name}</h3>
        {scannedLabel && scannedLabel !== medicine.name ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Scanned as: {scannedLabel}
          </p>
        ) : null}
      </div>
      <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Your care plan says
        </p>
        <p className="mt-2 whitespace-pre-line text-foreground">
          {scheduleLabel(medicine)}
        </p>
        {medicine.instructions ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {medicine.instructions}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        <Badge variant={medicine.active ? "secondary" : "outline"}>
          {medicine.active ? "Active medication" : "Inactive medication"}
        </Badge>
      </div>
      <div className="flex flex-col gap-2">
        <Button type="button" className="w-full" onClick={onView}>
          View Medication
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}

function MultiMatchPanel({
  scannedLabel,
  medicines,
  onSelect,
  onRetake,
}: {
  scannedLabel: string;
  medicines: MatchCandidate[];
  onSelect: (m: MatchCandidate) => void;
  onRetake: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Possible matches
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Scanned: <span className="font-medium text-foreground">{scannedLabel}</span>
          . Select the medicine that matches your pack — different strengths are
          not treated as the same medicine.
        </p>
      </div>
      <ul className="space-y-2">
        {medicines.map((m, i) => (
          <li key={m.id}>
            <button
              type="button"
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border border-border bg-card px-3 py-3 text-left",
                "transition hover:border-primary/40 hover:bg-accent focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring",
              )}
              onClick={() => onSelect(m)}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span>
                <span className="block font-medium">{m.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {[m.dose, m.time_slots.join(" · ")].filter(Boolean).join(" · ")}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" className="w-full" onClick={onRetake}>
        Retake Photo
      </Button>
    </div>
  );
}

function NoMatchPanel({
  scannedLabel,
  onRetry,
  onManual,
}: {
  scannedLabel: string;
  onRetry: () => void;
  onManual: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
        <ShieldAlert className="h-5 w-5" aria-hidden />
        <p className="text-sm font-semibold uppercase tracking-wide">
          No match found
        </p>
      </div>
      {scannedLabel && scannedLabel !== "Unknown" ? (
        <p className="font-display text-xl font-semibold">{scannedLabel}</p>
      ) : null}
      <p className="text-sm text-muted-foreground">
        We couldn&apos;t confidently match this medicine with your current
        medication list. Please verify the medicine name with your
        doctor/pharmacist before taking it.
      </p>
      <div className="flex flex-col gap-2">
        <Button type="button" className="w-full" onClick={onRetry}>
          Try Again
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={onManual}>
          Enter Name Manually
        </Button>
      </div>
    </div>
  );
}

function VerifyPanel({
  error,
  manualName,
  setManualName,
  showManual,
  onRetake,
  onManualEntry,
  onSubmitManual,
}: {
  error: string | null;
  manualName: string;
  setManualName: (v: string) => void;
  showManual: boolean;
  onRetake: () => void;
  onManualEntry: () => void;
  onSubmitManual: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
        <ShieldAlert className="h-5 w-5" aria-hidden />
        <p className="text-sm font-semibold uppercase tracking-wide">
          Please verify
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        The medicine name could not be identified confidently.
        {error ? ` ${error}` : ""}
      </p>

      {showManual ? (
        <div className="space-y-2">
          <Label htmlFor="manual-medicine-name">Medicine name</Label>
          <Input
            id="manual-medicine-name"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="e.g. Metformin 500 mg"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmitManual();
            }}
          />
          <Button type="button" className="w-full" onClick={onSubmitManual}>
            Match With My Medicines
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Button type="button" variant="outline" className="w-full" onClick={onRetake}>
          Retake Photo
        </Button>
        {!showManual ? (
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={onManualEntry}
          >
            Enter Name Manually
          </Button>
        ) : null}
      </div>
    </div>
  );
}
