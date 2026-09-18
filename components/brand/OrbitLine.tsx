import { cn } from "@/lib/cn";

/**
 * Brand graphic element B — Orbit Line (brand guide §09).
 * A thin curved arc with a small end dot, taken from the logo swoosh.
 * Rule: maximum ONE per layout. Never rotated into a full ring.
 */
export function OrbitLine({ className, color = "cyan" }: { className?: string; color?: "cyan" | "blue" }) {
  const stroke = color === "cyan" ? "var(--color-cyan)" : "var(--color-blue)";
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 160 24"
      className={cn("h-6 w-40", className)}
      fill="none"
    >
      <path d="M4 18 C 44 4, 108 2, 150 10" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={152} cy={10.5} r={3} fill={stroke} />
    </svg>
  );
}
