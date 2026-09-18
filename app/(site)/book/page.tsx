import type { Metadata } from "next";
import { Booking } from "@/components/sections/Booking";

export const metadata: Metadata = {
  title: "Book an automation consultation",
  description:
    "Request a consultation with Auto Botics. Tell us about your business, and we’ll find your highest-value automation opportunities together.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return <Booking headingLevel="h1" />;
}
