import type { Metadata } from "next";
import FreightPageClient from "@/components/FreightPageClient";

export const metadata: Metadata = {
  title: "Book Trucks Johannesburg | Same-Day Freight Quotes | FleetXchange",
  description: "Book trucks from Johannesburg instantly. Connect with 500+ verified transporters. Same-day quotes, real-time tracking. Freight to Cape Town, Durban, Pretoria & beyond.",
  keywords: "book truck johannesburg, freight booking johannesburg, same-day delivery, transport quotes, logistics johannesburg, cross-border freight",
  openGraph: {
    title: "Book Trucks Johannesburg | Instant Freight Quotes",
    description: "Fast truck booking from Johannesburg. Verified transporters, instant quotes, real-time tracking.",
    type: "website",
    url: "https://fleetxchange.africa/freight-johannesburg",
  },
};

export default function FreightJohannesburgPage() {
  const routes = [
    { from: "Johannesburg", to: "Cape Town", hours: "~20 hrs" },
    { from: "Johannesburg", to: "Durban", hours: "~6 hrs" },
    { from: "Johannesburg", to: "Pretoria", hours: "~1 hr" },
    { from: "Johannesburg", to: "Bloemfontein", hours: "~6 hrs" }
  ];

  const otherLocations = [
    { city: "Cape Town", flag: "🌊", href: "/freight-cape-town", desc: "SA West Coast" },
    { city: "Durban", flag: "⛴️", href: "/freight-durban", desc: "SA East Coast" },
    { city: "Lusaka, Zambia", flag: "🇿🇲", href: "/freight-zambia", desc: "Cross-border" },
    { city: "Gaborone, BW", flag: "🇧🇼", href: "/freight-botswana", desc: "Regional Hub" },
    { city: "Harare, ZW", flag: "🇿🇼", href: "/freight-zimbabwe", desc: "Southern Region" }
  ];

  return (
    <FreightPageClient 
      city="Johannesburg"
      defaultPickup="Johannesburg"
      description="Connect with verified transporters across Johannesburg, Cape Town, Durban, Pretoria & beyond. Instant quotes. Real-time tracking."
      routes={routes}
      otherLocations={otherLocations}
    />
  );
}
