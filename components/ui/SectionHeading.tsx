import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  /** Slot under the title, e.g. the single Orbit Line on the page */
  accent?: ReactNode;
  className?: string;
  tone?: "light" | "dark";
};

export function SectionHeading({ id, eyebrow, title, intro, align = "left", accent, className, tone = "light" }: Props) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("eyebrow mb-3", dark && "text-on-navy-muted")}>{eyebrow}</p>
      )}
      <h2 id={id} className={cn("text-3xl sm:text-4xl", dark && "text-white")}>
        {title}
      </h2>
      {accent && <div className={cn("mt-4", align === "center" && "flex justify-center")}>{accent}</div>}
      {intro && (
        <p className={cn("mt-5 text-lg leading-relaxed", dark ? "text-on-navy-muted" : "text-muted")}>{intro}</p>
      )}
    </div>
  );
}
