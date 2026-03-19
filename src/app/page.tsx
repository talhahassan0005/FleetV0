import type { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "Freight Booking & Truck Transport South Africa | FleetXchange",
  description: "Book reliable freight and trucks across South Africa. Connect with verified transporters. Fast, secure truck booking, real-time tracking, and cross-border logistics solutions.",
  keywords: "freight booking South Africa, truck transport, logistics platform, verified transporters, Johannesburg freight, cross-border logistics, truck matching",
  authors: [{ name: "FleetXchange" }],
  openGraph: {
    title: "Freight Booking & Truck Transport Across South Africa | FleetXchange",
    description: "Connect with verified transporters for instant freight booking. Real-time tracking, fast delivery, and secure logistics solutions.",
    url: "https://fleetxchange.com",
    type: "website",
    images: [
      {
        url: "https://fleetxchange.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "FleetXchange - Freight Booking Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freight Booking & Truck Transport South Africa | FleetXchange",
    description: "Book reliable freight across South Africa with verified transporters.",
    images: ["https://fleetxchange.com/og-image.png"],
  },
};

export default function Home() {
  return <HomeContent />;
}
