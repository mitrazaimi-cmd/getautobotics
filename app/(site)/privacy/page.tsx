import type { Metadata } from "next";
import { Callout } from "@/components/brand/Frames";
import { contact, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Auto Botics collects, uses, and protects the information you share with us.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "[Month Day, Year]";

export default function PrivacyPage() {
  return (
    <article aria-labelledby="privacy-title" className="bg-white py-16 lg:py-24">
      <div className="container-site max-w-3xl">
        <Callout className="mb-10">
          <p className="font-semibold">[Placeholder — review before launch]</p>
          <p className="mt-1">
            This is starter text, not legal advice. Have it reviewed so it matches how you actually handle data and the
            laws that apply to you (for example, state privacy laws such as the CCPA/CPRA).
          </p>
        </Callout>

        <h1 id="privacy-title" className="text-4xl sm:text-5xl">
          Privacy policy
        </h1>
        <p className="mt-4 text-muted">Last updated: {LAST_UPDATED}</p>

        <div className="mt-10 space-y-10 text-lg leading-relaxed text-navy [&_h2]:text-2xl [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">
          <section>
            <h2>Who we are</h2>
            <p>
              {site.name} ({site.domain}) provides AI agent, automation, and chatbot consulting for small and
              medium-sized businesses. This policy explains what information we collect through this website and how we
              use it.
            </p>
          </section>

          <section>
            <h2>What we collect</h2>
            <ul>
              <li>
                <strong>Consultation requests:</strong> your name, email, optional phone, company name and size, the
                challenge you describe, preferred times, how you heard about us, and your browser’s time zone.
              </li>
              <li>
                <strong>Contact messages:</strong> your name, email, and message.
              </li>
              <li>
                <strong>Basic technical data:</strong> a one-way hashed version of your IP address, used only to prevent
                spam and abuse.
              </li>
            </ul>
          </section>

          <section>
            <h2>How we use it</h2>
            <ul>
              <li>To respond to your request and arrange your consultation.</li>
              <li>To send emails about your request: confirmation, scheduling, reminders, and changes.</li>
              <li>To protect the website from spam and abuse.</li>
            </ul>
            <p className="mt-4">We do not sell your personal information, and we do not use it for advertising.</p>
          </section>

          <section>
            <h2>Service providers</h2>
            <p>
              We use a small number of trusted providers to run this website: [hosting provider, e.g. Vercel], [database
              provider, e.g. Neon], and [email provider, e.g. Resend]. They process data only to provide their services
              to us.
            </p>
          </section>

          <section>
            <h2>How long we keep it</h2>
            <p>[State your retention period, e.g. “We keep consultation requests for up to 24 months unless you ask us to delete them sooner.”]</p>
          </section>

          <section>
            <h2>Your choices</h2>
            <p>
              You can ask us to access, correct, or delete your information at any time by emailing{" "}
              <strong>{contact.email}</strong>. We’ll respond within [number] days.
            </p>
          </section>

          <section>
            <h2>Changes</h2>
            <p>If we update this policy, we’ll change the date at the top of this page.</p>
          </section>
        </div>
      </div>
    </article>
  );
}
