"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Opt-in scroll reveal. Content is fully visible without JS; this adds the
 * `js-reveal` class and fades elements with [data-reveal] in once.
 * CSS disables the effect under prefers-reduced-motion.
 *
 * No layout reads: IntersectionObserver's first callback reports every element,
 * so in-view elements are marked visible *before* `js-reveal` hides the rest.
 * (Reading rects would also force rendering of content-visibility:auto sections.)
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)");
    if (elements.length === 0) return;

    let armed = document.documentElement.classList.contains("js-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
        if (!armed) {
          armed = true;
          document.documentElement.classList.add("js-reveal");
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
