import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────
const dbMock = vi.hoisted(() => ({
  consultationRequest: { create: vi.fn() },
  contactMessage: { create: vi.fn() },
}));
const rateLimitMock = vi.hoisted(() => vi.fn());
const emailMock = vi.hoisted(() => ({ sendRequestReceived: vi.fn(), sendAdminNotification: vi.fn() }));
const afterCallbacks = vi.hoisted(() => [] as Array<() => unknown>);

vi.mock("@/lib/db", () => ({ db: dbMock }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: rateLimitMock }));
vi.mock("@/lib/email", () => emailMock);
vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: (fn: () => unknown) => afterCallbacks.push(fn) };
});

import { POST as bookPOST } from "@/app/api/book/route";
import { POST as contactPOST } from "@/app/api/contact/route";

// ── Helpers ──────────────────────────────────────────────────────────────────
const validBooking = {
  fullName: "Sarah Mitchell",
  email: "sarah@example.com",
  phone: "",
  companyName: "Mitchell Advisory",
  companySize: "6-20",
  mainChallenge: "lead-response",
  description: "Leads come in overnight and nobody replies until the afternoon.",
  preferredTimes: "",
  referralSource: "LinkedIn",
  consent: true,
  timezone: "America/Chicago",
};

function post(url: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://localhost:3000${url}`, {
    method: "POST",
    headers: { "content-type": "application/json", host: "localhost:3000", "x-forwarded-for": "203.0.113.7", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const human = () => ({ website: "", startedAt: Date.now() - 45_000 });

beforeEach(() => {
  vi.clearAllMocks();
  afterCallbacks.length = 0;
  rateLimitMock.mockResolvedValue({ ok: true, remaining: 5, retryAfterSeconds: 3600 });
  dbMock.consultationRequest.create.mockImplementation(async ({ data }) => ({ id: "req_1", ...data }));
  dbMock.contactMessage.create.mockResolvedValue({ id: "msg_1" });
  emailMock.sendRequestReceived.mockResolvedValue(undefined);
  emailMock.sendAdminNotification.mockResolvedValue(undefined);
});

// ── /api/book ────────────────────────────────────────────────────────────────
describe("POST /api/book", () => {
  it("saves a valid request with mapped enums and schedules both emails", async () => {
    const res = await bookPOST(post("/api/book", { ...validBooking, ...human() }));

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    const { data } = dbMock.consultationRequest.create.mock.calls[0]![0];
    expect(data).toMatchObject({
      fullName: "Sarah Mitchell",
      companySize: "SIZE_6_20",
      mainChallenge: "LEAD_RESPONSE",
      phone: null,
      timezone: "America/Chicago",
    });
    expect(data.consentAt).toBeInstanceOf(Date);
    expect(data).not.toHaveProperty("website");

    // Emails run after the response
    expect(emailMock.sendRequestReceived).not.toHaveBeenCalled();
    await Promise.all(afterCallbacks.map((fn) => fn()));
    expect(emailMock.sendRequestReceived).toHaveBeenCalledTimes(1);
    expect(emailMock.sendAdminNotification).toHaveBeenCalledTimes(1);
  });

  it("still succeeds when an email fails", async () => {
    emailMock.sendRequestReceived.mockRejectedValue(new Error("smtp down"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await bookPOST(post("/api/book", { ...validBooking, ...human() }));
    await Promise.all(afterCallbacks.map((fn) => fn()));
    expect(res.status).toBe(201);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("returns 400 with field errors for invalid input", async () => {
    const res = await bookPOST(post("/api/book", { ...validBooking, email: "nope", consent: false, ...human() }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(Object.keys(body.fieldErrors)).toEqual(expect.arrayContaining(["email", "consent"]));
    expect(dbMock.consultationRequest.create).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    rateLimitMock.mockResolvedValue({ ok: false, remaining: 0, retryAfterSeconds: 1200 });
    const res = await bookPOST(post("/api/book", { ...validBooking, ...human() }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("1200");
    expect(dbMock.consultationRequest.create).not.toHaveBeenCalled();
  });

  it("rate-limits by a hashed IP, never the raw address", async () => {
    await bookPOST(post("/api/book", { ...validBooking, ...human() }));
    const key = rateLimitMock.mock.calls[0]![0] as string;
    expect(key.startsWith("book:")).toBe(true);
    expect(key).not.toContain("203.0.113.7");
  });

  it("silently drops honeypot submissions", async () => {
    const res = await bookPOST(post("/api/book", { ...validBooking, website: "http://spam", startedAt: Date.now() - 45_000 }));
    expect(res.status).toBe(200);
    expect(dbMock.consultationRequest.create).not.toHaveBeenCalled();
  });

  it("silently drops submissions that were filled too fast", async () => {
    const res = await bookPOST(post("/api/book", { ...validBooking, website: "", startedAt: Date.now() - 500 }));
    expect(res.status).toBe(200);
    expect(dbMock.consultationRequest.create).not.toHaveBeenCalled();
  });

  it("rejects cross-origin posts", async () => {
    const res = await bookPOST(post("/api/book", { ...validBooking, ...human() }, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });

  it("rejects malformed JSON and oversized bodies", async () => {
    expect((await bookPOST(post("/api/book", "{not json"))).status).toBe(400);
    const huge = { ...validBooking, ...human(), description: "x".repeat(25_000) };
    expect((await bookPOST(post("/api/book", huge))).status).toBe(413);
  });

  it("returns 500 with a friendly message when the database fails", async () => {
    dbMock.consultationRequest.create.mockRejectedValue(new Error("db down"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await bookPOST(post("/api/book", { ...validBooking, ...human() }));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/wasn’t saved/);
    errorSpy.mockRestore();
  });
});

// ── /api/contact ─────────────────────────────────────────────────────────────
describe("POST /api/contact", () => {
  it("saves a valid message", async () => {
    const res = await contactPOST(post("/api/contact", { name: "Sam", email: "sam@example.com", message: "Quick question", ...human() }));
    expect(res.status).toBe(201);
    expect(dbMock.contactMessage.create).toHaveBeenCalledWith({
      data: { name: "Sam", email: "sam@example.com", message: "Quick question" },
    });
  });

  it("returns 400 for missing fields", async () => {
    const res = await contactPOST(post("/api/contact", { name: "", email: "", message: "", ...human() }));
    expect(res.status).toBe(400);
    expect(Object.keys((await res.json()).fieldErrors).sort()).toEqual(["email", "message", "name"]);
  });

  it("returns 429 when rate limited", async () => {
    rateLimitMock.mockResolvedValue({ ok: false, remaining: 0, retryAfterSeconds: 60 });
    const res = await contactPOST(post("/api/contact", { name: "Sam", email: "sam@example.com", message: "Hi", ...human() }));
    expect(res.status).toBe(429);
  });
});
