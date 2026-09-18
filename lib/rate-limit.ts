import "server-only";
import { db } from "@/lib/db";

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSeconds: number };

/**
 * Fixed-window rate limiter stored in Postgres.
 * A single atomic upsert increments the counter (or starts a new window),
 * so concurrent requests on different serverless instances count correctly.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMs);

  const rows = await db.$queryRaw<Array<{ count: number; windowEnd: Date }>>`
    INSERT INTO "RateLimit" ("key", "count", "windowEnd")
    VALUES (${key}, 1, ${windowEnd})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."windowEnd" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "windowEnd" = CASE WHEN "RateLimit"."windowEnd" <= ${now} THEN ${windowEnd} ELSE "RateLimit"."windowEnd" END
    RETURNING "count", "windowEnd"
  `;

  const row = rows[0]!;
  const count = Number(row.count);
  return {
    ok: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(1, Math.ceil((new Date(row.windowEnd).getTime() - now.getTime()) / 1000)),
  };
}

/** Removes expired counters. Called from the reminders cron job. */
export async function purgeExpiredRateLimits(): Promise<number> {
  const { count } = await db.rateLimit.deleteMany({ where: { windowEnd: { lt: new Date() } } });
  return count;
}
