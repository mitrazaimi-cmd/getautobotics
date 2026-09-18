"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getSession, requireAdmin } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp } from "@/lib/request";
import { initialReminderStamps } from "@/lib/reminders";
import { InvalidLocalTimeError, zonedTimeToUtc } from "@/lib/time";
import { isValidTimeZone, stripControlChars } from "@/lib/validation";
import { isRequestStatus } from "@/lib/admin-queries";
import { sendCancellation, sendConfirmation } from "@/lib/email";

export type ActionState = { ok?: boolean; message?: string; error?: string };

// ── Auth ────────────────────────────────────────────────────────────────────

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ip = clientIp(await headers());
  const limited = await rateLimit(`login:${hashIp(ip)}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return { error: `Too many sign-in attempts. Try again in ${Math.ceil(limited.retryAfterSeconds / 60)} minutes.` };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  let valid = false;
  try {
    // Always run the password check so response time doesn't reveal whether the email matched.
    const passwordOk = await verifyPassword(password, env.adminPasswordHash);
    valid = passwordOk && email === env.adminEmail;
  } catch (error) {
    console.error("[admin] login configuration error", error);
    return { error: "Admin sign-in isn’t configured. Check ADMIN_EMAIL, ADMIN_PASSWORD_HASH, and SESSION_SECRET." };
  }

  if (!valid) return { error: "That email and password combination didn’t work." };

  const session = await getSession();
  session.isAdmin = true;
  session.email = email;
  session.loginAt = Date.now();
  await session.save();
  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}

// ── Requests ────────────────────────────────────────────────────────────────

export async function saveNotes(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const notes = stripControlChars(String(formData.get("adminNotes") ?? "")).slice(0, 10_000);
  await db.consultationRequest.update({ where: { id }, data: { adminNotes: notes || null } });
  revalidatePath(`/admin/requests/${id}`);
  return { ok: true, message: "Notes saved." };
}

export async function updateStatus(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const status = formData.get("status");
  if (!isRequestStatus(status)) return { error: "Choose a valid status." };

  const current = await db.consultationRequest.findUnique({ where: { id } });
  if (!current) return { error: "This request no longer exists." };
  if (current.status === status) return { ok: true, message: "Status unchanged." };

  if (status === "SCHEDULED" && !current.scheduledAt) {
    return { error: "Set a date and time below to schedule this consultation — that also sends the confirmation." };
  }

  const becomingCancelled = status === "CANCELLED";
  const updated = await db.consultationRequest.update({
    where: { id },
    data: {
      status,
      // A cancellation updates the same calendar event
      ...(becomingCancelled && current.scheduledAt ? { icsSequence: { increment: 1 } } : {}),
    },
  });
  revalidatePath(`/admin/requests/${id}`);
  revalidatePath("/admin");

  if (becomingCancelled) {
    try {
      await sendCancellation(updated);
      return { ok: true, message: "Status changed to Cancelled. A cancellation email was sent." };
    } catch (error) {
      console.error("[admin] cancellation email failed", error);
      return { ok: true, error: "Status changed to Cancelled, but the cancellation email failed to send." };
    }
  }
  return { ok: true, message: "Status updated." };
}

const scheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Choose a date." }),
  time: z.string().regex(/^\d{2}:\d{2}$/, { error: "Choose a time." }),
  timezone: z.string().refine(isValidTimeZone, { error: "Choose a valid time zone." }),
  meetingLink: z
    .string()
    .trim()
    .max(500, { error: "Keep the joining details under 500 characters." })
    .transform((v) => stripControlChars(v)),
});

export async function scheduleSession(id: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = scheduleSchema.safeParse({
    date: formData.get("date"),
    time: formData.get("time"),
    timezone: formData.get("timezone"),
    meetingLink: formData.get("meetingLink") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the scheduling details." };
  const { date, time, timezone, meetingLink } = parsed.data;

  let scheduledAt: Date;
  try {
    scheduledAt = zonedTimeToUtc(date, time, timezone);
  } catch (error) {
    if (error instanceof InvalidLocalTimeError) return { error: error.message };
    throw error;
  }
  const now = new Date();
  if (scheduledAt.getTime() <= now.getTime()) return { error: "That time is in the past. Choose a future time." };

  const current = await db.consultationRequest.findUnique({ where: { id } });
  if (!current) return { error: "This request no longer exists." };

  const sameTime = current.scheduledAt?.getTime() === scheduledAt.getTime() && current.status === "SCHEDULED";
  // "New time" wording only when an active session actually moves (not for link-only edits).
  const isReschedule = Boolean(current.scheduledAt) && current.status === "SCHEDULED" && !sameTime;

  const updated = await db.consultationRequest.update({
    where: { id },
    data: {
      scheduledAt,
      timezone,
      meetingLink: meetingLink || null,
      status: "SCHEDULED",
      // Rescheduling resets reminders; windows already passed are marked handled.
      ...(sameTime ? {} : initialReminderStamps(scheduledAt, now)),
      ...(current.scheduledAt ? { icsSequence: { increment: 1 } } : {}),
    },
  });
  revalidatePath(`/admin/requests/${id}`);
  revalidatePath("/admin");

  try {
    await sendConfirmation(updated, { isReschedule });
    return {
      ok: true,
      message: isReschedule
        ? "Session rescheduled. An updated confirmation with a calendar invite was sent."
        : "Session confirmed. A confirmation email with a calendar invite was sent.",
    };
  } catch (error) {
    console.error("[admin] confirmation email failed", error);
    return { ok: true, error: "Session saved, but the confirmation email failed to send. Check your email settings." };
  }
}

// ── Messages ────────────────────────────────────────────────────────────────

export async function setMessageRead(id: string, isRead: boolean) {
  await requireAdmin();
  await db.contactMessage.update({ where: { id }, data: { isRead } });
  revalidatePath("/admin/messages");
}
