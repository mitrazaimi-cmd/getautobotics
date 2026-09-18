import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contact, isPlaceholder } from "@/content/site";

function ContactRow({
  icon: RowIcon,
  label,
  value,
  href,
  external,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}) {
  const placeholder = isPlaceholder(value);
  return (
    <li className="flex gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-[8px] bg-surface text-navy">
        <RowIcon size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-medium text-muted">{label}</p>
        {placeholder || !href ? (
          <p className={placeholder ? "font-medium text-muted" : "font-medium text-navy"}>{value}</p>
        ) : (
          <a
            href={href}
            className="inline-flex items-center gap-1 font-semibold text-navy underline decoration-blue decoration-2 underline-offset-4 hover:decoration-navy"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {value}
            {external && (
              <>
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </>
            )}
          </a>
        )}
      </div>
    </li>
  );
}

export function ContactSection() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t border-line bg-surface py-20 lg:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading
            id="contact-title"
            eyebrow="Contact us"
            title="Have a quick question first?"
            intro="Send a short message and we’ll reply by email. If you already know you’d like help, the consultation request above is the fastest way to get started."
          />
          <ul className="mt-10 space-y-6">
            <ContactRow icon={Mail} label="Email" value={contact.email} href={`mailto:${contact.email}`} />
            <ContactRow icon={Phone} label="Phone" value={contact.phone} href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} />
            <ContactRow
              icon={ArrowUpRight}
              label="LinkedIn"
              value={contact.linkedinLabel}
              href={contact.linkedin}
              external
            />
            <ContactRow icon={MapPin} label="Based in" value={contact.location} />
          </ul>
        </div>
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
