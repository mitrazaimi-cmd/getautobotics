import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendReminder } from "@/lib/email";
import { HOUR, processReminders, type ReminderStore } from "@/lib/reminders";
import { purgeExpiredRateLimits } from "@/lib/rate-limit";
import type { ConsultationRequest } from "@/lib/generated/prisma/client";

// Call every 15 minutes: Vercel Cron (vercel.json) or any external scheduler
// with header `Authorization: Bearer <CRON_SECRET>`. Safe to call repeatedly.

export const maxDuration = 60;

function authorized(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${env.cronSecret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const store: ReminderStore = {
  findDue: (now) =>
    db.consultationRequest.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { gt: now, lte: new Date(now.getTime() + 24 * HOUR) },
        OR: [{ reminder24SentAt: null }, { reminder1SentAt: null }],
      },
      orderBy: { scheduledAt: "asc" },
      take: 200,
    }),
  updateWhere: async (where, data) => {
    const { count } = await db.consultationRequest.updateMany({ where, data });
    return count;
  },
};

export async function GET(request: Request) {
  let ok: boolean;
  try {
    ok = authorized(request);
  } catch (error) {
    console.error("[cron] CRON_SECRET is not configured", error);
    return NextResponse.json({ error: "Cron is not configured." }, { status: 500 });
  }
  if (!ok) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const result = await processReminders<ConsultationRequest>(store, (r, kind) => sendReminder(r, kind));
  const purged = await purgeExpiredRateLimits().catch(() => 0);

  if (result.failed.length) console.error("[cron] reminder failures", result.failed);
  return NextResponse.json({ ...result, purgedRateLimits: purged }, { headers: { "Cache-Control": "no-store" } });
}
