import { Check, Circle, Moon, Sun, Sunrise, Sunset, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TodayTask } from "@/modules/patient/types";

const PERIODS: Array<{
  id: TodayTask["period"];
  label: string;
  icon: typeof Sunrise;
}> = [
  { id: "morning", label: "Morning", icon: Sunrise },
  { id: "afternoon", label: "Afternoon", icon: Sun },
  { id: "evening", label: "Evening", icon: Sunset },
  { id: "night", label: "Night", icon: Moon },
];

export function TodaysCareList({
  tasks,
  busy,
  onComplete,
  onSkip,
}: {
  tasks: TodayTask[];
  busy?: boolean;
  onComplete: (taskId: string) => void;
  onSkip: (taskId: string) => void;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-soft sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Today&apos;s Care
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Complete the items your care plan scheduled for today.
          </p>
        </div>
        <Link
          to="/patient/care-plan"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          View full care plan
        </Link>
      </div>

      <div className="mt-4 space-y-4">
        {PERIODS.map((period) => {
          const items = tasks.filter((t) => t.period === period.id);
          if (!items.length) return null;
          const Icon = period.icon;
          return (
            <div key={period.id}>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                {period.label}
              </p>
              <ul className="divide-y divide-border/70 rounded-lg border border-border/80">
                {items.map((task) => (
                  <CareItem
                    key={task.id}
                    task={task}
                    busy={busy}
                    onComplete={() => onComplete(task.id)}
                    onSkip={() => onSkip(task.id)}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CareItem({
  task,
  busy,
  onComplete,
  onSkip,
}: {
  task: TodayTask;
  busy?: boolean;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const done = task.status === "completed";
  const skipped = task.status === "skipped";

  return (
    <li
      className={cn(
        "flex items-center gap-3 px-3 py-2",
        done && "bg-secondary/5",
        skipped && "opacity-60",
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
          done && "border-secondary bg-secondary text-secondary-foreground",
          skipped && "border-muted-foreground/30 text-muted-foreground",
          !done && !skipped && "border-primary/35 text-primary",
        )}
        aria-hidden
      >
        {done ? (
          <Check className="h-3.5 w-3.5" />
        ) : skipped ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          <Circle className="h-2.5 w-2.5 fill-current" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium leading-snug",
            done && "text-muted-foreground line-through decoration-secondary/40",
          )}
        >
          {task.title}
        </p>
        {task.description ? (
          <p className="truncate text-[12px] text-muted-foreground">
            {task.description}
          </p>
        ) : null}
      </div>
      {task.status === "pending" ? (
        <div className="flex shrink-0 gap-1">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 px-2"
            disabled={busy}
            onClick={onComplete}
            aria-label={`Complete ${task.title}`}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            disabled={busy}
            onClick={onSkip}
            aria-label={`Skip ${task.title}`}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <span className="text-[11px] font-medium capitalize text-muted-foreground">
          {task.status}
        </span>
      )}
    </li>
  );
}
