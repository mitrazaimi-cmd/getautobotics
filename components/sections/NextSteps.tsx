import { cn } from "@/lib/cn";

export const nextSteps = [
  {
    title: "We review your request",
    text: "Your details are read personally, so the conversation starts from your business — not a script.",
  },
  {
    title: "We agree on a time",
    text: "We’ll email you to confirm a time that works, in your time zone, with a calendar invite.",
  },
  {
    title: "We talk through your business",
    text: "Together we look at where time goes and find the highest-value automation opportunities.",
  },
];

export function NextSteps({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <ol className={cn("space-y-6", className)}>
      {nextSteps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
              dark ? "bg-white text-navy" : "bg-navy text-white",
            )}
          >
            {i + 1}
          </span>
          <div>
            <p className={cn("font-semibold", dark ? "text-white" : "text-navy")}>
              <span className="sr-only">Step {i + 1}: </span>
              {step.title}
            </p>
            <p className={cn("mt-1 text-[0.9375rem] leading-relaxed", dark ? "text-on-navy-muted" : "text-muted")}>
              {step.text}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
