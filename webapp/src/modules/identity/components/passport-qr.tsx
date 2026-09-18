import { useState } from "react";
import QRCode from "react-qr-code";

import { Button } from "@/components/ui/button";
import { encodePublicPassport } from "@/modules/identity/public-passport";
import { identityRepository } from "@/modules/identity/repository";
import type { DigitalPassport, EmergencyProfile } from "@/modules/identity/types";
import { cn } from "@/lib/utils";

function toEmergency(profile: DigitalPassport): EmergencyProfile {
  return {
    token: profile.qr_token,
    full_name: profile.full_name,
    blood_group: profile.blood_group,
    allergies: profile.allergies,
    medicines: profile.medicines.map((m) => ({ name: m.name, dose: m.dose })),
    emergency_contact: profile.emergency_contact,
    doctor: profile.doctor
      ? {
          name: profile.doctor.name,
          phone: profile.doctor.phone,
          hospital: profile.doctor.hospital,
        }
      : null,
    disclaimer: "",
  };
}

export function PassportQr({
  token,
  profile,
  size = 128,
  className,
  showCopy = true,
}: {
  token: string;
  profile?: DigitalPassport | EmergencyProfile;
  size?: number;
  className?: string;
  showCopy?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const packed = profile
    ? encodePublicPassport(
        "patient_id" in profile ? toEmergency(profile) : profile,
      )
    : undefined;
  const url = identityRepository.emergencyQrUrl(token, packed);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="rounded-2xl bg-white p-3 shadow-soft ring-1 ring-black/5">
        <QRCode
          value={url}
          size={size}
          level="M"
          bgColor="#ffffff"
          fgColor="#0f2744"
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        />
        <p className="mt-2 text-center text-[10px] font-medium tracking-wide text-slate-500">
          Scan for limited emergency passport
        </p>
      </div>
      {showCopy ? (
        <div className="space-y-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => void copy()}
          >
            {copied ? "Link copied" : "Copy mobile link"}
          </Button>
          <p className="text-[10px] leading-snug text-muted-foreground">
            Phone cameras open this link without signing in. Only blood group,
            allergies, medicines, and emergency contacts are shown — not the
            full record. Open HealNexus with your Wi‑Fi IP (not localhost) so
            a phone can reach this demo.
          </p>
        </div>
      ) : null}
    </div>
  );
}
