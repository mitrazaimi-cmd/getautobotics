import { describe, expect, it, vi } from "vitest";
import {
  HOUR,
  initialReminderStamps,
  planReminder,
  processReminders,
  type ReminderRecord,
  type ReminderStore,
} from "@/lib/reminders";

const NOW = new Date("2026-03-10T15:00:00Z");
const inHours = (h: number) => new Date(NOW.getTime() + h * HOUR);

function record(overrides: Partial<ReminderRecord> = {}): ReminderRecord {
  return {
    id: "req_1",
    status: "SCHEDULED",
    scheduledAt: inHours(20),
    reminder24SentAt: null,
    reminder1SentAt: null,
    ...overrides,
  };
}

describe("planReminder", () => {
  it("sends the 24h reminder when the session is 3–24 hours away", () => {
    expect(planReminder(record({ scheduledAt: inHours(24) }), NOW)).toEqual({ send: "24h", skip: [] });
    expect(planReminder(record({ scheduledAt: inHours(3.01) }), NOW)).toEqual({ send: "24h", skip: [] });
  });

  it("does nothing more than 24 hours out", () => {
    expect(planReminder(record({ scheduledAt: inHours(24.01) }), NOW)).toEqual({ send: null, skip: [] });
  });

  it("skips (never sends) a late 24h reminder between 1 and 3 hours out", () => {
    expect(planReminder(record({ scheduledAt: inHours(2) }), NOW)).toEqual({ send: null, skip: ["24h"] });
  });

  it("sends the 1h reminder within the last hour and skips an unsent 24h reminder", () => {
    expect(planReminder(record({ scheduledAt: inHours(1) }), NOW)).toEqual({ send: "1h", skip: ["24h"] });
    expect(
      planReminder(record({ scheduledAt: inHours(0.5), reminder24SentAt: inHours(-20) }), NOW),
    ).toEqual({ send: "1h", skip: [] });
  });

  it("never sends a reminder twice", () => {
    const done = record({ scheduledAt: inHours(0.5), reminder24SentAt: inHours(-20), reminder1SentAt: inHours(-0.2) });
    expect(planReminder(done, NOW)).toEqual({ send: null, skip: [] });
    expect(planReminder(record({ scheduledAt: inHours(10), reminder24SentAt: inHours(-2) }), NOW).send).toBeNull();
  });

  it.each(["CANCELLED", "COMPLETED", "NEW", "CONTACTED"])("ignores %s requests", (status) => {
    expect(planReminder(record({ status, scheduledAt: inHours(0.5) }), NOW)).toEqual({ send: null, skip: [] });
  });

  it("ignores sessions in the past or without a time", () => {
    expect(planReminder(record({ scheduledAt: inHours(-1) }), NOW).send).toBeNull();
    expect(planReminder(record({ scheduledAt: null }), NOW).send).toBeNull();
  });
});

describe("initialReminderStamps", () => {
  it("clears both reminders for a session more than 24h away", () => {
    expect(initialReminderStamps(inHours(48), NOW)).toEqual({ reminder24SentAt: null, reminder1SentAt: null });
  });

  it("marks the 24h reminder handled when booked less than 24h out", () => {
    expect(initialReminderStamps(inHours(5), NOW)).toEqual({ reminder24SentAt: NOW, reminder1SentAt: null });
  });

  it("marks both handled when booked less than 1h out", () => {
    expect(initialReminderStamps(inHours(0.5), NOW)).toEqual({ reminder24SentAt: NOW, reminder1SentAt: NOW });
  });
});

/** In-memory store that mimics Prisma's conditional updateMany semantics. */
function fakeStore(rows: ReminderRecord[]): ReminderStore & { rows: ReminderRecord[] } {
  const matches = (row: ReminderRecord, where: Record<string, unknown>) =>
    Object.entries(where).every(([key, value]) => {
      const actual = (row as Record<string, unknown>)[key];
      if (value instanceof Date || actual instanceof Date) {
        return (actual as Date | null)?.getTime() === (value as Date | null)?.getTime();
      }
      return actual === value;
    });

  return {
    rows,
    async findDue() {
      // Return snapshots, like a real query would
      return rows.map((r) => ({ ...r }));
    },
    async updateWhere(where, data) {
      let count = 0;
      for (const row of rows) {
        if (matches(row, where)) {
          Object.assign(row, data);
          count++;
        }
      }
      return count;
    },
  };
}

describe("processReminders", () => {
  it("sends a due reminder and stamps it", async () => {
    const store = fakeStore([record({ scheduledAt: inHours(20) })]);
    const send = vi.fn().mockResolvedValue(undefined);

    const result = await processReminders(store, send, NOW);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0]![1]).toBe("24h");
    expect(result.sent).toEqual([{ id: "req_1", kind: "24h" }]);
    expect(store.rows[0]!.reminder24SentAt).toEqual(NOW);
  });

  it("does not send again on a second run", async () => {
    const store = fakeStore([record({ scheduledAt: inHours(20) })]);
    const send = vi.fn().mockResolvedValue(undefined);

    await processReminders(store, send, NOW);
    const second = await processReminders(store, send, new Date(NOW.getTime() + 15 * 60_000));

    expect(send).toHaveBeenCalledTimes(1);
    expect(second.sent).toEqual([]);
  });

  it("never double-sends when two runs overlap", async () => {
    const store = fakeStore([record({ scheduledAt: inHours(0.75), reminder24SentAt: inHours(-20) })]);
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const send = vi.fn().mockImplementation(() => gate);

    const runA = processReminders(store, send, NOW);
    const runB = processReminders(store, send, NOW);
    release();
    const [a, b] = await Promise.all([runA, runB]);

    expect(send).toHaveBeenCalledTimes(1);
    expect(a.sent.length + b.sent.length).toBe(1);
  });

  it("releases the claim when sending fails so the next run retries", async () => {
    const store = fakeStore([record({ scheduledAt: inHours(20) })]);
    const send = vi.fn().mockRejectedValueOnce(new Error("provider down")).mockResolvedValue(undefined);

    const first = await processReminders(store, send, NOW);
    expect(first.failed).toEqual([{ id: "req_1", kind: "24h", error: "provider down" }]);
    expect(store.rows[0]!.reminder24SentAt).toBeNull();

    const second = await processReminders(store, send, NOW);
    expect(second.sent).toEqual([{ id: "req_1", kind: "24h" }]);
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("skips cancelled sessions", async () => {
    const store = fakeStore([record({ status: "CANCELLED", scheduledAt: inHours(0.5) })]);
    const send = vi.fn();
    const result = await processReminders(store, send, NOW);
    expect(send).not.toHaveBeenCalled();
    expect(result.sent).toEqual([]);
  });

  it("does not send a reminder for a session that was rescheduled after it was loaded", async () => {
    const store = fakeStore([record({ scheduledAt: inHours(20) })]);
    const originalFind = store.findDue;
    store.findDue = async (now) => {
      const snapshot = await originalFind(now);
      store.rows[0]!.scheduledAt = inHours(72); // admin reschedules mid-run
      return snapshot;
    };
    const send = vi.fn();
    await processReminders(store, send, NOW);
    expect(send).not.toHaveBeenCalled();
  });
});
