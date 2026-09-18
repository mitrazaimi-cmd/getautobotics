import { NextResponse, type NextRequest } from "next/server";
import { unsealData } from "iron-session";
import { SESSION_COOKIE, sessionOptions, type AdminSession } from "@/lib/session";

// First gate for the admin area. Pages, server actions, and API routes
// re-check the session themselves (defense in depth).

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return withNoIndex(NextResponse.next());

  const seal = request.cookies.get(SESSION_COOKIE)?.value;
  let authorized = false;
  if (seal) {
    try {
      const { password, ttl } = sessionOptions();
      const session = await unsealData<AdminSession>(seal, { password, ttl });
      authorized = Boolean(session.isAdmin);
    } catch {
      authorized = false;
    }
  }

  if (authorized) return withNoIndex(NextResponse.next());

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const loginUrl = new URL("/admin/login", request.url);
  return withNoIndex(NextResponse.redirect(loginUrl));
}

function withNoIndex(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
