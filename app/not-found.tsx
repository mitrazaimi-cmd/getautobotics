import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { ButtonLink } from "@/components/ui/Button";
import { cta } from "@/content/messages";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <SiteShell>
      <section aria-labelledby="nf-title" className="relative overflow-hidden bg-white py-24 lg:py-32">
        <div className="container-site relative max-w-2xl text-center">
          <p className="eyebrow">Error 404</p>
          <h1 id="nf-title" className="mt-4 text-4xl sm:text-5xl">
            This page took a different route.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            The link may be outdated, or the page may have moved. Here are two good places to go next.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <ButtonLink href="/#book" arrow>
              {cta.primary}
            </ButtonLink>
            <ButtonLink href="/" variant="text">
              Go to the home page
            </ButtonLink>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
