import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { navLinks, site, socialLinks, contact, isPlaceholder } from "@/content/site";
import { messages, cta } from "@/content/messages";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white">
      <div className="container-site grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo height={64} className="-ml-1" />
          <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-muted">{messages.pitchShort}</p>
          <p className="mt-4 text-[0.9375rem] font-medium text-navy">{messages.tagline}</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <h2 className="text-sm font-semibold tracking-[0.08em] text-muted uppercase">Explore</h2>
          <ul className="mt-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center text-navy hover:underline hover:decoration-blue hover:decoration-2 hover:underline-offset-4">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/book" className="inline-flex min-h-11 items-center font-semibold text-navy underline decoration-blue decoration-2 underline-offset-4">
                {cta.primary}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="text-sm font-semibold tracking-[0.08em] text-muted uppercase">Connect</h2>
          <ul className="mt-4 flex flex-col gap-1">
            {socialLinks.map((s) =>
              isPlaceholder(s.href) ? (
                <li key={s.label} className="inline-flex min-h-11 items-center gap-1.5 text-muted">
                  {s.label} <span className="text-sm">(link coming soon)</span>
                </li>
              ) : (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 text-navy hover:underline hover:decoration-blue hover:decoration-2 hover:underline-offset-4"
                  >
                    {s.label}
                    <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ),
            )}
            <li className="inline-flex min-h-11 items-center text-navy">
              {isPlaceholder(contact.email) ? (
                <span className="text-muted">{contact.email}</span>
              ) : (
                <a href={`mailto:${contact.email}`} className="hover:underline hover:decoration-blue hover:decoration-2 hover:underline-offset-4">
                  {contact.email}
                </a>
              )}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col gap-3 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. {site.category}
          </p>
          <Link href="/privacy" className="inline-flex min-h-11 items-center text-navy hover:underline hover:decoration-blue hover:decoration-2 hover:underline-offset-4">
            Privacy policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
