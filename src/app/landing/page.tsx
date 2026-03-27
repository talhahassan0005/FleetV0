import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "Book Freight & Trucks South Africa | Instant Quote",
  description: "Fast freight booking across South Africa. Get instant quotes, real-time tracking, and match with verified transporters.",
  keywords: "freight booking South Africa, truck transport, logistics services, freight quote, truck matching",
};

export default function LandingPage() {
  return <HomeContent />;
}
