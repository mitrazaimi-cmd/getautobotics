import { db } from "@/lib/db";
import { guardPublicForm, json } from "@/lib/api";
import { contactSchema, fieldErrorsFrom } from "@/lib/validation";

export async function POST(request: Request) {
  const guard = await guardPublicForm(request, { bucket: "contact", limit: 8, windowMs: 60 * 60 * 1000 });
  if (!guard.ok) return guard.response;
  if (guard.spam) return json({ ok: true });

  const parsed = contactSchema.safeParse(guard.body);
  if (!parsed.success) {
    return json({ error: "Please check the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) }, 400);
  }

  try {
    await db.contactMessage.create({ data: parsed.data });
    return json({ ok: true }, 201);
  } catch (error) {
    console.error("[contact] could not save message", error);
    return json({ error: "Something went wrong on our side and your message wasn’t saved. Please try again." }, 500);
  }
}
