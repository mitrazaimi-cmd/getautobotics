"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { navLinks } from "@/content/site";
import { cta } from "@/content/messages";
import { cn } from "@/lib/cn";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Native <dialog> + showModal(): focus trap, Escape to close, inert background.
  const openMenu = () => dialogRef.current?.showModal();
  const closeMenu = () => {
    dialogRef.current?.close();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => openButtonRef.current?.focus();
    dialog.addEventListener("close", onClose);
    // Close the menu if the viewport grows to desktop width
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && dialog.open && dialog.close();
    mq.addEventListener("change", onChange);
    return () => {
      dialog.removeEventListener("close", onClose);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-200",
        scrolled ? "border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85" : "border-transparent bg-white",
      )}
    >
      <div className="container-site flex h-20 items-center justify-between gap-4">
        <Logo height={60} priority />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-[6px] px-3 text-[0.9375rem] font-medium text-navy transition-colors duration-150 hover:bg-surface"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            ref={openButtonRef}
            type="button"
            onClick={openMenu}
            aria-haspopup="dialog"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[8px] px-2 text-navy hover:bg-surface lg:hidden"
          >
            <Menu size={24} strokeWidth={1.75} aria-hidden="true" />
            <span className="text-base font-medium">Menu</span>
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-sm bg-white p-0 text-navy backdrop:bg-navy/40 open:flex open:flex-col"
        onClick={(e) => {
          // Click on the backdrop closes the menu
          if (e.target === dialogRef.current) closeMenu();
        }}
      >
        <div className="flex h-20 items-center justify-between border-b border-line px-4">
          <span className="text-base font-semibold">Menu</span>
          <button
            type="button"
            onClick={closeMenu}
            className="inline-flex min-h-11 items-center gap-2 rounded-[8px] px-3 hover:bg-surface"
          >
            <X size={24} strokeWidth={1.75} aria-hidden="true" />
            <span className="text-base font-medium">Close</span>
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="flex min-h-12 items-center rounded-[8px] px-3 text-lg font-medium hover:bg-surface"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-line p-4">
          <ButtonLink href="/#book" onClick={closeMenu} className="w-full" arrow>
            {cta.primary}
          </ButtonLink>
        </div>
      </dialog>
    </header>
  );
}
