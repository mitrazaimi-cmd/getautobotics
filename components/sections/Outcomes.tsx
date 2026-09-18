import { ArrowDown, ArrowRight, Check, Minus } from "lucide-react";
import { Callout } from "@/components/brand/Frames";
import { ExampleWorkflow } from "@/components/sections/ExampleWorkflow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { keyMessages, transformation } from "@/content/messages";

export function Outcomes() {
  return (
    <section aria-labelledby="outcomes-title" className="border-t border-line bg-surface py-20 lg:py-24">
      <div className="container-site">
        <SectionHeading
          id="outcomes-title"
          eyebrow="Why it matters"
          title="Too much of your week still depends on you."
          intro="The problem is rarely a lack of effort. When repetitive work depends on people, responses slow down, leads slip through the cracks, and the owner becomes the bottleneck."
        />

        <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          <div data-reveal className="rounded-[8px] border border-line bg-white p-6 sm:p-8">
            <h3 className="flex items-center gap-3 text-xl">
              <span className="rounded-full border border-line-strong px-3 py-1 text-sm font-semibold text-muted">
                Before
              </span>
              Busy, but stuck
            </h3>
            <ul className="mt-6 space-y-3.5">
              {transformation.before.map((item) => (
                <li key={item} className="flex gap-3 text-muted">
                  <Minus size={20} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-muted" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div aria-hidden="true" className="flex items-center justify-center text-blue">
            <ArrowDown size={28} strokeWidth={1.75} className="lg:hidden" />
            <ArrowRight size={28} strokeWidth={1.75} className="hidden lg:block" />
          </div>

          <div
            data-reveal
            style={{ "--reveal-index": 1 } as React.CSSProperties}
            className="rounded-[8px] border border-blue/40 bg-white p-6 sm:p-8"
          >
            <h3 className="flex items-center gap-3 text-xl">
              <span className="rounded-full bg-navy px-3 py-1 text-sm font-semibold text-white">After</span>
              Organized, and growing
            </h3>
            <ul className="mt-6 space-y-3.5">
              {transformation.after.map((item) => (
                <li key={item} className="flex gap-3 font-medium text-navy">
                  <Check size={20} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-cyan" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div data-reveal className="mt-10">
          <h3 className="text-xl">What “after” looks like in practice</h3>
          <p className="mt-2 max-w-2xl text-muted">
            One inquiry, handled end to end — with a human checkpoint where judgment matters.
          </p>
          <ExampleWorkflow layout="track" className="mt-6" />
        </div>

        <Callout className="mt-10 max-w-3xl">
          <p className="text-lg font-medium">{keyMessages[2].text}</p>
        </Callout>
      </div>
    </section>
  );
}
