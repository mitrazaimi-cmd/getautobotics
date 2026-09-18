import { Bot, Contact, Mail, MessageSquareMore, UserRoundCheck } from "lucide-react";
import { cn } from "@/lib/cn";

/** Illustrative workflow — shows what automation looks like, with no invented metrics. */
const steps = [
  { icon: Mail, label: "New inquiry arrives", detail: "Website form or email" },
  { icon: MessageSquareMore, label: "Instant, friendly reply", detail: "Answers common questions" },
  { icon: Contact, label: "Lead added to your CRM", detail: "Details organized automatically" },
  { icon: Bot, label: "Follow-up scheduled", detail: "Nothing depends on memory" },
  { icon: UserRoundCheck, label: "You step in when it matters", detail: "Human checkpoint" },
];

/**
 * `layout="rows"`  — vertical list (narrow columns)
 * `layout="track"` — horizontal track on wide screens, vertical below
 */
export function ExampleWorkflow({ className, layout = "rows" }: { className?: string; layout?: "rows" | "track" }) {
  const track = layout === "track";

  return (
    <figure className={cn("rounded-[8px] border border-line bg-white p-5 sm:p-6", className)}>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
        <span className="text-[0.9375rem] font-semibold text-navy">Example: lead follow-up workflow</span>
        <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted">Illustration</span>
      </figcaption>

      <ol className={cn("mt-5", track ? "grid gap-6 lg:grid-cols-5 lg:gap-4" : "space-y-1")}>
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          const last = i === steps.length - 1;
          return (
            <li
              key={step.label}
              className={cn(
                "relative flex gap-4",
                track ? "lg:flex-col lg:gap-0 lg:pb-0 lg:text-center" : "pb-3",
                !track && "pb-3",
              )}
            >
              {/* Connector: vertical in rows, horizontal across the track */}
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bg-line-strong",
                    track
                      ? "top-11 bottom-0 left-5 w-px lg:top-5 lg:right-[-1rem] lg:bottom-auto lg:left-[calc(50%+1.75rem)] lg:h-px lg:w-auto"
                      : "top-11 bottom-0 left-5 w-px",
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "relative flex size-10 shrink-0 items-center justify-center rounded-full border bg-white",
                  last ? "border-blue bg-tint text-blue" : "border-line text-navy",
                  track && "lg:mx-auto",
                )}
              >
                <StepIcon size={20} strokeWidth={1.75} />
              </span>
              <span className={cn("pt-0.5", track && "lg:mt-3 lg:pt-0")}>
                <span className="block text-[0.9375rem] font-semibold text-navy">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.label}
                </span>
                <span className="block text-sm text-muted">{step.detail}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </figure>
  );
}
