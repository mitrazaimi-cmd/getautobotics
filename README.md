# Auto Botics — Website

Consultation-booking website for **Auto Botics** (AI Agents • Automation • Chatbots).
One goal: help visitors **book an automation consultation**.

- Public site: landing page, services, method, portfolio, about, booking form, contact form, privacy, 404
- Admin panel (`/admin`): manage requests, schedule sessions, read messages, export CSV
- Emails: request received, admin notification, confirmation with calendar invite, 24h and 1h reminders, cancellation

Brand source of truth: `Auto_Botics_Brand_Guide_2026_Updated.md` (kept outside this repository).
Design system (brand-corrected): [`design-system/auto-botics/MASTER.md`](design-system/auto-botics/MASTER.md).

---

## Contents

1. [Tech stack](#tech-stack)
2. [Local setup](#local-setup)
3. [Environment variables](#environment-variables)
4. [Database and migrations](#database-and-migrations)
5. [Email setup (Resend)](#email-setup-resend)
6. [Deployment (Vercel)](#deployment-vercel)
7. [Reminder scheduling (cron)](#reminder-scheduling-cron)
8. [Editing content](#editing-content)
9. [Admin panel](#admin-panel)
10. [Tests and quality checks](#tests-and-quality-checks)
11. [Project structure](#project-structure)
12. [Security notes](#security-notes)

---

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 with brand tokens only (`app/globals.css`) |
| Database | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Validation | Zod (`zod/mini`), one shared schema for browser and server |
| Email | Resend + React Email templates |
| Auth (admin) | iron-session encrypted cookie + scrypt password hash |
| Icons | Lucide (outline) |
| Tests | Vitest |

> **Next.js 16 note:** middleware is now called `proxy.ts`, and `params`/`cookies()` are async.
> The bundled docs in `node_modules/next/dist/docs/` match the installed version.

---

## Local setup

Requirements: **Node.js 20.19+** (22 or 24 recommended), npm.

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Create your .env
cp .env.example .env
#    → fill in the values (see "Environment variables")

# 3. Start a database
#    Option A — Neon (recommended; same as production): paste its URL into DATABASE_URL
#    Option B — local, no account needed:
npx prisma dev            # prints a TCP connection URL → use it as DATABASE_URL

# 4. Create the tables
npm run db:migrate

# 5. Create your admin password hash and paste the output into .env
npm run hash-password -- "a long, unique password"

# 6. Run the site
npm run dev               # http://localhost:3000
```

Without `RESEND_API_KEY`, every email is **printed in the terminal** instead of sent, so you can test the whole flow locally.

---

## Environment variables

All variables are documented in [`.env.example`](.env.example).

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | ✅ (prod) | Public URL for email links, sitemap, SEO |
| `SESSION_SECRET` | ✅ | Encrypts the admin cookie (32+ characters) |
| `ADMIN_EMAIL` | ✅ | Admin sign-in email |
| `ADMIN_PASSWORD_HASH` | ✅ | Output of `npm run hash-password` |
| `CRON_SECRET` | ✅ | Protects the reminders endpoint |
| `RESEND_API_KEY` | ✅ (prod) | Sends emails. Empty = log to terminal |
| `EMAIL_FROM` | ✅ (prod) | Verified sender, e.g. `Auto Botics <hello@getautobotics.com>` |
| `EMAIL_REPLY_TO` | Recommended | Where replies go |
| `ADMIN_NOTIFY_EMAIL` | Optional | New-request notifications (defaults to `ADMIN_EMAIL`) |
| `RATE_LIMIT_SALT` | Optional | Salt for hashed IPs (defaults to `SESSION_SECRET`) |
| `SHADOW_DATABASE_URL` | Optional | Only if `migrate dev` can't create a temp database |

---

## Database and migrations

Schema: [`prisma/schema.prisma`](prisma/schema.prisma). Connection settings: [`prisma.config.ts`](prisma.config.ts).

| Command | When |
|---|---|
| `npm run db:migrate` | Development: create/apply migrations after changing the schema |
| `npm run db:deploy` | Production: apply existing migrations (no prompts) |
| `npm run db:studio` | Browse data in Prisma Studio |
| `npm run db:generate` | Regenerate the client (runs automatically on install/build) |

Models:
- **ConsultationRequest** — all form fields, `status` (NEW, CONTACTED, SCHEDULED, COMPLETED, CANCELLED), `scheduledAt` (UTC), `timezone` (IANA), `meetingLink`, `adminNotes`, `reminder24SentAt` / `reminder1SentAt`, `icsSequence`, timestamps
- **ContactMessage** — name, email, message, `isRead`, timestamp
- **RateLimit** — per-IP counters for spam protection (works across serverless instances)

**Neon setup:** create a project at neon.tech → copy the **pooled** connection string → set `DATABASE_URL` locally and in Vercel → run `npm run db:deploy` once (locally with the production URL, or as part of your deploy).

---

## Email setup (Resend)

1. Create an account at resend.com.
2. **Domains → Add domain** → `getautobotics.com` → add the DNS records it shows (SPF, DKIM, and optionally DMARC) at your domain registrar. Wait until the domain shows **Verified**.
3. **API Keys → Create** → set `RESEND_API_KEY`.
4. Set `EMAIL_FROM` to an address on the verified domain, and `EMAIL_REPLY_TO` to your inbox.

Templates live in [`emails/templates.tsx`](emails/templates.tsx) (shared layout: [`emails/EmailLayout.tsx`](emails/EmailLayout.tsx)).
The email flow is wired in [`lib/email.tsx`](lib/email.tsx).

| Trigger | Email |
|---|---|
| Booking form submitted | Visitor: “We received your request” · Admin: new request notification |
| Admin saves a date/time | Visitor: “Your consultation is confirmed” + `.ics` invite (updates the same calendar event on reschedule) |
| 24 hours / 1 hour before | Visitor: reminder (sent once each; skipped for cancelled sessions) |
| Status changed to Cancelled | Visitor: polite cancellation + calendar cancellation |

The signature name lives in `content/site.ts` → `emailSignature`.

---

## Deployment (Vercel)

1. Push the project to a GitHub repository.
2. In Vercel: **Add New → Project** → import the repository (framework is detected automatically).
3. Add every variable from `.env.example` under **Settings → Environment Variables** (Production).
4. Deploy. The build runs `prisma generate && next build`.
5. Apply database migrations to production once: `DATABASE_URL="<neon url>" npm run db:deploy`.
6. **Domains:** add `getautobotics.com` in Vercel and follow its DNS instructions.
7. Set `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy.
8. Set up reminders (next section).

---

## Reminder scheduling (cron)

Reminders are sent by `GET /api/cron/reminders`, which must be called **every 15 minutes** with the header
`Authorization: Bearer <CRON_SECRET>`. It is safe to call more often or twice at once: each reminder is claimed in the
database before sending, so it can never be sent twice, and a failed send is retried on the next run.

Pick **one** option:

**A. GitHub Actions (free, works on Vercel Hobby)** — already included in
[`.github/workflows/reminders.yml`](.github/workflows/reminders.yml).
In GitHub → **Settings → Secrets and variables → Actions**, add `SITE_URL` (e.g. `https://getautobotics.com`) and
`CRON_SECRET` (same value as in Vercel). GitHub may delay runs by a few minutes; the logic tolerates that.

**B. Vercel Cron (requires Vercel Pro** — Hobby only allows daily jobs, which is too infrequent). Create `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/reminders", "schedule": "*/15 * * * *" }]
}
```

Vercel sends `CRON_SECRET` automatically. Disable option A if you use this.

**C. Any external scheduler** (e.g. cron-job.org, free): call the URL every 15 minutes with the Authorization header.

Test manually:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://getautobotics.com/api/cron/reminders
```

---

## Editing content

All editable text lives in [`content/`](content/). Change these files — no component changes needed.

| File | What it controls |
|---|---|
| `content/site.ts` | Domain, contact details, social links, nav, meeting length, **email signature** |
| `content/messages.ts` | Tagline, promise, CTAs, Key Messages, Before/After lists |
| `content/services.ts` | 10 service areas and 3 packages (no prices) |
| `content/method.ts` | The 7-step Auto Botics Method |
| `content/portfolio.ts` | Case studies (**placeholders** — see below) |
| `content/about.ts` | Founder name, photo, bio, “working together” list |
| `content/values.ts` | Core values |

**Placeholders:** any value in `[brackets]` is a placeholder. Contact details and social links in brackets are shown as “coming soon” and never become broken links.

**Case studies:** each entry in `content/portfolio.ts` has `placeholder: true`, which shows a visible badge, sets the page to `noindex`, and hides it from the sitemap. Replace the text with a real project (with the client’s permission), then set `placeholder: false`. Brand rule (§12): never invent client names, logos, metrics, or testimonials.

**Founder photo:** currently `public/mitra.png`, shown as a round portrait at its natural size (137×143) so it stays sharp.
To use the large portrait frame instead, add a photo of at least 800×1000 (e.g. `public/founder.jpg`) and in `content/about.ts` set `photo: "/founder.jpg"` and `shape: "portrait"`.

**Intro animation:** on the home page the logo appears large in the middle of the screen, then fades away (`components/layout/IntroAnimation.tsx`, styles under “Brand intro animation” in `app/globals.css`). It plays once per visit (`sessionStorage`) and is skipped for visitors who prefer reduced motion. To change its length, edit the `1250ms` durations; to remove it, delete `<IntroAnimation />` from `app/(site)/page.tsx`.

**Icons:** use a name from the registry in `components/ui/Icon.tsx` (Lucide outline icons). Add a new Lucide icon there first.

**Favicon / email mark:** generated from `logo-full.png` by `npm run icons` (writes `app/icon.png`, `app/apple-icon.png`, `public/brand/*`). `public/logo.png` is never modified.

---

## Brand notes

Deliberate departures from `Auto_Botics_Brand_Guide_2026_Updated.md`, agreed during the build:

- **Node Grid pattern removed** (guide §09 lists it as a core graphic element). Backgrounds are plain white or Deep Navy. The `NodeGrid` component is still in `components/brand/` if you want it back.
- **Orbit Line** is still used, once, under “The Auto Botics Method” heading — the guide’s maximum of one per layout.
- **Button labels are 19px bold.** White on Electric Blue is 4.34:1, which passes WCAG AA only at large-text size (the guide’s “14pt bold”). Inline links are Deep Navy with a blue underline for the same reason.
- **Intro animation** (logo centered, then fading away) is an addition, not from the guide.

## Admin panel

- URL: `/admin` (sign in with `ADMIN_EMAIL` + the password you hashed). Sessions last 8 hours.
- **Requests:** search by name, email, or company; filter by status; open a request to see details.
- **Schedule:** pick date, time, and time zone (defaults to the visitor’s detected zone) plus an optional meeting link. A live preview shows the time the visitor will see and your local time. Saving confirms the session, emails the invite, and resets reminders.
- **Status:** changing to *Cancelled* asks for confirmation and emails the visitor.
- **Notes:** private, never emailed.
- **Messages:** contact-form messages with read/unread.
- **Export CSV:** downloads the current filter/search results (spreadsheet-formula safe).

---

## Tests and quality checks

```bash
npm test            # Vitest: validation, API routes, reminders, time zones, .ics, CSV, passwords
npm run typecheck   # TypeScript
npm run build       # production build
```

Coverage highlights:
- Form validation (required fields, email format, consent, length limits, honeypot, fill time)
- API routes (201 saved, 400 field errors, 429 rate limit, 403 cross-origin, 413 oversized, spam dropped, email failure doesn’t lose the request)
- Reminder logic (windows, never twice, overlapping runs, retry after failure, cancelled sessions, rescheduling race)
- Time zones across DST, including times that don’t exist
- Calendar invites (UTC times, escaping, line folding, cancellation)

Before launch, run PageSpeed Insights on the deployed URL (mobile and desktop).

---

## Project structure

```
app/
  (site)/            public pages: /, /book, /book/success, /portfolio/[slug], /privacy
  admin/             /admin/login and the protected panel ((panel) group) + server actions
  api/               book, contact, admin/export, cron/reminders
  layout.tsx         root layout, fonts, metadata
  globals.css        brand design tokens (Tailwind v4 @theme)
  sitemap.ts, robots.ts, opengraph-image.tsx, icon.png, apple-icon.png, not-found.tsx
components/
  brand/             NodeGrid, OrbitLine, Card/Callout/Divider frames
  layout/            Header (mobile menu), Footer, Logo, SiteShell, RevealObserver
  sections/          landing page sections
  forms/             BookingForm, ContactForm, accessible fields, validation hook
  admin/             admin UI pieces
  ui/                Button, Icon registry, SectionHeading, PlaceholderBadge
  seo/               ProfessionalService structured data
content/             ← edit site copy here
emails/              React Email templates
lib/                 db, env, auth/session, validation, rate limit, email, ics, time, reminders, csv
prisma/              schema + migrations
proxy.ts             first gate for /admin and /api/admin
scripts/             make-icons, hash-password
tests/               Vitest suites
design-system/       ui-ux-pro-max design system (brand-corrected)
```

---

## Security notes

- Secrets only in environment variables; `.env` is git-ignored.
- Admin: scrypt password hash, encrypted httpOnly `SameSite=Strict` cookie, login rate limit (5 per 15 minutes per IP), session checked in `proxy.ts` **and** in every admin page, action, and API route.
- Public forms: Zod validation on the server, control-character stripping, length caps, JSON size limit, same-origin check, honeypot, minimum fill time, per-IP rate limits stored as hashed IPs.
- Output: React and React Email escape content; JSON-LD escapes `<`; CSV export neutralizes formulas; `.ics` values are escaped.
- Headers: `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS; admin responses are `noindex` and `no-store`.
- `npm audit` reports advisories in the Prisma **CLI**’s development dependencies (`mysql2`, `deepmerge-ts`). They are not part of the deployed site and the site does not use MySQL; the only suggested fix is downgrading Prisma. Re-check after Prisma updates.
