// Time zone helpers built on Intl — no date library needed.
// Rule: store UTC, display in the visitor's IANA time zone.

export const DEFAULT_TIMEZONE = "America/New_York";

/** Common U.S. zones first, for admin pickers. */
export const US_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (New York)" },
  { value: "America/Chicago", label: "Central Time (Chicago)" },
  { value: "America/Denver", label: "Mountain Time (Denver)" },
  { value: "America/Phoenix", label: "Mountain Time — no DST (Phoenix)" },
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)" },
  { value: "America/Anchorage", label: "Alaska Time (Anchorage)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (Honolulu)" },
] as const;

type Parts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

function partsInZone(date: Date, timeZone: string): Parts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(formatter.formatToParts(date).find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") };
}

/** Offset of `timeZone` from UTC at the given instant, in milliseconds. */
function offsetMs(date: Date, timeZone: string): number {
  const p = partsInZone(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

export class InvalidLocalTimeError extends Error {}

/**
 * Converts a wall-clock date ("2026-03-10") and time ("14:30") in `timeZone` to a UTC Date.
 * Throws InvalidLocalTimeError for malformed input or a time that doesn't exist
 * (e.g. 2:30 AM on the day clocks spring forward).
 */
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const tm = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dm || !tm) throw new InvalidLocalTimeError("Enter a date (YYYY-MM-DD) and time (HH:MM).");
  const [y, m, d] = [Number(dm[1]), Number(dm[2]), Number(dm[3])];
  const [hh, mm] = [Number(tm[1]), Number(tm[2])];
  if (m < 1 || m > 12 || d < 1 || d > 31 || hh > 23 || mm > 59) {
    throw new InvalidLocalTimeError("That date or time isn’t valid.");
  }

  const wallAsUtc = Date.UTC(y, m - 1, d, hh, mm);
  let utc = wallAsUtc - offsetMs(new Date(wallAsUtc), timeZone);
  const secondOffset = offsetMs(new Date(utc), timeZone);
  utc = wallAsUtc - secondOffset;

  const check = utcToZonedInput(new Date(utc), timeZone);
  if (check.date !== date || check.time !== time) {
    throw new InvalidLocalTimeError("That time doesn’t exist in this time zone (daylight saving change). Pick another time.");
  }
  return new Date(utc);
}

/** UTC Date → { date: "YYYY-MM-DD", time: "HH:MM" } in `timeZone` (for form inputs). */
export function utcToZonedInput(date: Date, timeZone: string): { date: string; time: string } {
  const p = partsInZone(date, timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { date: `${p.year}-${pad(p.month)}-${pad(p.day)}`, time: `${pad(p.hour)}:${pad(p.minute)}` };
}

/** "Tuesday, March 10, 2026" */
export function formatDateInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** "2:30 PM EDT" */
export function formatTimeInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

/** "Tuesday, March 10, 2026 at 2:30 PM EDT" */
export function formatDateTimeInZone(date: Date, timeZone: string): string {
  return `${formatDateInZone(date, timeZone)} at ${formatTimeInZone(date, timeZone)}`;
}

/** Human-friendly zone name, e.g. "Eastern Time (New York)" or the IANA id. */
export function timezoneLabel(timeZone: string): string {
  return US_TIMEZONES.find((z) => z.value === timeZone)?.label ?? timeZone.replace(/_/g, " ");
}
