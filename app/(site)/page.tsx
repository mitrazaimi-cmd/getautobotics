import { IntroAnimation } from "@/components/layout/IntroAnimation";
import { Hero } from "@/components/sections/Hero";
import { Outcomes } from "@/components/sections/Outcomes";
import { Services } from "@/components/sections/Services";
import { Method } from "@/components/sections/Method";
import { Portfolio } from "@/components/sections/Portfolio";
import { About } from "@/components/sections/About";
import { Booking } from "@/components/sections/Booking";
import { ContactSection } from "@/components/sections/ContactSection";

export default function HomePage() {
  return (
    <>
      <IntroAnimation />
      <Hero />
      <Outcomes />
      <Services />
      <Method />
      <Portfolio />
      <About />
      <Booking />
      <ContactSection />
    </>
  );
}
