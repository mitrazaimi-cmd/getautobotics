// Shared Zod schemas — the single source of validation truth for client and server.
// Error copy follows the brand voice: plain, specific, friendly.
// Uses `zod/mini` (tree-shakable) because these schemas ship in the browser bundle.

import * as z from "zod/mini";

// ── Option lists (labels shown to visitors, values sent to the API) ─────────

export const companySizeOptions = [
  { value: "1-5", label: "1–5 people", db: "SIZE_1_5" },
  { value: "6-20", label: "6–20 people", db: "SIZE_6_20" },
  { value: "21-50", label: "21–50 people", db: "SIZE_21_50" },
  { value: "51+", label: "51+ people", db: "SIZE_51_PLUS" },
] as const;

export const challengeOptions = [
  { value: "email-follow-up", label: "Email & follow-up", db: "EMAIL_FOLLOWUP" },
  { value: "lead-response", label: "Lead response", db: "LEAD_RESPONSE" },
  { value: "scheduling", label: "Scheduling", db: "SCHEDULING" },
  { value: "customer-support", label: "Customer support", db: "CUSTOMER_SUPPORT" },
  { value: "workflows", label: "Workflows", db: "WORKFLOWS" },
  { value: "other", label: "Something else", db: "OTHER" },
] as const;

export type CompanySizeValue = (typeof companySizeOptions)[number]["value"];
export type ChallengeValue = (typeof challengeOptions)[number]["value"];

const companySizeValues = companySizeOptions.map((o) => o.value) as [CompanySizeValue, ...CompanySizeValue[]];
const challengeValues = challengeOptions.map((o) => o.value) as [ChallengeValue, ...ChallengeValue[]];

export const LIMITS = {
  name: 100,
  email: 254,
  phone: 25,
  company: 150,
  description: 3000,
  preferredTimes: 300,
  referral: 200,
  message: 3000,
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────

/** Removes control characters (keeps newlines and tabs) — defense against odd input in emails/CSV. */
export function stripControlChars(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

const text = () => z.pipe(z.string(), z.transform(stripControlChars));

const requiredText = (max: number, emptyError: string, tooLongError: string, minLength = 1, tooShortError = emptyError) =>
  z.pipe(
    text(),
    z.string().check(
      z.trim(),
      z.minLength(1, { error: emptyError }),
      z.minLength(minLength, { error: tooShortError }),
      z.maxLength(max, { error: tooLongError }),
    ),
  );

const optionalText = (max: number, tooLongError: string) =>
  z.pipe(
    z.optional(z.pipe(text(), z.string().check(z.trim(), z.maxLength(max, { error: tooLongError })))),
    z.transform((v) => (v ? v : undefined)),
  );

const emailField = z.pipe(
  text(),
  z.pipe(
    z.string().check(
      z.trim(),
      z.minLength(1, { error: "Enter your email address so we can reply." }),
      z.maxLength(LIMITS.email, { error: "That email address looks too long. Please check it." }),
    ),
    z.email({ error: "Enter an email address in the format name@company.com." }),
  ),
);

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// ── Booking request ───────────────────────────────────────────────────────

export const bookingSchema = z.object({
  fullName: requiredText(LIMITS.name, "Enter your full name.", "Please shorten your name to 100 characters."),
  email: emailField,
  phone: optionalText(LIMITS.phone, "Please shorten the phone number.").check(
    z.refine((v) => v === undefined || /^[+()\d\s.\-]{7,25}$/.test(v), {
      error: "Enter a phone number using digits, spaces, or + ( ) -.",
    }),
  ),
  companyName: requiredText(LIMITS.company, "Enter your company name.", "Please shorten the company name."),
  companySize: z.enum(companySizeValues, { error: "Choose your company size." }),
  mainChallenge: z.enum(challengeValues, { error: "Choose the challenge that fits best." }),
  description: requiredText(
    LIMITS.description,
    "Tell us a little about what you’d like help with.",
    "Please keep your description under 3,000 characters.",
    10,
    "Add a bit more detail (at least 10 characters) so we can prepare.",
  ),
  preferredTimes: optionalText(LIMITS.preferredTimes, "Please keep this under 300 characters."),
  referralSource: optionalText(LIMITS.referral, "Please keep this under 200 characters."),
  consent: z.literal(true, { error: "Please confirm we can store your details and email you about your request." }),
  /** Auto-detected browser time zone (hidden field). Invalid values are dropped, not rejected. */
  timezone: z.catch(
    z.pipe(
      z.optional(z.string().check(z.maxLength(64))),
      z.transform((v) => (v && isValidTimeZone(v) ? v : undefined)),
    ),
    undefined,
  ),
});

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingData = z.output<typeof bookingSchema>;
export type BookingField = keyof BookingInput;

// ── Contact message ───────────────────────────────────────────────────────

export const contactSchema = z.object({
  name: requiredText(LIMITS.name, "Enter your name.", "Please shorten your name to 100 characters."),
  email: emailField,
  message: requiredText(
    LIMITS.message,
    "Write a short message so we know how to help.",
    "Please keep your message under 3,000 characters.",
  ),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;
export type ContactField = keyof ContactInput;

// ── Anti-spam fields (checked separately; never shown as field errors) ──────

export const HONEYPOT_FIELD = "website";
/** Humans take longer than this to fill a form. */
export const MIN_FILL_MS = 3000;

export const antiSpamSchema = z.object({
  [HONEYPOT_FIELD]: z.optional(z.string()),
  startedAt: z.optional(z.coerce.number()),
});

export function isLikelySpam(input: unknown, now = Date.now()): boolean {
  const parsed = antiSpamSchema.safeParse(input);
  if (!parsed.success) return true;
  const honeypot = parsed.data[HONEYPOT_FIELD];
  if (honeypot && honeypot.trim() !== "") return true;
  const startedAt = parsed.data.startedAt;
  if (!startedAt || !Number.isFinite(startedAt)) return true;
  const elapsed = now - startedAt;
  return elapsed < MIN_FILL_MS || elapsed > 1000 * 60 * 60 * 24; // too fast, or a stale/forged token
}

// ── Utilities ─────────────────────────────────────────────────────────────

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

/** First error message per field. */
export function fieldErrorsFrom<K extends string>(error: z.core.$ZodError): FieldErrors<K> {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  const out: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages?.[0]) out[key] = messages[0];
  }
  return out as FieldErrors<K>;
}

export function companySizeToDb(value: CompanySizeValue) {
  return companySizeOptions.find((o) => o.value === value)!.db;
}

export function challengeToDb(value: ChallengeValue) {
  return challengeOptions.find((o) => o.value === value)!.db;
}

export function companySizeLabel(db: string): string {
  return companySizeOptions.find((o) => o.db === db)?.label ?? db;
}

export function challengeLabel(db: string): string {
  return challengeOptions.find((o) => o.db === db)?.label ?? db;
}
