import type { SessionOptions } from "iron-session";

export type AdminSession = {
  isAdmin?: boolean;
  email?: string;
  loginAt?: number;
};

export const SESSION_COOKIE = "ab_admin";
export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

/** Shared by proxy.ts and server code. Reads the secret at call time. */
export function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long.");
  }
  return {
    cookieName: SESSION_COOKIE,
    password,
    ttl: SESSION_TTL_SECONDS,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    },
  };
}
