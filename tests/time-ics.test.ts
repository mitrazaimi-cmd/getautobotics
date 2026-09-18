import { describe, expect, it } from "vitest";
import {
  formatDateTimeInZone,
  InvalidLocalTimeError,
  utcToZonedInput,
  zonedTimeToUtc,
} from "@/lib/time";
import { buildIcs, escapeIcsText, foldLine, toIcsDate } from "@/lib/ics";

describe("zonedTimeToUtc", () => {
  it("converts Eastern daylight time", () => {
    // July: EDT = UTC-4
    expect(zonedTimeToUtc("2026-07-15", "14:30", "America/New_York").toISOString()).toBe("2026-07-15T18:30:00.000Z");
  });

  it("converts Eastern standard time", () => {
    // January: EST = UTC-5
    expect(zonedTimeToUtc("2026-01-15", "09:00", "America/New_York").toISOString()).toBe("2026-01-15T14:00:00.000Z");
  });

  it("converts Pacific time across the DST change", () => {
    // DST starts 2026-03-08 in the U.S.
    expect(zonedTimeToUtc("2026-03-07", "10:00", "America/Los_Angeles").toISOString()).toBe("2026-03-07T18:00:00.000Z");
    expect(zonedTimeToUtc("2026-03-09", "10:00", "America/Los_Angeles").toISOString()).toBe("2026-03-09T17:00:00.000Z");
  });

  it("handles zones without DST", () => {
    expect(zonedTimeToUtc("2026-07-01", "08:00", "America/Phoenix").toISOString()).toBe("2026-07-01T15:00:00.000Z");
  });

  it("rejects a wall-clock time skipped by daylight saving", () => {
    expect(() => zonedTimeToUtc("2026-03-08", "02:30", "America/New_York")).toThrow(InvalidLocalTimeError);
  });

  it("rejects malformed input", () => {
    expect(() => zonedTimeToUtc("03/10/2026", "2pm", "America/New_York")).toThrow(InvalidLocalTimeError);
  });

  it("round-trips through utcToZonedInput", () => {
    const utc = zonedTimeToUtc("2026-11-02", "16:45", "America/Chicago");
    expect(utcToZonedInput(utc, "America/Chicago")).toEqual({ date: "2026-11-02", time: "16:45" });
  });
});

describe("formatDateTimeInZone", () => {
  const instant = new Date("2026-07-15T18:30:00Z");

  it("renders the visitor's local time in New York", () => {
    expect(formatDateTimeInZone(instant, "America/New_York")).toBe("Wednesday, July 15, 2026 at 2:30 PM EDT");
  });

  it("renders the same instant in Los Angeles", () => {
    expect(formatDateTimeInZone(instant, "America/Los_Angeles")).toBe("Wednesday, July 15, 2026 at 11:30 AM PDT");
  });

  it("can change the calendar date for far-apart zones", () => {
    const late = new Date("2026-07-16T03:30:00Z");
    expect(formatDateTimeInZone(late, "America/Los_Angeles")).toMatch(/^Wednesday, July 15, 2026 at 8:30 PM/);
  });
});

describe("buildIcs", () => {
  const base = {
    uid: "req_123@getautobotics.com",
    sequence: 0,
    method: "REQUEST" as const,
    start: new Date("2026-07-15T18:30:00Z"),
    durationMinutes: 30,
    summary: "Automation consultation — Auto Botics",
    description: "Agenda: goals, workflows; next steps",
    location: "https://meet.example.com/abc",
    url: "https://meet.example.com/abc",
    organizer: { name: "Auto Botics", email: "hello@getautobotics.com" },
    attendee: { name: "Sarah, Mitchell", email: "sarah@example.com" },
    now: new Date("2026-07-01T12:00:00Z"),
  };

  it("produces a valid VEVENT with UTC times and CRLF line endings", () => {
    const ics = buildIcs(base);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("METHOD:REQUEST");
    expect(ics).toContain("UID:req_123@getautobotics.com");
    expect(ics).toContain("DTSTART:20260715T183000Z");
    expect(ics).toContain("DTEND:20260715T190000Z");
    expect(ics).toContain("STATUS:CONFIRMED");
    expect(ics).toContain("DESCRIPTION:Agenda: goals\\, workflows\\; next steps");
    expect(ics.split("\r\n").every((line) => Buffer.byteLength(line) <= 75)).toBe(true);
  });

  it("keeps the same UID and bumps SEQUENCE for cancellations", () => {
    const ics = buildIcs({ ...base, method: "CANCEL", sequence: 2 });
    expect(ics).toContain("UID:req_123@getautobotics.com");
    expect(ics).toContain("SEQUENCE:2");
    expect(ics).toContain("STATUS:CANCELLED");
    expect(ics).not.toContain("BEGIN:VALARM");
  });

  it("sanitizes names used in parameters", () => {
    const ics = buildIcs({ ...base, attendee: { name: 'Eve"\r\nX-EVIL:1', email: "eve@example.com" } });
    expect(ics).not.toContain("\r\nX-EVIL");
  });

  it("helpers format and escape correctly", () => {
    expect(toIcsDate(new Date("2026-01-02T03:04:05.678Z"))).toBe("20260102T030405Z");
    expect(escapeIcsText("a\\b\nc")).toBe("a\\\\b\\nc");
    const folded = foldLine("X".repeat(160));
    expect(folded.split("\r\n ").map((l) => l.length)).toEqual([75, 74, 11]);
  });
});
