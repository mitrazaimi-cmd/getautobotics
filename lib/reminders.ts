// Reminder scheduling logic — pure planning + an idempotent processor.
//
// Guarantees:
// - A reminder is "claimed" with a conditional update before sending, so two
//   overlapping cron runs can never send the same reminder twice.
// - If sending fails, the claim is released so the next run retries.
// - Only SCHEDULED sessions in the future are considered (cancelled/completed are skipped).
// - The claim also matches `scheduledAt`, so a reschedule during a run can't send a stale reminder.

export const HOUR = 60 * 60 * 1000;
/** Send the 24-hour reminder when the session is between this and 24h away. */
export const DAY_REMINDER_MIN_LEAD = 3 * HOUR;

export type ReminderKind = "24h" | "1h";

export const reminderField = {
  "24h": "reminder24SentAt",
  "1h": "reminder1SentAt",
} as const;

export type ReminderRecord = {
  id: string;
  status: string;
  scheduledAt: Date | null;
  reminder24SentAt: Date | null;
  reminder1SentAt: Date | null;
};

export type ReminderPlan = { send: ReminderKind | null; skip: ReminderKind[] };

/**
 * Decides what to do for one request at `now`.
 * - ≤ 1h away: send the 1h reminder; a never-sent 24h reminder is skipped (it would arrive too late).
 * - 1h–3h away: too close for a "day before" email, too early for "starting soon" → skip 24h.
 * - 3h–24h away: send the 24h reminder.
 */
export function planReminder(record: ReminderRecord, now: Date): ReminderPlan {
  const plan: ReminderPlan = { send: null, skip: [] };
  if (record.status !== "SCHEDULED" || !record.scheduledAt) return plan;

  const msUntil = record.scheduledAt.getTime() - now.getTime();
  if (msUntil <= 0) return plan;

  if (msUntil <= HOUR) {
    if (!record.reminder1SentAt) plan.send = "1h";
    if (!record.reminder24SentAt) plan.skip.push("24h");
  } else if (msUntil <= DAY_REMINDER_MIN_LEAD) {
    if (!record.reminder24SentAt) plan.skip.push("24h");
  } else if (msUntil <= 24 * HOUR) {
    if (!record.reminder24SentAt) plan.send = "24h";
  }
  return plan;
}

/**
 * Reminder stamps to store when a session is (re)scheduled.
 * Rescheduling clears previous stamps; reminders whose window has already
 * passed are marked as handled so the confirmation email isn't followed by a
 * redundant reminder minutes later.
 */
export function initialReminderStamps(scheduledAt: Date, now: Date) {
  const msUntil = scheduledAt.getTime() - now.getTime();
  return {
    reminder24SentAt: msUntil <= 24 * HOUR ? now : null,
    reminder1SentAt: msUntil <= HOUR ? now : null,
  };
}

// ── Processor ───────────────────────────────────────────────────────────────

type Where = Record<string, unknown>;

/** The subset of the Prisma client the processor needs (easy to fake in tests). */
export type ReminderStore = {
  findDue(now: Date): Promise<Array<ReminderRecord & Record<string, unknown>>>;
  /** Conditional update; must return how many rows matched. */
  updateWhere(where: Where, data: Record<string, Date | null>): Promise<number>;
};

export type ReminderSender<R> = (record: R, kind: ReminderKind) => Promise<void>;

export type ReminderRunResult = {
  checked: number;
  sent: Array<{ id: string; kind: ReminderKind }>;
  skipped: Array<{ id: string; kind: ReminderKind }>;
  failed: Array<{ id: string; kind: ReminderKind; error: string }>;
};

export async function processReminders<R extends ReminderRecord>(
  store: ReminderStore,
  send: ReminderSender<R>,
  now = new Date(),
): Promise<ReminderRunResult> {
  const records = (await store.findDue(now)) as unknown as R[];
  const result: ReminderRunResult = { checked: records.length, sent: [], skipped: [], failed: [] };

  for (const record of records) {
    const plan = planReminder(record, now);

    for (const kind of plan.skip) {
      const field = reminderField[kind];
      const count = await store.updateWhere({ id: record.id, [field]: null }, { [field]: now });
      if (count === 1) result.skipped.push({ id: record.id, kind });
    }

    if (!plan.send) continue;
    const kind = plan.send;
    const field = reminderField[kind];

    // Claim: only one run can flip the stamp from null to now.
    const claimed = await store.updateWhere(
      { id: record.id, status: "SCHEDULED", scheduledAt: record.scheduledAt, [field]: null },
      { [field]: now },
    );
    if (claimed !== 1) continue;

    try {
      await send(record, kind);
      result.sent.push({ id: record.id, kind });
    } catch (error) {
      // Release the claim so the next run can retry.
      await store.updateWhere({ id: record.id, [field]: now }, { [field]: null });
      result.failed.push({ id: record.id, kind, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return result;
}
