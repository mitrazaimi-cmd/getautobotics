import { Link, Section, Text } from "react-email";
import { Callout, DetailRow, EmailLayout, PrimaryButton, emailColors, text } from "@/emails/EmailLayout";
import { site } from "@/content/site";

const visitorFooter = `You’re receiving this because you requested a consultation at ${site.domain}.`;

// 1) Visitor: request received ─────────────────────────────────────────────

export function RequestReceivedEmail({ firstName }: { firstName: string }) {
  return (
    <EmailLayout preview="Thanks — we received your request. Here’s what happens next." footerNote={visitorFooter}>
      <Text style={text.h1}>We received your request</Text>
      <Text style={text.p}>Hi {firstName},</Text>
      <Text style={text.p}>
        Thanks for reaching out. We’ll read your request personally and get back to you by email to agree on a time for
        your consultation.
      </Text>
      <Text style={{ ...text.p, fontWeight: 700, margin: "24px 0 8px" }}>What happens next</Text>
      <Text style={text.p}>
        1. We review what you shared about your business.
        <br />
        2. We email you to confirm a time that works in your time zone.
        <br />
        3. We talk through where time goes and find your highest-value automation opportunities.
      </Text>
      <Callout>
        <Text style={{ ...text.p, margin: 0 }}>
          <strong>One useful thing to do:</strong> reply to this email with the two or three tasks that take the most
          time each week. It helps us make the conversation more useful.
        </Text>
      </Callout>
    </EmailLayout>
  );
}

// 2) Admin: new request ───────────────────────────────────────────────────

export type AdminRequestSummary = {
  fullName: string;
  email: string;
  phone?: string | null;
  companyName: string;
  companySize: string;
  mainChallenge: string;
  description: string;
  preferredTimes?: string | null;
  referralSource?: string | null;
  timezone?: string | null;
};

export function AdminNewRequestEmail({ request, adminUrl }: { request: AdminRequestSummary; adminUrl: string }) {
  return (
    <EmailLayout preview={`New consultation request from ${request.companyName}`} showSignature={false}>
      <Text style={text.h1}>New consultation request</Text>
      <DetailRow label="Name" value={request.fullName} />
      <DetailRow
        label="Email"
        value={
          <Link href={`mailto:${request.email}`} style={{ color: emailColors.navy }}>
            {request.email}
          </Link>
        }
      />
      {request.phone && <DetailRow label="Phone" value={request.phone} />}
      <DetailRow label="Company" value={`${request.companyName} (${request.companySize})`} />
      <DetailRow label="Main challenge" value={request.mainChallenge} />
      {request.preferredTimes && <DetailRow label="Preferred times" value={request.preferredTimes} />}
      {request.timezone && <DetailRow label="Detected time zone" value={request.timezone} />}
      {request.referralSource && <DetailRow label="Heard about us" value={request.referralSource} />}
      <Section style={{ margin: "16px 0 24px" }}>
        <Text style={{ ...text.muted, margin: "0 0 4px" }}>What they need</Text>
        <Callout>
          <Text style={{ ...text.p, margin: 0, whiteSpace: "pre-wrap" }}>{request.description}</Text>
        </Callout>
      </Section>
      <PrimaryButton href={adminUrl}>Open the request</PrimaryButton>
    </EmailLayout>
  );
}

// 3) Visitor: consultation confirmed ───────────────────────────────────────

type SessionProps = {
  firstName: string;
  dateLabel: string;
  timeLabel: string;
  timezoneLabel: string;
  durationMinutes: number;
  meetingLink?: string | null;
};

export function ConsultationConfirmedEmail({
  firstName,
  dateLabel,
  timeLabel,
  timezoneLabel,
  durationMinutes,
  meetingLink,
  isReschedule,
}: SessionProps & { isReschedule?: boolean }) {
  return (
    <EmailLayout
      preview={`${isReschedule ? "Updated time: " : ""}${dateLabel} at ${timeLabel}`}
      footerNote={visitorFooter}
    >
      <Text style={text.h1}>{isReschedule ? "Your consultation has a new time" : "Your consultation is confirmed"}</Text>
      <Text style={text.p}>Hi {firstName},</Text>
      <Text style={text.p}>
        {isReschedule
          ? "Here are the updated details for your automation consultation."
          : "Great news — your automation consultation is booked. Here are the details."}
      </Text>
      <Callout>
        <DetailRow label="Date" value={dateLabel} />
        <DetailRow label="Time" value={`${timeLabel}, ${timezoneLabel}`} />
        <DetailRow label="Length" value={`${durationMinutes} minutes`} />
        {meetingLink && <DetailRow label="How to join" value={meetingLink} />}
      </Callout>
      <Text style={{ ...text.p, fontWeight: 700 }}>
        Next step: open the attached calendar invite to add the consultation to your calendar
        {isReschedule ? " — it replaces the previous time" : ""}.
      </Text>
      <Text style={text.muted}>Need a different time? Just reply to this email.</Text>
    </EmailLayout>
  );
}

// 4) Visitor: reminders ─────────────────────────────────────────────────────

export function ReminderEmail({ kind, ...session }: SessionProps & { kind: "24h" | "1h" }) {
  const soon = kind === "1h";
  const hasLink = session.meetingLink && /^https?:\/\//.test(session.meetingLink);
  return (
    <EmailLayout
      preview={soon ? `Starting soon — ${session.timeLabel}` : `Coming up: ${session.dateLabel} at ${session.timeLabel}`}
      footerNote={visitorFooter}
    >
      <Text style={text.h1}>{soon ? "Your consultation starts soon" : "A reminder about your consultation"}</Text>
      <Text style={text.p}>Hi {session.firstName},</Text>
      <Text style={text.p}>
        {soon
          ? "Your automation consultation starts within the hour."
          : "Your automation consultation is coming up. Here are the details."}
      </Text>
      <Callout>
        <DetailRow label="Date" value={session.dateLabel} />
        <DetailRow label="Time" value={`${session.timeLabel}, ${session.timezoneLabel}`} />
        {session.meetingLink && <DetailRow label="How to join" value={session.meetingLink} />}
      </Callout>
      {hasLink && <PrimaryButton href={session.meetingLink!}>{soon ? "Join the call" : "Open the meeting link"}</PrimaryButton>}
      {!soon && (
        <Text style={text.p}>
          To make the most of our time, think about the two or three tasks that take the most time each week.
        </Text>
      )}
      <Text style={text.muted}>Can’t make it? Reply to this email and we’ll find another time.</Text>
    </EmailLayout>
  );
}

// 5) Visitor: cancellation ───────────────────────────────────────────────────

export function CancellationEmail({
  firstName,
  sessionLabel,
  bookUrl,
}: {
  firstName: string;
  sessionLabel?: string | null;
  bookUrl: string;
}) {
  return (
    <EmailLayout preview="Your consultation has been cancelled" footerNote={visitorFooter}>
      <Text style={text.h1}>Your consultation has been cancelled</Text>
      <Text style={text.p}>Hi {firstName},</Text>
      <Text style={text.p}>
        {sessionLabel
          ? `We’ve cancelled your automation consultation that was planned for ${sessionLabel}. The attached calendar update removes it from your calendar.`
          : "We’ve cancelled your consultation request."}
      </Text>
      <Text style={text.p}>
        Thank you for your interest in Auto Botics. Whenever the timing is right, we’d be glad to help you find the
        repetitive work worth automating.
      </Text>
      <PrimaryButton href={bookUrl}>Book a new time</PrimaryButton>
    </EmailLayout>
  );
}
