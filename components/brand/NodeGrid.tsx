import { useId } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** "light" = Deep Navy dots on white (10%); "dark" = white dots on Deep Navy (15%). */
  tone?: "light" | "dark";
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Brand graphic element A — Node Grid pattern (brand guide §09).
 * A quiet dot grid joined by a few right-angled lines, with exactly one Cyan path.
 * Decorative only. Never place behind body text.
 * Dots use an SVG <pattern> so the grid costs one element instead of hundreds.
 */
export function NodeGrid({ tone = "light", className, style }: Props) {
  const patternId = `node-grid-${useId().replace(/:/g, "")}`;
  const ink = tone === "light" ? "var(--color-navy)" : "var(--color-white)";
  const opacity = tone === "light" ? 0.1 : 0.15;
  const gap = 48;
  const cols = 14;
  const rows = 8;
  const width = cols * gap;
  const height = rows * gap;
  const x = (col: number) => col * gap + gap / 2;
  const y = (row: number) => row * gap + gap / 2;

  // Quiet connectors (right-angled), snapped to grid nodes
  const connectors = [
    `M${x(1)} ${y(1)} H${x(4)} V${y(3)}`,
    `M${x(9)} ${y(1)} H${x(12)} V${y(3)}`,
    `M${x(2)} ${y(6)} H${x(6)} V${y(4)}`,
    `M${x(10)} ${y(6)} V${y(7)} H${x(13)}`,
  ].join(" ");
  // The single highlighted Cyan path
  const highlight = `M${x(4)} ${y(3)} H${x(8)} V${y(5)} H${x(11)}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none select-none", className)}
      style={style}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id={patternId} width={gap} height={gap} patternUnits="userSpaceOnUse">
          <circle cx={gap / 2} cy={gap / 2} r={2.5} fill={ink} />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${patternId})`} opacity={opacity} />
      <path
        d={connectors}
        fill="none"
        stroke={ink}
        strokeWidth={1.25}
        opacity={opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={highlight}
        fill="none"
        stroke="var(--color-cyan)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={tone === "light" ? 0.55 : 0.8}
      />
      <circle cx={x(4)} cy={y(3)} r={4.5} fill="var(--color-cyan)" opacity={0.8} />
      <circle cx={x(11)} cy={y(5)} r={4.5} fill="var(--color-cyan)" opacity={0.8} />
    </svg>
  );
}
