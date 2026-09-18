import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { caseStudies } from "@/content/portfolio";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/book`, lastModified: now, changeFrequency: "yearly", priority: 0.9 },
    // Placeholder case studies are excluded until they are real
    ...caseStudies
      .filter((c) => !c.placeholder)
      .map((c) => ({
        url: `${site.url}/portfolio/${c.slug}`,
        lastModified: now,
        changeFrequency: "yearly" as const,
        priority: 0.6,
      })),
    { url: `${site.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
