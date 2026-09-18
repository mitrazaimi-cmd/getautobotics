// ─────────────────────────────────────────────────────────────
// Core brand copy — from Auto_Botics_Brand_Guide_2026_Updated.md §06 and §08.
// Keep wording aligned with the brand guide when editing.
// ─────────────────────────────────────────────────────────────

export const messages = {
  /** Brand guide wording — used in the footer, emails, social preview, and SEO data. */
  tagline: "Technology should work for you — not the other way around.",
  /** Home page headline only: two fixed lines, no dash, no final period. */
  taglineHeadlineLines: ["Technology should work for you,", "not the other way around"],
  promise: "We make AI work for your business.",
  supporting: "You don’t need to understand AI. We make AI work for you.",
  positioning: "We understand your business before we automate it.",
  brandIdea: "Automate the work. Create freedom. Grow the business.",
  methodPromise: "The promise is not “more technology.” The promise is a business that works better.",
  /** Condensed elevator pitch for the footer */
  pitchShort:
    "Auto Botics helps small and medium-sized business owners automate the email, follow-up, scheduling, and admin work that slows them down — with practical AI built around the tools they already use.",
};

/** CTA ladder (brand guide §08). Never use "Click here" or "Learn more". */
export const cta = {
  primary: "Book an automation consultation",
  primaryShort: "Book a consultation",
  awareness: "See what could be automated",
  consideration: "Find your highest-value automation opportunities",
};

/** Key Messages (brand guide §06) — copy-ready, no guaranteed results. */
export const keyMessages = [
  {
    outcome: "Saved time",
    text: "You don’t need more technology — you need the right automation in the right places, so repetitive work stops eating your team’s week.",
  },
  {
    outcome: "Faster response",
    text: "Speed wins leads: when every inquiry gets a fast, consistent reply, far fewer opportunities slip through the cracks.",
  },
  {
    outcome: "Better follow-up",
    text: "Follow-up shouldn’t depend on someone remembering. Automation keeps it consistent, even on your busiest days.",
  },
  {
    outcome: "Fewer manual steps",
    text: "Every manual step you remove is one less handoff, one less error, and one less task waiting on you.",
  },
  {
    outcome: "More opportunities",
    text: "AI won’t replace your team — it takes the repetitive work off their plates so they can focus on customers and growth.",
  },
] as const;

/** Customer transformation (brand guide §03) */
export const transformation = {
  before: [
    "Repetitive manual work fills the day",
    "Constant email and follow-up",
    "Slow responses to customers",
    "Leads slip through the cracks",
    "Fragmented, inconsistent workflows",
    "Too much depends on the owner",
  ],
  after: [
    "Repetitive work is automated",
    "Customers get faster service",
    "Workflows are organized and repeatable",
    "Leads are managed consistently",
    "Your team focuses on higher-value work",
    "The owner has more time for growth",
  ],
};
