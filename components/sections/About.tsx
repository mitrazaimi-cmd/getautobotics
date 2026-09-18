import Image from "next/image";
import { Check, UserRound } from "lucide-react";
import { Callout } from "@/components/brand/Frames";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { founder, workingWithMe } from "@/content/about";
import { coreValues } from "@/content/values";
import { cta, keyMessages, messages } from "@/content/messages";

function FounderPhoto() {
  if (!founder.photo) {
    return (
      <div
        role="img"
        aria-label="Placeholder for the founder’s photo"
        className="flex size-40 shrink-0 flex-col items-center justify-center gap-2 rounded-full border border-dashed border-field bg-white text-muted"
      >
        <UserRound size={44} strokeWidth={1.25} aria-hidden="true" />
        <PlaceholderBadge label="[Your Photo]" />
      </div>
    );
  }

  if (founder.shape === "round") {
    // Rendered at its natural size so a small portrait stays sharp
    return (
      <Image
        src={founder.photo}
        alt={founder.photoAlt}
        width={founder.photoWidth}
        height={founder.photoHeight}
        className="size-40 shrink-0 rounded-full border border-line bg-white object-cover"
      />
    );
  }

  return (
    <Image
      src={founder.photo}
      alt={founder.photoAlt}
      width={800}
      height={1000}
      sizes="(min-width: 1024px) 380px, 100vw"
      className="aspect-[4/5] w-full max-w-sm shrink-0 rounded-[8px] border border-line object-cover"
    />
  );
}

export function About() {
  const portrait = founder.photo && founder.shape !== "round";

  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-line bg-surface py-20 lg:py-28">
      <div className="container-site">
        <div className={portrait ? "grid gap-12 lg:grid-cols-12 lg:gap-16" : "max-w-3xl"}>
          {portrait && (
            <div className="lg:col-span-5">
              <FounderPhoto />
            </div>
          )}

          <div className={portrait ? "lg:col-span-7" : undefined}>
            <div className={portrait ? undefined : "flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8"}>
              {!portrait && <FounderPhoto />}
              <div>
                <p className="eyebrow">About me</p>
                <h2 id="about-title" className="mt-3 text-3xl sm:text-4xl">
                  Hi, I’m {founder.name}.
                </h2>
                <p className="mt-2 text-lg font-medium text-muted">{founder.title}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4 text-lg leading-relaxed text-navy">
              {founder.bio.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <Callout className="mt-8">
              <p className="text-xl font-semibold">{messages.positioning}</p>
              <p className="mt-1 text-navy">{keyMessages[4].text}</p>
            </Callout>

            <h3 className="mt-10 text-xl">What working together looks like</h3>
            <ul className="mt-4 space-y-3">
              {workingWithMe.map((item) => (
                <li key={item} className="flex gap-3 text-navy">
                  <Check size={20} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-blue" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <ButtonLink href="/#book" arrow>
                {cta.primary}
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-2xl">What we stand for</h3>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {coreValues.map((value, i) => (
              <li
                key={value.name}
                data-reveal
                style={{ "--reveal-index": i } as React.CSSProperties}
                className="rounded-[8px] border border-line bg-white p-5"
              >
                <Icon name={value.icon} className="text-navy" />
                <p className="mt-4 font-semibold text-navy">{value.name}</p>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-muted">{value.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
