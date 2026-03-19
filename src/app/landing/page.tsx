import type { Metadata } from "next";
import LandingPageContent from "@/components/LandingPageContent";

export const metadata: Metadata = {
  title: "Book Freight & Truck Services South Africa | Get Instant Quote",
  description: "Fast freight booking and truck transport across South Africa. Get matched with verified transporters. Instant quotes, real-time tracking, and reliable logistics services.",
  keywords: "freight booking South Africa, truck transport, logistics services, freight quote, truck matching",
};

export default function LandingPage() {
  return <LandingPageContent />;
}
