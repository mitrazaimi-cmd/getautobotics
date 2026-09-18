import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { caseStudies, getCaseStudy } from "@/content/portfolio";
import { Callout } from "@/components/brand/Frames";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { cta } from "@/content/messages";

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return {
    title: study.title,
    description: study.summary,
    alternates: { canonical: `/portfolio/${study.slug}` },
    // Placeholder entries must not be indexed
    robots: study.placeholder ? { index: false, follow: true } : undefined,
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const sections = [
    { n: 1, title: "Problem", body: <p>{study.problem}</p> },
    {
      n: 2,
      title: "Workflow",
      body: (
        <ol className="list-decimal space-y-2 pl-5">
          {study.workflow.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      ),
    },
    { n: 3, title: "Solution", body: <p>{study.solution}</p> },
    {
      n: 4,
      title: "Implementation",
      body: (
        <ul className="list-disc space-y-2 pl-5">
          {study.implementation.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ),
    },
    { n: 5, title: "Result", body: <p>{study.result}</p> },
  ];

  return (
    <article aria-labelledby="case-title" className="bg-white">
      <header className="border-b border-line bg-surface py-14 lg:py-20">
        <div className="container-site max-w-4xl">
          <Link
            href="/#portfolio"
            className="inline-flex min-h-11 items-center gap-2 font-medium text-navy hover:underline hover:decoration-blue hover:decoration-2 hover:underline-offset-4"
          >
            <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" />
            All case studies
          </Link>
          {study.placeholder && (
            <div className="mt-6">
              <PlaceholderBadge />
            </div>
          )}
          <div className="mt-6 flex items-center gap-3 text-muted">
            <span className="flex size-10 items-center justify-center rounded-[8px] bg-white text-navy">
              <Icon name={study.icon} size={22} />
            </span>
            <span className="font-medium">{study.businessType}</span>
          </div>
          <h1 id="case-title" className="mt-4 text-3xl sm:text-5xl">
            {study.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{study.summary}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tools used">
            {study.tools.map((tool) => (
              <li key={tool} className="rounded-full border border-line bg-white px-3 py-1 text-sm font-medium text-navy">
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className="container-site max-w-4xl py-14 lg:py-20">
        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.title} aria-labelledby={`case-${s.n}`} className="grid gap-3 sm:grid-cols-[10rem_1fr] sm:gap-8">
              <h2 id={`case-${s.n}`} className="flex items-baseline gap-2 text-xl">
                <span className="text-sm font-semibold text-muted">0{s.n}</span>
                {s.title}
              </h2>
              <div className="text-lg leading-relaxed text-navy">{s.body}</div>
            </section>
          ))}

          <section aria-labelledby="case-6" className="grid gap-3 sm:grid-cols-[10rem_1fr] sm:gap-8">
            <h2 id="case-6" className="flex items-baseline gap-2 text-xl">
              <span className="text-sm font-semibold text-muted">06</span>
              Lesson
            </h2>
            <Callout>
              <p className="text-lg font-medium">{study.lesson}</p>
            </Callout>
          </section>
        </div>

        <div className="mt-16 rounded-[8px] bg-navy p-8 sm:p-10">
          <h2 className="text-2xl text-white">Wondering what this could look like for your business?</h2>
          <p className="mt-3 text-on-navy-muted">
            Every business is different. We start by understanding yours, then automate what actually matters.
          </p>
          <div className="mt-6">
            <ButtonLink href="/#book" variant="on-navy" arrow>
              {cta.primary}
            </ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}
