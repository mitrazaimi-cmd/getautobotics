// Minimal RFC 5545 calendar invite writer (one VEVENT).

export type IcsEvent = {
  uid: string;
  sequence: number;
  method: "REQUEST" | "CANCEL";
  start: Date;
  durationMinutes: number;
  summary: string;
  description: string;
  location?: string | null;
  url?: string | null;
  organizer: { name: string; email: string };
  attendee: { name: string; email: string };
  now?: Date;
};

/** 20260310T143000Z */
export function toIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escapes TEXT values per RFC 5545 §3.3.11. */
export function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Folds lines longer than 75 octets (§3.1). */
export function foldLine(line: string): string {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const chunks: string[] = [];
  let current = "";
  let currentBytes = 0;
  for (const char of line) {
    const size = Buffer.byteLength(char, "utf8");
    const limit = chunks.length === 0 ? 75 : 74; // continuation lines start with a space
    if (currentBytes + size > limit) {
      chunks.push(current);
      current = "";
      currentBytes = 0;
    }
    current += char;
    currentBytes += size;
  }
  chunks.push(current);
  return chunks.join("\r\n ");
}

/** Strips characters that could break a property line (e.g. header injection via names). */
function safeParam(value: string): string {
  return value.replace(/[\r\n";:,]/g, " ").trim();
}

export function buildIcs(event: IcsEvent): string {
  const end = new Date(event.start.getTime() + event.durationMinutes * 60_000);
  const cancelled = event.method === "CANCEL";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Auto Botics//Consultations//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${event.method}`,
    "BEGIN:VEVENT",
    `UID:${safeParam(event.uid)}`,
    `SEQUENCE:${event.sequence}`,
    `DTSTAMP:${toIcsDate(event.now ?? new Date())}`,
    `DTSTART:${toIcsDate(event.start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(event.summary)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    event.location ? `LOCATION:${escapeIcsText(event.location)}` : null,
    event.url ? `URL:${event.url.replace(/[\r\n]/g, "")}` : null,
    `ORGANIZER;CN=${safeParam(event.organizer.name)}:mailto:${safeParam(event.organizer.email)}`,
    `ATTENDEE;CN=${safeParam(event.attendee.name)};ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${safeParam(event.attendee.email)}`,
    `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`,
    "TRANSP:OPAQUE",
    ...(cancelled
      ? []
      : [
          "BEGIN:VALARM",
          "ACTION:DISPLAY",
          "DESCRIPTION:Auto Botics consultation",
          "TRIGGER:-PT15M",
          "END:VALARM",
        ]),
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((l): l is string => l !== null);

  return lines.map(foldLine).join("\r\n") + "\r\n";
}
