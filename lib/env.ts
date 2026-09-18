import "server-only";

// Server-side environment access. Values are read lazily so the site can build
// without secrets; a missing required value throws a clear error when used.

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing environment variable ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : undefined;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get sessionSecret() {
    const secret = required("SESSION_SECRET");
    if (secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters.");
    return secret;
  },
  get adminEmail() {
    return required("ADMIN_EMAIL").trim().toLowerCase();
  },
  get adminPasswordHash() {
    return required("ADMIN_PASSWORD_HASH");
  },
  get cronSecret() {
    return required("CRON_SECRET");
  },
  get rateLimitSalt() {
    return optional("RATE_LIMIT_SALT") ?? required("SESSION_SECRET");
  },
  /** When unset, emails are logged to the console instead of sent (local development). */
  get resendApiKey() {
    return optional("RESEND_API_KEY");
  },
  get emailFrom() {
    return optional("EMAIL_FROM") ?? "Auto Botics <onboarding@resend.dev>";
  },
  get emailReplyTo() {
    return optional("EMAIL_REPLY_TO");
  },
  get adminNotifyEmail() {
    return optional("ADMIN_NOTIFY_EMAIL") ?? optional("ADMIN_EMAIL");
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
};
