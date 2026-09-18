import "server-only";
import { createHash } from "node:crypto";
import { env } from "@/lib/env";

/** Best-effort client IP (Vercel and most proxies set x-forwarded-for). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** One-way hash so raw IP addresses are never stored. */
export function hashIp(ip: string): string {
  return createHash("sha256").update(`${env.rateLimitSalt}:${ip}`).digest("hex").slice(0, 32);
}

/** Reject cross-site JSON posts (defense in depth alongside SameSite cookies). */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin fetches from some browsers omit Origin on POST
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function readJson(request: Request, maxBytes = 20_000): Promise<unknown> {
  const text = await request.text();
  if (text.length > maxBytes) throw new PayloadTooLargeError();
  return JSON.parse(text);
}

export class PayloadTooLargeError extends Error {}
