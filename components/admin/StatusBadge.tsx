import { cn } from "@/lib/cn";

// Status is always shown as text; color is only a secondary cue.
const styles: Record<string, string> = {
  NEW: "bg-tint text-navy border-blue/40",
  CONTACTED: "bg-white text-navy border-line-strong",
  SCHEDULED: "bg-success-bg text-success border-success/30",
  COMPLETED: "bg-surface text-muted border-line",
  CANCELLED: "bg-danger-bg text-danger border-danger/30",
};

const labels: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        styles[status] ?? styles.CONTACTED,
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
