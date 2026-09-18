import "server-only";
import type { ReactElement } from "react";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { env } from "@/lib/env";
import { buildIcs } from "@/lib/ics";
import { formatDateInZone, formatDateTimeInZone, formatTimeInZone, DEFAULT_TIMEZONE, timezoneLabel } from "@/lib/time";
import { challengeLabel, companySizeLabel } from "@/lib/validation";
import { booking, site } from "@/content/site";
import type { ConsultationRequest } from "@/lib/generated/prisma/client";
import {
  AdminNewRequestEmail,
  CancellationEmail,
  ConsultationConfirmedEmail,
  ReminderEmail,
  RequestReceivedEmail,
} from "@/emails/templates";

type Attachment = { filename: string; content: string; contentType: string };

type SendArgs = {
  to: string;
  subject: string;
  email: ReactElement;
  attachments?: Attachment[];
  replyTo?: string;
};

let resendClient: Resend | null = null;

/** Sends one email. Without RESEND_API_KEY, logs it instead (local development). */
export async function sendEmail({ to, subject, email, attachments, replyTo }: SendArgs): Promise<void> {
  const [html, textBody] = await Promise.all([render(email), render(email, { plainText: true })]);
  const apiKey = env.resendApiKey;

  if (!apiKey) {
    console.info(
      `\n📧 [email:dev] (RESEND_API_KEY not set — not sent)\nTo: ${to}\nSubject: ${subject}\n` +
        (attachments?.length ? `Attachments: ${attachments.map((a) => a.filename).join(", ")}\n` : "") +
        `${textBody.slice(0, 1200)}\n`,
    );
    return;
  }

  resendClient ??= new Resend(apiKey);
  const { error } = await resendClient.emails.send({
    from: env.emailFrom,
    to,
    subject,
    html,
    text: textBody,
    replyTo: replyTo ?? env.emailReplyTo,
    attachments: attachments?.map((a) => ({
      filename: a.filename,
      content: Buffer.from(a.content, "utf8"),
      contentType: a.contentType,
    })),
  });
  if (error) throw new Error(`Email to ${to} failed: ${error.message}`);
}

// ── Helpers ───────────────────────────────────────────────────────────────

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}

function sessionDetails(request: ConsultationRequest) {
  const tz = request.timezone ?? DEFAULT_TIMEZONE;
  const at = request.scheduledAt!;
  return {
    firstName: firstName(request.fullName),
    dateLabel: formatDateInZone(at, tz),
    timeLabel: formatTimeInZone(at, tz),
    timezoneLabel: timezoneLabel(tz),
    durationMinutes: booking.durationMinutes,
    meetingLink: request.meetingLink,
  };
}

function organizerEmail(): string {
  const from = env.emailReplyTo ?? env.emailFrom;
  const match = /<([^>]+)>/.exec(from);
  return (match ? match[1] : from)!.trim();
}

function invite(request: ConsultationRequest, method: "REQUEST" | "CANCEL"): Attachment {
  const ics = buildIcs({
    uid: `consultation-${request.id}@${new URL(site.url).hostname}`,
    sequence: request.icsSequence,
    method,
    start: request.scheduledAt!,
    durationMinutes: booking.durationMinutes,
    summary: booking.meetingTitle,
    description:
      "A conversation about your business, where time goes, and your highest-value automation opportunities." +
      (request.meetingLink ? `\n\nHow to join: ${request.meetingLink}` : ""),
    location: request.meetingLink,
    url: request.meetingLink && /^https?:\/\//.test(request.meetingLink) ? request.meetingLink : null,
    organizer: { name: site.name, email: organizerEmail() },
    attendee: { name: request.fullName, email: request.email },
  });
  return {
    filename: method === "CANCEL" ? "consultation-cancelled.ics" : "consultation.ics",
    content: ics,
    contentType: `text/calendar; charset=utf-8; method=${method}`,
  };
}

// ── Email flow (spec §6) ───────────────────────────────────────────────────

export async function sendRequestReceived(request: ConsultationRequest) {
  await sendEmail({
    to: request.email,
    subject: "We received your consultation request",
    email: <RequestReceivedEmail firstName={firstName(request.fullName)} />,
  });
}

export async function sendAdminNotification(request: ConsultationRequest) {
  const to = env.adminNotifyEmail;
  if (!to) return;
  await sendEmail({
    to,
    subject: `New consultation request: ${request.companyName}`,
    replyTo: request.email,
    email: (
      <AdminNewRequestEmail
        adminUrl={`${site.url}/admin/requests/${request.id}`}
        request={{
          ...request,
          companySize: companySizeLabel(request.companySize),
          mainChallenge: challengeLabel(request.mainChallenge),
        }}
      />
    ),
  });
}

export async function sendConfirmation(request: ConsultationRequest, { isReschedule }: { isReschedule: boolean }) {
  const details = sessionDetails(request);
  await sendEmail({
    to: request.email,
    subject: isReschedule
      ? `Updated: your consultation is now ${details.dateLabel}`
      : `Your consultation is confirmed — ${details.dateLabel}`,
    email: <ConsultationConfirmedEmail {...details} isReschedule={isReschedule} />,
    attachments: [invite(request, "REQUEST")],
  });
}

export async function sendReminder(request: ConsultationRequest, kind: "24h" | "1h") {
  const details = sessionDetails(request);
  await sendEmail({
    to: request.email,
    subject:
      kind === "1h"
        ? `Starting soon: your consultation at ${details.timeLabel}`
        : `Reminder: your consultation on ${details.dateLabel}`,
    email: <ReminderEmail kind={kind} {...details} />,
  });
}

export async function sendCancellation(request: ConsultationRequest) {
  const tz = request.timezone ?? DEFAULT_TIMEZONE;
  const hadSession = Boolean(request.scheduledAt);
  await sendEmail({
    to: request.email,
    subject: "Your consultation has been cancelled",
    email: (
      <CancellationEmail
        firstName={firstName(request.fullName)}
        sessionLabel={hadSession ? formatDateTimeInZone(request.scheduledAt!, tz) : null}
        bookUrl={`${site.url}/book`}
      />
    ),
    attachments: hadSession ? [invite(request, "CANCEL")] : undefined,
  });
}
