import {
  Activity,
  BookOpen,
  CalendarDays,
  Camera,
  ClipboardList,
  Hospital,
  IdCard,
  PhoneCall,
  Pill,
} from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

const PRIMARY = [
  { label: "Check-in", href: "/patient/check-in", icon: Activity },
  { label: "Medicines", href: "/patient/medicines", icon: Pill },
  { label: "Scan Medicine", href: "/patient/medicines?scan=1", icon: Camera },
  { label: "Talk to HealNexus", href: "/patient/ai-assistant", icon: BookOpen },
  { label: "Reports", href: "/patient/investigations", icon: ClipboardList },
  { label: "Appointments", href: "/patient/appointments", icon: CalendarDays },
] as const;

const SECONDARY = [
  { label: "Health Passport", href: "/patient/passport", icon: IdCard },
  { label: "Where can I get help?", href: "/maps", icon: Hospital },
  { label: "Emergency Contact", href: "/patient/profile#emergency", icon: PhoneCall },
] as const;

export function QuickActions() {
  return (
    <section>
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Quick Actions
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {PRIMARY.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium shadow-soft",
              "transition hover:border-primary/30 hover:bg-accent",
            )}
          >
            <action.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="leading-tight">{action.label}</span>
          </Link>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {SECONDARY.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <action.icon className="h-3.5 w-3.5" aria-hidden />
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
