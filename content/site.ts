// ─────────────────────────────────────────────────────────────
// Site-wide settings. Edit placeholders in [brackets] before launch.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Auto Botics",
  domain: "getAutoBotics.com",
  /** Canonical URL. Set NEXT_PUBLIC_SITE_URL in production. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://getautobotics.com").replace(/\/$/, ""),
  category: "AI Agents • Automation • Chatbots",
  description:
    "Auto Botics helps U.S. small and medium-sized businesses automate repetitive work with practical AI agents, chatbots, and workflow automation — built around how your business already works.",
  market: "United States",
} as const;

export const contact = {
  /** Temporary until the getAutoBotics.com mailbox is set up — then switch back to info@getAutoBotics.com. */
  email: "mitrazaimi@gmail.com",
  phone: "(818) 331-0900",
  /** Full profile URL — confirm this is the right one before launch. */
  linkedin: "https://www.linkedin.com/company/autobotics",
  /** What visitors see instead of the raw URL. */
  linkedinLabel: "AutoBotics",
  location: "Irvine, CA",
};

export const booking = {
  /** Length of a consultation, used for calendar invites. */
  durationMinutes: 30,
  /** Shown in emails and invites. */
  meetingTitle: "Automation consultation — Auto Botics",
};

/** Email signature — brand guide §10. */
export const emailSignature = {
  name: "Mitra",
  title: "Founder, Auto Botics",
  focus: "AI Agents • Automation • Chatbots",
};

export type SocialLink = { label: string; href: string };

/** Empty or bracketed hrefs render as non-clickable placeholders. */
export const socialLinks: SocialLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/autobotics" },
  { label: "Instagram", href: "[Instagram URL]" },
  { label: "YouTube", href: "[YouTube URL]" },
];

export const navLinks = [
  { label: "Services", href: "/#services" },
  { label: "Method", href: "/#method" },
  { label: "My Work", href: "/#portfolio" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
] as const;

/** True for placeholder values like "[phone]" so the UI can avoid broken links. */
export function isPlaceholder(value: string | null | undefined): boolean {
  return !value || /^\[.*\]$/.test(value.trim()) || value.includes("[");
}
