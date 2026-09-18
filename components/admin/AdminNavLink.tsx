"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AdminNavLink({ href, match, children }: { href: string; match: "requests" | "messages"; children: ReactNode }) {
  const pathname = usePathname();
  const active = match === "messages" ? pathname.startsWith("/admin/messages") : !pathname.startsWith("/admin/messages");
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-[6px] px-3 text-[0.9375rem] font-medium text-navy hover:bg-surface",
        active && "bg-tint",
      )}
    >
      {children}
    </Link>
  );
}
