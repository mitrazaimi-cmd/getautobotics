import { Callout } from "@/components/brand/Frames";
import { BookingForm } from "@/components/forms/BookingForm";
import { NextSteps } from "@/components/sections/NextSteps";
import { cta, messages } from "@/content/messages";

export function Booking({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const Heading = headingLevel;
  return (
    <section id="book" aria-labelledby="book-title" className="border-t border-line bg-white py-20 lg:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">Consultation request</p>
            <Heading id="book-title" className="mt-3 text-3xl sm:text-4xl">
              {cta.primary}
            </Heading>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Tell us a little about your business and where time is going. You don’t need to know which tools or AI
              you need — that’s what the conversation is for.
            </p>

            <h3 className="mt-10 text-lg">What happens next</h3>
            <NextSteps className="mt-5" />

            <Callout className="mt-10">
              <p className="font-medium">{messages.supporting}</p>
            </Callout>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-[8px] border border-line bg-white p-6 sm:p-8 lg:p-10">
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
}
