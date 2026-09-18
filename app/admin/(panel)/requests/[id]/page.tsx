import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { NotesForm, ScheduleForm, StatusForm } from "@/components/admin/RequestForms";
import { challengeLabel, companySizeLabel } from "@/lib/validation";
import { DEFAULT_TIMEZONE, formatDateTimeInZone, timezoneLabel, utcToZonedInput } from "@/lib/time";

export const metadata: Metadata = { title: "Request details" };

const stampFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-muted">{label}</dt>
      <dd className="mt-0.5 text-navy">{children}</dd>
    </div>
  );
}

export default async function RequestDetailPage({ params }: PageProps<"/admin/requests/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const r = await db.consultationRequest.findUnique({ where: { id } });
  if (!r) notFound();

  const tz = r.timezone ?? DEFAULT_TIMEZONE;
  const scheduledInput = r.scheduledAt ? utcToZonedInput(r.scheduledAt, tz) : null;

  return (
    <div>
      <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 font-medium text-navy hover:underline">
        <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" /> All requests
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl">{r.fullName}</h1>
        <StatusBadge status={r.status} />
      </div>
      <p className="mt-1 text-lg text-muted">
        {r.companyName} · {companySizeLabel(r.companySize)}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section aria-labelledby="req-details" className="rounded-[8px] border border-line bg-white p-6">
            <h2 id="req-details" className="text-xl">Request</h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <Detail label="Email">
                <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 font-medium underline decoration-blue decoration-2 underline-offset-4">
                  <Mail size={16} strokeWidth={1.75} aria-hidden="true" />
                  {r.email}
                </a>
              </Detail>
              <Detail label="Phone">
                {r.phone ? (
                  <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1.5 font-medium underline decoration-blue decoration-2 underline-offset-4">
                    <Phone size={16} strokeWidth={1.75} aria-hidden="true" />
                    {r.phone}
                  </a>
                ) : (
                  <span className="text-muted">Not provided</span>
                )}
              </Detail>
              <Detail label="Main challenge">{challengeLabel(r.mainChallenge)}</Detail>
              <Detail label="Preferred times">{r.preferredTimes ?? <span className="text-muted">Not provided</span>}</Detail>
              <Detail label="Visitor time zone (detected)">{r.timezone ? timezoneLabel(r.timezone) : <span className="text-muted">Unknown</span>}</Detail>
              <Detail label="Heard about us">{r.referralSource ?? <span className="text-muted">Not provided</span>}</Detail>
            </dl>
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted">What they need</h3>
              <p className="mt-2 rounded-[8px] bg-surface p-4 whitespace-pre-wrap text-navy">{r.description}</p>
            </div>
            <p className="mt-5 text-sm text-muted">
              Received {stampFmt.format(r.createdAt)} UTC · Consent given {stampFmt.format(r.consentAt)} UTC
            </p>
          </section>

          <section aria-labelledby="req-schedule" className="rounded-[8px] border border-line bg-white p-6">
            <h2 id="req-schedule" className="text-xl">Schedule the consultation</h2>
            {r.scheduledAt ? (
              <p className="mt-2 text-navy">
                Currently: <strong>{formatDateTimeInZone(r.scheduledAt, tz)}</strong>
                {r.status === "CANCELLED" && <span className="text-danger"> (cancelled)</span>}
              </p>
            ) : (
              <p className="mt-2 text-muted">Not scheduled yet. Saving a time confirms the session and emails the visitor.</p>
            )}
            <ScheduleForm
              id={r.id}
              defaults={{
                date: scheduledInput?.date ?? "",
                time: scheduledInput?.time ?? "",
                timezone: tz,
                meetingLink: r.meetingLink ?? "",
              }}
              hasSchedule={Boolean(r.scheduledAt)}
            />
            {r.scheduledAt && (
              <p className="mt-4 text-sm text-muted">
                Reminders — 24 hours: {r.reminder24SentAt ? `handled ${stampFmt.format(r.reminder24SentAt)} UTC` : "pending"} · 1 hour:{" "}
                {r.reminder1SentAt ? `handled ${stampFmt.format(r.reminder1SentAt)} UTC` : "pending"}
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="req-status" className="rounded-[8px] border border-line bg-white p-6">
            <h2 id="req-status" className="text-xl">Status</h2>
            <StatusForm id={r.id} status={r.status} />
          </section>
          <section aria-labelledby="req-notes" className="rounded-[8px] border border-line bg-white p-6">
            <h2 id="req-notes" className="text-xl">Private notes</h2>
            <NotesForm id={r.id} notes={r.adminNotes ?? ""} />
          </section>
        </div>
      </div>
    </div>
  );
}
