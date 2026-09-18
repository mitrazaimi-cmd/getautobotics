import "server-only";
import { db } from "@/lib/db";
import { Prisma, RequestStatus } from "@/lib/generated/prisma/client";

export const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const satisfies ReadonlyArray<{ value: RequestStatus; label: string }>;

export function isRequestStatus(value: unknown): value is RequestStatus {
  return typeof value === "string" && value in RequestStatus;
}

export function statusLabel(status: string): string {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

export type RequestFilters = { q?: string; status?: string };

export function requestWhere({ q, status }: RequestFilters): Prisma.ConsultationRequestWhereInput {
  const where: Prisma.ConsultationRequestWhereInput = {};
  if (isRequestStatus(status)) where.status = status;
  const term = q?.trim().slice(0, 100);
  if (term) {
    where.OR = [
      { fullName: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
      { companyName: { contains: term, mode: "insensitive" } },
    ];
  }
  return where;
}

export async function listRequests(filters: RequestFilters, take = 200) {
  return db.consultationRequest.findMany({
    where: requestWhere(filters),
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function statusCounts() {
  const groups = await db.consultationRequest.groupBy({ by: ["status"], _count: { _all: true } });
  const counts: Record<string, number> = { ALL: 0 };
  for (const g of groups) {
    counts[g.status] = g._count._all;
    counts.ALL += g._count._all;
  }
  return counts;
}

export async function unreadMessageCount() {
  return db.contactMessage.count({ where: { isRead: false } });
}
