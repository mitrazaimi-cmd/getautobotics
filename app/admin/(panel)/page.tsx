import type { Metadata } from "next";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { listRequests, STATUS_OPTIONS, statusCounts } from "@/lib/admin-queries";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { challengeLabel, companySizeLabel } from "@/lib/validation";
import { DEFAULT_TIMEZONE, formatDateTimeInZone } from "@/lib/time";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Requests" };

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function AdminRequestsPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "";

  const [requests, counts] = await Promise.all([listRequests({ q, status }), statusCounts()]);

  const filterHref = (s: string) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (s) sp.set("status", s);
    const qs = sp.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };
  const exportParams = new URLSearchParams();
  if (q) exportParams.set("q", q);
  if (status) exportParams.set("status", status);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Consultation requests</h1>
          <p className="mt-1 text-muted">
            {counts.ALL ?? 0} total · {counts.NEW ?? 0} new
          </p>
        </div>
        <a
          href={`/api/admin/export${exportParams.size ? `?${exportParams}` : ""}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-[8px] border-[1.5px] border-navy bg-white px-4 font-semibold text-navy hover:bg-surface"
        >
          <Download size={18} strokeWidth={1.75} aria-hidden="true" />
          Export CSV
        </a>
      </div>

      <form role="search" className="mt-6 flex flex-col gap-3 sm:flex-row" action="/admin">
        {status && <input type="hidden" name="status" value={status} />}
        <label htmlFor="q" className="sr-only">
          Search by name, email, or company
        </label>
        <div className="relative flex-1">
          <Search size={18} strokeWidth={1.75} aria-hidden="true" className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search by name, email, or company"
            className="min-h-11 w-full rounded-[8px] border border-field bg-white py-2 pr-4 pl-10 text-navy focus:border-blue"
          />
        </div>
        <button type="submit" className="min-h-11 rounded-[8px] bg-navy px-5 font-semibold text-white hover:bg-navy-900">
          Search
        </button>
      </form>

      <nav aria-label="Filter by status" className="mt-5">
        <ul className="flex flex-wrap gap-2">
          {[{ value: "", label: "All" }, ...STATUS_OPTIONS].map((opt) => {
            const active = status === opt.value;
            const count = opt.value ? (counts[opt.value] ?? 0) : (counts.ALL ?? 0);
            return (
              <li key={opt.value || "all"}>
                <Link
                  href={filterHref(opt.value)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium",
                    active ? "border-navy bg-navy text-white" : "border-line-strong bg-white text-navy hover:bg-surface",
                  )}
                >
                  {opt.label}
                  <span className={active ? "text-on-navy-muted" : "text-muted"}>{count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 overflow-x-auto rounded-[8px] border border-line bg-white">
        {requests.length === 0 ? (
          <p className="p-10 text-center text-muted">
            {q || status ? "No requests match these filters." : "No consultation requests yet."}
          </p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-[0.9375rem]">
            <caption className="sr-only">Consultation requests, newest first</caption>
            <thead className="border-b border-line bg-surface text-sm text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Name / company</th>
                <th scope="col" className="px-4 py-3 font-semibold">Challenge</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold">Session</th>
                <th scope="col" className="px-4 py-3 font-semibold">Received</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0 hover:bg-surface">
                  <td className="px-4 py-3">
                    <Link href={`/admin/requests/${r.id}`} className="font-semibold text-navy underline decoration-blue decoration-2 underline-offset-4">
                      {r.fullName}
                    </Link>
                    <div className="text-sm text-muted">
                      {r.companyName} · {companySizeLabel(r.companySize)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-navy">{challengeLabel(r.mainChallenge)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-navy">
                    {r.scheduledAt ? formatDateTimeInZone(r.scheduledAt, r.timezone ?? DEFAULT_TIMEZONE) : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-muted">{dateFmt.format(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {requests.length === 200 && <p className="mt-3 text-sm text-muted">Showing the 200 most recent. Use search or filters to narrow down.</p>}
    </div>
  );
}
