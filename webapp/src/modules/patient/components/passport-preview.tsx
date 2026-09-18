import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PassportView } from "@/modules/patient/types";

export function PassportPreview({ passport }: { passport: PassportView }) {
  return (
    <section className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-secondary/10 p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Health Passport
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Blood group</dt>
              <dd className="font-semibold">{passport.blood_group || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Allergies</dt>
              <dd className="font-medium">
                {passport.allergies.length
                  ? passport.allergies.join(", ")
                  : "None recorded"}
              </dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-xs text-muted-foreground">ABHA</dt>
              <dd className="truncate font-mono text-xs font-semibold">
                {passport.abha_id_demo || "—"}
              </dd>
            </div>
          </dl>
        </div>
        <Link
          to="/patient/passport"
          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
        >
          Open Passport
        </Link>
      </div>
    </section>
  );
}
