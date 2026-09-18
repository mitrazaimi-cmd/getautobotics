import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Full-color logo from public/logo.png (449×242, transparent).
 * Brand rules: never stretch, recolor, or add effects; keep generous clear space.
 */
export function Logo({ className, height = 52, priority }: { className?: string; height?: number; priority?: boolean }) {
  const width = Math.round((449 / 242) * height);
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center rounded-[4px] p-1", className)}>
      <Image
        src="/logo.png"
        alt="Auto Botics — home"
        width={width}
        height={height}
        priority={priority}
        style={{ width, height }}
      />
    </Link>
  );
}
