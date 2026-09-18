import type { Metadata } from "next";
import { Mail, MailOpen } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { setMessageRead } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Messages" };

const stampFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminMessagesPage() {
  await requireAdmin();
  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <h1 className="text-3xl">Contact messages</h1>
      <p className="mt-1 text-muted">
        {messages.length} total · {unread} unread
      </p>

      {messages.length === 0 ? (
        <p className="mt-6 rounded-[8px] border border-line bg-white p-10 text-center text-muted">No messages yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={cn(
                "rounded-[8px] border bg-white p-5",
                m.isRead ? "border-line" : "border-l-[3px] border-y-line border-r-line border-l-blue",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy">
                    {m.name}
                    {!m.isRead && (
                      <span className="ml-2 rounded-full bg-tint px-2 py-0.5 text-xs font-semibold text-navy">Unread</span>
                    )}
                  </p>
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to Auto Botics")}`}
                    className="text-sm font-medium text-navy underline decoration-blue decoration-2 underline-offset-4"
                  >
                    {m.email}
                  </a>
                  <p className="mt-0.5 text-sm text-muted">{stampFmt.format(m.createdAt)}</p>
                </div>
                <form action={setMessageRead.bind(null, m.id, !m.isRead)}>
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border border-line-strong px-3 text-sm font-medium text-navy hover:bg-surface"
                  >
                    {m.isRead ? (
                      <>
                        <Mail size={16} strokeWidth={1.75} aria-hidden="true" /> Mark as unread
                      </>
                    ) : (
                      <>
                        <MailOpen size={16} strokeWidth={1.75} aria-hidden="true" /> Mark as read
                      </>
                    )}
                  </button>
                </form>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-navy">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
