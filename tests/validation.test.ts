import { describe, expect, it } from "vitest";
import {
  bookingSchema,
  contactSchema,
  fieldErrorsFrom,
  isLikelySpam,
  MIN_FILL_MS,
  type BookingField,
} from "@/lib/validation";

const validBooking = {
  fullName: "Sarah Mitchell",
  email: "sarah@example.com",
  phone: "",
  companyName: "Mitchell Advisory",
  companySize: "6-20",
  mainChallenge: "email-follow-up",
  description: "We spend hours every week following up with new inquiries by hand.",
  preferredTimes: "Tue/Thu mornings, Eastern",
  referralSource: "",
  consent: true,
  timezone: "America/New_York",
};

function errorsFor(input: unknown) {
  const result = bookingSchema.safeParse(input);
  if (result.success) return {};
  return fieldErrorsFrom<BookingField>(result.error);
}

describe("bookingSchema", () => {
  it("accepts a valid request and normalizes optional blanks", () => {
    const result = bookingSchema.safeParse(validBooking);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.phone).toBeUndefined();
    expect(result.data.referralSource).toBeUndefined();
    expect(result.data.timezone).toBe("America/New_York");
  });

  it.each(["fullName", "email", "companyName", "description"] as const)("requires %s", (field) => {
    const errors = errorsFor({ ...validBooking, [field]: "   " });
    expect(errors[field]).toBeTruthy();
  });

  it("requires company size and challenge from the allowed options", () => {
    const errors = errorsFor({ ...validBooking, companySize: "huge", mainChallenge: undefined });
    expect(errors.companySize).toBe("Choose your company size.");
    expect(errors.mainChallenge).toBe("Choose the challenge that fits best.");
  });

  it("rejects malformed email addresses", () => {
    expect(errorsFor({ ...validBooking, email: "sarah@" }).email).toMatch(/format/);
    expect(errorsFor({ ...validBooking, email: "not an email" }).email).toBeTruthy();
  });

  it("trims whitespace around email", () => {
    const result = bookingSchema.safeParse({ ...validBooking, email: "  sarah@example.com  " });
    expect(result.success && result.data.email).toBe("sarah@example.com");
  });

  it("requires consent to be exactly true", () => {
    expect(errorsFor({ ...validBooking, consent: false }).consent).toBeTruthy();
    expect(errorsFor({ ...validBooking, consent: "on" }).consent).toBeTruthy();
  });

  it("validates optional phone format only when provided", () => {
    expect(errorsFor({ ...validBooking, phone: "+1 (555) 010-2030" }).phone).toBeUndefined();
    expect(errorsFor({ ...validBooking, phone: "call me maybe" }).phone).toBeTruthy();
  });

  it("enforces length limits", () => {
    expect(errorsFor({ ...validBooking, description: "x".repeat(3001) }).description).toBeTruthy();
    expect(errorsFor({ ...validBooking, description: "too short" }).description).toMatch(/more detail/);
    expect(errorsFor({ ...validBooking, fullName: "x".repeat(101) }).fullName).toBeTruthy();
  });

  it("drops an invalid time zone instead of rejecting the request", () => {
    const result = bookingSchema.safeParse({ ...validBooking, timezone: "Mars/Olympus" });
    expect(result.success).toBe(true);
    expect(result.success && result.data.timezone).toBeUndefined();
  });

  it("strips control characters", () => {
    const result = bookingSchema.safeParse({ ...validBooking, companyName: "Acme\u0000 Inc\u0007" });
    expect(result.success && result.data.companyName).toBe("Acme Inc");
  });
});

describe("contactSchema", () => {
  it("accepts a valid message", () => {
    expect(contactSchema.safeParse({ name: "Sam", email: "sam@example.com", message: "Hello there" }).success).toBe(true);
  });

  it("requires every field", () => {
    const result = contactSchema.safeParse({ name: "", email: "", message: "" });
    expect(result.success).toBe(false);
    if (result.success) return;
    const errors = fieldErrorsFrom(result.error);
    expect(Object.keys(errors).sort()).toEqual(["email", "message", "name"]);
  });
});

describe("isLikelySpam", () => {
  const now = 1_700_000_000_000;

  it("passes a normal human submission", () => {
    expect(isLikelySpam({ website: "", startedAt: now - 20_000 }, now)).toBe(false);
  });

  it("flags a filled honeypot", () => {
    expect(isLikelySpam({ website: "https://spam.example", startedAt: now - 20_000 }, now)).toBe(true);
  });

  it("flags submissions faster than the minimum fill time", () => {
    expect(isLikelySpam({ website: "", startedAt: now - (MIN_FILL_MS - 1) }, now)).toBe(true);
  });

  it("flags a missing or stale start time", () => {
    expect(isLikelySpam({ website: "" }, now)).toBe(true);
    expect(isLikelySpam({ website: "", startedAt: now - 1000 * 60 * 60 * 25 }, now)).toBe(true);
  });
});
