import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { sessionOptions, type AdminSession } from "@/lib/session";

export async function getSession() {
  return getIronSession<AdminSession>(await cookies(), sessionOptions());
}

/** Every admin page, server action, and admin API route calls this — proxy.ts is only the first gate. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session.isAdmin) redirect("/admin/login");
  return session;
}

export async function isAdmin(): Promise<boolean> {
  try {
    return Boolean((await getSession()).isAdmin);
  } catch {
    return false;
  }
}
