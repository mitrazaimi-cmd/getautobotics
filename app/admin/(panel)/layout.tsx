import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Inbox, ListChecks, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { unreadMessageCount } from "@/lib/admin-queries";
import { logout } from "@/app/admin/actions";
import { AdminNavLink } from "@/components/admin/AdminNavLink";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const unread = await unreadMessageCount().catch(() => 0);

  return (
    <>
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[8px] focus:bg-navy focus:px-4 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-3 rounded-[4px]">
              <Image src="/brand/ab-mark-96.png" alt="" width={36} height={36} className="rounded-[6px]" />
              <span className="font-semibold text-navy">Auto Botics Admin</span>
            </Link>
            <nav aria-label="Admin">
              <ul className="flex items-center gap-1">
                <li>
                  <AdminNavLink href="/admin" match="requests">
                    <ListChecks size={18} strokeWidth={1.75} aria-hidden="true" /> Requests
                  </AdminNavLink>
                </li>
                <li>
                  <AdminNavLink href="/admin/messages" match="messages">
                    <Inbox size={18} strokeWidth={1.75} aria-hidden="true" /> Messages
                    {unread > 0 && (
                      <span className="rounded-full bg-navy px-2 py-0.5 text-xs font-bold text-white">
                        {unread}
                        <span className="sr-only"> unread</span>
                      </span>
                    )}
                  </AdminNavLink>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted md:inline">{session.email}</span>
            <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-3 text-navy hover:bg-surface">
              View site <ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" />
            </Link>
            <form action={logout}>
              <button type="submit" className="inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-3 font-medium text-navy hover:bg-surface">
                <LogOut size={16} strokeWidth={1.75} aria-hidden="true" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="admin-main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  );
}
