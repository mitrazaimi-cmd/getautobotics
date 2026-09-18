import type { Metadata } from "next";
import { CircleCheck } from "lucide-react";
import { NextSteps } from "@/components/sections/NextSteps";
import { ButtonLink } from "@/components/ui/Button";
import { Callout } from "@/components/brand/Frames";
import { cta } from "@/content/messages";

export const metadata: Metadata = {
  title: "Request received",
  robots: { index: false, follow: false },
};

export default function BookingSuccessPage() {
  return (
    <section aria-labelledby="success-title" className="bg-surface py-20 lg:py-28">
      <div className="container-site">
        <div className="mx-auto max-w-2xl rounded-[8px] border border-line bg-white p-8 sm:p-12">
          <CircleCheck size={44} strokeWidth={1.5} aria-hidden="true" className="text-success" />
          <h1 id="success-title" className="mt-6 text-3xl sm:text-4xl">
            Thank you — we received your request.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            A confirmation is on its way to your inbox. If you don’t see it in a few minutes, check your spam or
            promotions folder.
          </p>

          <h2 className="mt-10 text-xl">What happens next</h2>
          <NextSteps className="mt-6" />

          <Callout className="mt-10">
            <p>
              <span className="font-semibold">While you wait:</span> jot down the two or three tasks that take the most
              time each week. They’re usually the best place to start.
            </p>
          </Callout>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="/#services" variant="secondary">
              {cta.awareness}
            </ButtonLink>
            <ButtonLink href="/" variant="text">
              Back to the home page
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
