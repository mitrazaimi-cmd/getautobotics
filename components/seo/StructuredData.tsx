import { site, contact, socialLinks, isPlaceholder } from "@/content/site";
import { messages } from "@/content/messages";
import { services } from "@/content/services";

/** schema.org ProfessionalService — rendered once in the public site layout. */
export function StructuredData() {
  const sameAs = socialLinks.map((s) => s.href).filter((href) => !isPlaceholder(href));

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    logo: `${site.url}/logo.png`,
    image: `${site.url}/brand/ab-mark-512.png`,
    slogan: messages.tagline,
    description: site.description,
    areaServed: { "@type": "Country", name: "United States" },
    knowsAbout: services.map((s) => s.title),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "AI automation services",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.description },
      })),
    },
    potentialAction: {
      "@type": "ReserveAction",
      name: "Book an automation consultation",
      target: `${site.url}/book`,
    },
  };

  if (sameAs.length) jsonLd.sameAs = sameAs;
  if (!isPlaceholder(contact.email)) jsonLd.email = contact.email;
  if (!isPlaceholder(contact.phone)) jsonLd.telephone = contact.phone;

  // "City, ST" → postal address (helps local search results)
  const locality = contact.location.split(",").map((part) => part.trim());
  if (!isPlaceholder(contact.location) && locality.length === 2) {
    jsonLd.address = {
      "@type": "PostalAddress",
      addressLocality: locality[0],
      addressRegion: locality[1],
      addressCountry: "US",
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}
