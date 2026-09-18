import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { caseStudies } from "@/content/portfolio";

const structure = ["Problem", "Workflow", "Solution", "Implementation", "Result", "Lesson"];

export function Portfolio() {
  return (
    <section id="portfolio" aria-labelledby="portfolio-title" className="bg-white py-20 lg:py-28">
      <div className="container-site">
        <SectionHeading
          id="portfolio-title"
          eyebrow="My work"
          title="Case studies"
          intro="Each project is written up the same way — the problem, the workflow, what was built, and what actually changed — so you can see how the thinking applies to your business."
        />

        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted" aria-label="Case study structure">
          {structure.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-2">
              <span className="font-medium text-navy">{s}</span>
              {i < structure.length - 1 && <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />}
            </span>
          ))}
        </p>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {caseStudies.map((study, i) => (
            <li
              key={study.slug}
              data-reveal
              style={{ "--reveal-index": i } as React.CSSProperties}
              className="group relative flex flex-col rounded-[8px] border border-line bg-white p-6 transition-[border-color,box-shadow] duration-200 focus-within:border-blue hover:border-blue/40 hover:shadow-[0_4px_16px_rgb(16_42_67/0.06)]"
            >
              {study.placeholder && <PlaceholderBadge className="self-start" />}
              <span className="mt-5 flex size-11 items-center justify-center rounded-[8px] bg-surface text-navy">
                <Icon name={study.icon} />
              </span>
              <p className="mt-5 text-sm font-medium text-muted">{study.businessType}</p>
              <h3 className="mt-1 text-lg font-semibold">
                <Link href={`/portfolio/${study.slug}`} className="after:absolute after:inset-0 after:rounded-[8px] focus-visible:outline-none">
                  {study.title}
                </Link>
              </h3>
              <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-muted">{study.summary}</p>
              <span className="mt-6 inline-flex items-center gap-2 font-semibold text-navy underline decoration-blue decoration-2 underline-offset-4">
                Read the case study
                <ArrowRight size={18} strokeWidth={2} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
