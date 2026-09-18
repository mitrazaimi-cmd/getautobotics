import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "text" | "on-navy";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 text-center rounded-[8px] transition-colors duration-200 ease-out cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  // 19px bold = WCAG "large text" (14pt bold) → white on #1677E8 (4.34:1) passes AA.
  primary: "bg-blue text-white text-[1.1875rem] font-bold leading-tight hover:bg-blue-hover active:bg-blue-hover",
  secondary:
    "border-[1.5px] border-navy text-navy text-base font-semibold hover:bg-surface active:bg-surface",
  text: "group text-navy text-base font-semibold underline decoration-blue decoration-2 underline-offset-[6px] hover:decoration-navy",
  "on-navy": "bg-white text-navy text-[1.1875rem] font-bold leading-tight hover:bg-tint",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-6 py-3",
  sm: "min-h-11 px-4 py-2",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  children: ReactNode;
  className?: string;
};

function Content({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      <span>{children}</span>
      {arrow && (
        <ArrowRight
          size={20}
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  arrow,
  children,
  className,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  const textVariant = variant === "text";
  return (
    <Link
      href={href}
      className={cn(base, "group", !textVariant && sizes[size], textVariant && "min-h-11", variants[variant], className)}
      {...rest}
    >
      <Content arrow={arrow}>{children}</Content>
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  arrow,
  children,
  className,
  type = "button",
  ...rest
}: CommonProps & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button type={type} className={cn(base, "group", sizes[size], variants[variant], className)} {...rest}>
      <Content arrow={arrow}>{children}</Content>
    </button>
  );
}
