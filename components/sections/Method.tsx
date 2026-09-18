import { OrbitLine } from "@/components/brand/OrbitLine";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { methodSteps } from "@/content/method";
import { cta, messages } from "@/content/messages";

export function Method() {
  return (
    <section id="method" aria-labelledby="method-title" className="border-y border-line bg-surface py-20 lg:py-28">
      <div className="container-site">
        <SectionHeading
          id="method-title"
          eyebrow="How we work"
          title="The Auto Botics Method"
          accent={<OrbitLine />}
          intro="Understand first. Automate what matters. Keep improving. Seven clear steps, so you always know what happens next."
        />

        <ol className="relative mt-14 grid gap-0 xl:grid-cols-7 xl:gap-4">
          {/* Horizontal connector (desktop) */}
          <span aria-hidden="true" className="absolute top-6 right-[7%] left-[7%] hidden h-px bg-line-strong xl:block" />

          {methodSteps.map((step, i) => {
            const last = i === methodSteps.length - 1;
            return (
              <li
                key={step.name}
                data-reveal
                style={{ "--reveal-index": i } as React.CSSProperties}
                className="relative flex gap-5 pb-10 last:pb-0 xl:flex-col xl:items-center xl:gap-0 xl:pb-0 xl:text-center"
              >
                {/* Vertical connector (mobile/tablet) */}
                {!last && (
                  <span aria-hidden="true" className="absolute top-12 bottom-0 left-6 w-px bg-line-strong xl:hidden" />
                )}
                <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-white text-navy">
                  <Icon name={step.icon} size={22} />
                  <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-navy text-[0.6875rem] font-bold text-white">
                    {i + 1}
                  </span>
                </span>
                <div className="pt-1.5 xl:mt-5 xl:pt-0">
                  <h3 className="text-lg font-semibold">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.name}
                  </h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted xl:text-sm">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-16 flex flex-col gap-8 rounded-[8px] bg-navy p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <blockquote className="max-w-2xl">
            <p className="text-2xl leading-snug font-semibold text-white sm:text-[1.75rem]">{messages.methodPromise}</p>
          </blockquote>
          <div className="shrink-0">
            <ButtonLink href="/#book" variant="on-navy" arrow>
              {cta.primary}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
