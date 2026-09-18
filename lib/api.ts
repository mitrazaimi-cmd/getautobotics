import "server-only";
import { NextResponse } from "next/server";
import { clientIp, hashIp, isSameOrigin, PayloadTooLargeError, readJson } from "@/lib/request";
import { rateLimit } from "@/lib/rate-limit";
import { isLikelySpam } from "@/lib/validation";

export const json = (body: unknown, init?: number | ResponseInit) =>
  NextResponse.json(body, typeof init === "number" ? { status: init } : init);

type Guarded =
  | { ok: true; body: Record<string, unknown>; spam: boolean }
  | { ok: false; response: NextResponse };

/**
 * Shared checks for public form endpoints:
 * same-origin, JSON size limit, per-IP rate limit, honeypot + fill-time.
 */
export async function guardPublicForm(
  request: Request,
  { bucket, limit, windowMs }: { bucket: string; limit: number; windowMs: number },
): Promise<Guarded> {
  if (!isSameOrigin(request)) {
    return { ok: false, response: json({ error: "This request isn’t allowed." }, 403) };
  }

  let body: unknown;
  try {
    body = await readJson(request);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return { ok: false, response: json({ error: "That’s more text than we can accept. Please shorten it." }, 413) };
    }
    return { ok: false, response: json({ error: "We couldn’t read that submission. Please try again." }, 400) };
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, response: json({ error: "We couldn’t read that submission. Please try again." }, 400) };
  }

  const limited = await rateLimit(`${bucket}:${hashIp(clientIp(request.headers))}`, limit, windowMs);
  if (!limited.ok) {
    return {
      ok: false,
      response: json(
        { error: "You’ve sent several requests in a short time. Please wait a little while and try again." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
      ),
    };
  }

  return { ok: true, body: body as Record<string, unknown>, spam: isLikelySpam(body) };
}
