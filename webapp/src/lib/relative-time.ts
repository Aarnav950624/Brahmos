/** Calendar-day distance. Positive = future, negative = past. */
export function calendarDaysUntil(isoDate: string, from = new Date()): number {
  const target = new Date(isoDate);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

/**
 * Natural-language day offset. Never returns a negative countdown
 * such as "-45 Days Left".
 */
export function formatDaysAway(
  days: number | null | undefined,
  opts?: { overdueNoun?: string },
): string {
  if (days == null || Number.isNaN(days)) return "";
  const overdue = opts?.overdueNoun ?? "overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 1) return `In ${days} days`;
  return `${Math.abs(days)} days ${overdue}`;
}

export function formatAppointmentWhen(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
