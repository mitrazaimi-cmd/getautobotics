import { after } from "next/server";
import { db } from "@/lib/db";
import { guardPublicForm, json } from "@/lib/api";
import { sendAdminNotification, sendRequestReceived } from "@/lib/email";
import { bookingSchema, challengeToDb, companySizeToDb, fieldErrorsFrom } from "@/lib/validation";

export async function POST(request: Request) {
  const guard = await guardPublicForm(request, { bucket: "book", limit: 8, windowMs: 60 * 60 * 1000 });
  if (!guard.ok) return guard.response;

  // Bots get a normal-looking success so they don't adapt; nothing is stored.
  if (guard.spam) return json({ ok: true });

  const parsed = bookingSchema.safeParse(guard.body);
  if (!parsed.success) {
    return json({ error: "Please check the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) }, 400);
  }
  const data = parsed.data;

  try {
    const created = await db.consultationRequest.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone ?? null,
        companyName: data.companyName,
        companySize: companySizeToDb(data.companySize),
        mainChallenge: challengeToDb(data.mainChallenge),
        description: data.description,
        preferredTimes: data.preferredTimes ?? null,
        referralSource: data.referralSource ?? null,
        timezone: data.timezone ?? null,
        consentAt: new Date(),
      },
    });

    // Emails go out after the response; a failed email never loses the saved request.
    after(async () => {
      const results = await Promise.allSettled([sendRequestReceived(created), sendAdminNotification(created)]);
      for (const r of results) {
        if (r.status === "rejected") console.error("[book] email failed", { id: created.id, error: String(r.reason) });
      }
    });

    return json({ ok: true }, 201);
  } catch (error) {
    console.error("[book] could not save request", error);
    return json({ error: "Something went wrong on our side and your request wasn’t saved. Please try again." }, 500);
  }
}
