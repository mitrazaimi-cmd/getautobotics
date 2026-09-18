import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Brand frame C — card: 8px radius, thin light-navy border, ≥16px padding. */
export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  return (
    <Tag className={cn("rounded-[8px] border border-line bg-white p-6", className)}>{children}</Tag>
  );
}

/** Brand frame C — callout: light tint with a 3px Electric Blue bar on the left. */
export function Callout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-r-[8px] border-l-[3px] border-blue bg-tint px-5 py-4 text-navy", className)}>
      {children}
    </div>
  );
}

/** Brand element D — hairline divider. */
export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}
