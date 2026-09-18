import { SiteShell } from "@/components/layout/SiteShell";
import { StructuredData } from "@/components/seo/StructuredData";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData />
      <SiteShell>{children}</SiteShell>
    </>
  );
}
