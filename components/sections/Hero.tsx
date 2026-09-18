import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { cta, messages } from "@/content/messages";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-white">
      <div className="container-site relative flex flex-col items-center pt-10 pb-20 text-center sm:pt-14 lg:pt-16 lg:pb-28">
        {/* Large centered logo — animates in on load (see .hero-logo in globals.css) */}
        <Image
          src="/logo.png"
          alt="Auto Botics"
          width={449}
          height={242}
          priority
          className="hero-logo h-auto w-[240px] sm:w-[320px] lg:w-[380px]"
        />

        <p className="eyebrow mt-8">AI Agents • Automation • Chatbots</p>
        <h1 id="hero-title" className="mt-4 max-w-4xl text-[2.5rem] leading-[1.08] sm:text-5xl lg:text-[3.5rem]">
          {messages.taglineHeadlineLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-6 text-xl font-semibold text-navy sm:text-2xl">{messages.promise}</p>
        <p className="mt-4 max-w-[38rem] text-lg leading-relaxed text-muted">
          Auto Botics helps U.S. small and medium-sized businesses take email, follow-up, scheduling, and admin work
          off their plates — with practical AI built around the tools you already use.
        </p>

        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <ButtonLink href="/#book" arrow>
            {cta.primary}
          </ButtonLink>
          <ButtonLink href="/#services" variant="text">
            {cta.awareness}
          </ButtonLink>
        </div>

        <p className="mt-6 text-[0.9375rem] text-muted">{messages.supporting}</p>
      </div>
    </section>
  );
}
