"use client";

import { useEffect } from "react";

/**
 * Makes same-page anchor links (e.g. "/#book") always scroll to their section.
 *
 * Without this, a browser ignores a link whose hash already matches the address
 * bar — so after clicking one "Book a consultation" link, every other link to
 * the same section appears to do nothing.
 *
 * Runs in the capture phase and calls preventDefault, which also stops Next.js's
 * own link handling. Without JavaScript, links keep working normally.
 */
export function HashScroll() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      // Only same-page links with a hash
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;

      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;

      event.preventDefault();

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });

      // Keep the address bar in sync without adding duplicate history entries
      if (location.hash !== url.hash) history.pushState(null, "", url.hash);

      // Move keyboard focus to the section, so the next Tab continues from there
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
