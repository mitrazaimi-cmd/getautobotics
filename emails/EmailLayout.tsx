import type { ReactNode } from "react";
import { Body, Button, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from "react-email";
import { contact, emailSignature, isPlaceholder, site } from "@/content/site";
import { messages } from "@/content/messages";

// Brand tokens for email (inline styles — email clients ignore stylesheets).
export const emailColors = {
  navy: "#102A43",
  blue: "#1677E8",
  cyan: "#19B8E6",
  white: "#FFFFFF",
  muted: "#486581",
  surface: "#F5F8FC",
  tint: "#EAF2FD",
  line: "#DDE4EC",
};

const font = "Inter, 'Segoe UI', Helvetica, Arial, sans-serif";

export const text = {
  p: { color: emailColors.navy, fontSize: "16px", lineHeight: "26px", margin: "0 0 16px", fontFamily: font },
  muted: { color: emailColors.muted, fontSize: "14px", lineHeight: "22px", margin: "0", fontFamily: font },
  h1: {
    color: emailColors.navy,
    fontSize: "24px",
    lineHeight: "32px",
    fontWeight: 700,
    margin: "0 0 16px",
    fontFamily: font,
    letterSpacing: "-0.01em",
  },
};

/** One primary action per email (brand guide §10). 19px bold keeps white-on-blue at WCAG large-text contrast. */
export function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Section style={{ margin: "8px 0 24px" }}>
      <Button
        href={href}
        style={{
          backgroundColor: emailColors.blue,
          color: emailColors.white,
          fontSize: "19px",
          fontWeight: 700,
          fontFamily: font,
          borderRadius: "8px",
          padding: "14px 24px",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        {children}
      </Button>
    </Section>
  );
}

/** Light tint with a 3px Electric Blue bar — the brand callout frame. */
export function Callout({ children }: { children: ReactNode }) {
  return (
    <Section
      style={{
        backgroundColor: emailColors.tint,
        borderLeft: `3px solid ${emailColors.blue}`,
        borderRadius: "0 8px 8px 0",
        padding: "16px 20px",
        margin: "0 0 24px",
      }}
    >
      {children}
    </Section>
  );
}

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Text style={{ ...text.p, margin: "0 0 8px" }}>
      <span style={{ color: emailColors.muted, fontSize: "14px" }}>{label}</span>
      <br />
      <strong>{value}</strong>
    </Text>
  );
}

/** Signature — brand guide §10 (the CTA line is omitted so each email keeps one primary action). */
function Signature() {
  const contactBits = [site.domain, contact.email, contact.phone].filter((v) => v === site.domain || !isPlaceholder(v));
  return (
    <Section style={{ marginTop: "8px" }}>
      <Text style={{ ...text.p, margin: "0" }}>
        <strong>{emailSignature.name}</strong>
        <br />
        {emailSignature.title}
        <br />
        <span style={{ color: emailColors.muted }}>{emailSignature.focus}</span>
      </Text>
      <Text style={{ ...text.muted, marginTop: "8px" }}>
        {contactBits.map((bit, i) => (
          <span key={bit}>
            {i > 0 && "  |  "}
            {bit === site.domain ? (
              <Link href={site.url} style={{ color: emailColors.navy, textDecoration: "underline", textDecorationColor: emailColors.blue }}>
                {bit}
              </Link>
            ) : (
              bit
            )}
          </span>
        ))}
      </Text>
      <Text style={{ ...text.muted, marginTop: "8px", fontStyle: "italic" }}>{messages.tagline}</Text>
    </Section>
  );
}

export function EmailLayout({
  preview,
  children,
  footerNote,
  showSignature = true,
}: {
  preview: string;
  children: ReactNode;
  footerNote?: string;
  showSignature?: boolean;
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: emailColors.surface, margin: 0, padding: "24px 0", fontFamily: font }}>
        <Container style={{ maxWidth: "560px", width: "100%", margin: "0 auto" }}>
          <Section style={{ padding: "0 24px 16px" }}>
            <Img
              src={`${site.url}/brand/ab-mark-96.png`}
              width="44"
              height="44"
              alt="Auto Botics"
              style={{ display: "inline-block", verticalAlign: "middle", borderRadius: "8px" }}
            />
            <span
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                marginLeft: "10px",
                color: emailColors.navy,
                fontSize: "18px",
                fontWeight: 700,
                fontFamily: font,
              }}
            >
              Auto Botics
            </span>
          </Section>
          <Section
            style={{
              backgroundColor: emailColors.white,
              border: `1px solid ${emailColors.line}`,
              borderRadius: "8px",
              padding: "32px 28px",
            }}
          >
            {children}
            {showSignature && (
              <>
                <Hr style={{ borderColor: emailColors.line, margin: "24px 0" }} />
                <Signature />
              </>
            )}
          </Section>
          {footerNote && (
            <Text style={{ ...text.muted, fontSize: "12px", lineHeight: "18px", padding: "16px 24px 0", textAlign: "center" }}>
              {footerNote}
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
}
