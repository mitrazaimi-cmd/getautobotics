import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listRequests, statusLabel } from "@/lib/admin-queries";
import { toCsv } from "@/lib/csv";
import { challengeLabel, companySizeLabel } from "@/lib/validation";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const url = new URL(request.url);
  const rows = await listRequests(
    { q: url.searchParams.get("q") ?? undefined, status: url.searchParams.get("status") ?? undefined },
    10_000,
  );

  const csv = toCsv(
    [
      "ID",
      "Received (UTC)",
      "Status",
      "Full name",
      "Email",
      "Phone",
      "Company",
      "Company size",
      "Main challenge",
      "Description",
      "Preferred times",
      "Heard about us",
      "Time zone",
      "Scheduled (UTC)",
      "Meeting link",
      "Admin notes",
      "Consent (UTC)",
    ],
    rows.map((r) => [
      r.id,
      r.createdAt,
      statusLabel(r.status),
      r.fullName,
      r.email,
      r.phone,
      r.companyName,
      companySizeLabel(r.companySize),
      challengeLabel(r.mainChallenge),
      r.description,
      r.preferredTimes,
      r.referralSource,
      r.timezone,
      r.scheduledAt,
      r.meetingLink,
      r.adminNotes,
      r.consentAt,
    ]),
  );

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="consultation-requests-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
