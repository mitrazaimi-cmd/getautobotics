import { Check } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { packages, services } from "@/content/services";
import { cta, keyMessages } from "@/content/messages";

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="bg-white py-20 lg:py-28">
      <div className="container-site">
        <SectionHeading
          id="services-title"
          eyebrow="Services"
          title="Automation built around business outcomes"
          intro={keyMessages[0].text}
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {services.map((service, i) => (
            <li
              key={service.title}
              data-reveal
              style={{ "--reveal-index": i % 4 } as React.CSSProperties}
              className="flex flex-col rounded-[8px] border border-line bg-white p-6 transition-[border-color,box-shadow] duration-200 hover:border-blue/40 hover:shadow-[0_4px_16px_rgb(16_42_67/0.06)]"
            >
              <span className="flex size-11 items-center justify-center rounded-[8px] bg-surface text-navy">
                <Icon name={service.icon} />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em]">{service.title}</h3>
              <p className="mt-1 text-[0.9375rem] font-medium text-navy">{service.outcome}</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{service.description}</p>
            </li>
          ))}

          <li className="relative flex flex-col justify-between overflow-hidden rounded-[8px] bg-navy p-6 sm:col-span-2 sm:p-8">
            <div className="relative max-w-sm">
              <h3 className="text-xl text-white">Not sure where to start?</h3>
              <p className="mt-2 text-on-navy-muted">
                Most businesses have a few repetitive tasks that are worth automating first. We’ll help you find them.
              </p>
            </div>
            <div className="relative mt-6">
              <ButtonLink href="/#book" variant="on-navy" arrow>
                {cta.consideration}
              </ButtonLink>
            </div>
          </li>
        </ul>

        <div className="mt-24" id="packages">
          <SectionHeading
            eyebrow="Ways to work together"
            title={<span className="text-2xl sm:text-3xl">Start focused. Grow when you’re ready.</span>}
            intro="Every engagement starts with a consultation to understand your business. Scope and pricing are agreed once we know what will make the biggest difference."
          />
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {packages.map((pkg, i) => (
              <li
                key={pkg.name}
                data-reveal
                style={{ "--reveal-index": i } as React.CSSProperties}
                className="flex flex-col rounded-[8px] border border-line bg-white p-6 sm:p-7"
              >
                <p className="text-sm font-semibold tracking-[0.08em] text-muted uppercase">Package {i + 1}</p>
                <h3 className="mt-2 text-2xl">{pkg.name}</h3>
                <p className="mt-3 font-medium text-navy">{pkg.summary}</p>
                <p className="mt-3 text-[0.9375rem] text-muted">
                  <span className="font-semibold text-navy">Best for: </span>
                  {pkg.bestFor}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5 border-t border-line pt-5">
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[0.9375rem] text-navy">
                      <Check size={18} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-blue" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <ButtonLink
                    href="/#book"
                    variant="secondary"
                    className="w-full"
                    aria-label={`Book a consultation about ${pkg.name}`}
                  >
                    Book a consultation
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
