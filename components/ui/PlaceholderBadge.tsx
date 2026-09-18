import { PLACEHOLDER_LABEL } from "@/content/portfolio";
import { cn } from "@/lib/cn";

/** Unmistakable marker for content that must be replaced before launch. */
export function PlaceholderBadge({ className, label = PLACEHOLDER_LABEL }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] border border-dashed border-field bg-surface px-2.5 py-1 text-xs font-semibold text-muted",
        className,
      )}
    >
      {label}
    </span>
  );
}
