import type { Metadata } from "next";
import FreightPageClient from "@/components/FreightPageClient";

export const metadata: Metadata = {
  title: "Book Trucks Durban | Freight Quotes | Transport Services",
  description: "Book freight from Durban instantly. Connect with 500+ verified transporters. Fast quotes, real-time tracking across South Africa and Southern Africa.",
  keywords: "book truck durban, freight transport durban, logistics durban, truck hire kwazulu-natal, same-day delivery, cross-border freight",
  openGraph: {
    title: "Book Trucks Durban | Fast Freight Booking",
    description: "Instant truck booking from Durban. 500+ verified transporters, real-time tracking.",
    type: "website",
    url: "https://fleetxchange.africa/freight-durban",
  },
};

export default function FreightDurbanPage() {
  const routes = [
    { to: "Johannesburg", hours: "~6 hrs" },
    { to: "Cape Town", hours: "~26 hrs" },
    { to: "Pietermaritzburg", hours: "~1.5 hrs" },
    { to: "Richards Bay", hours: "~2 hrs" }
  ];

  const otherLocations = [
    { city: "Johannesburg", flag: "🏢", href: "/freight-johannesburg", desc: "SA Hub" },
    { city: "Cape Town", flag: "🌊", href: "/freight-cape-town", desc: "SA West Coast" },
    { city: "Lusaka, Zambia", flag: "🇿🇲", href: "/freight-zambia", desc: "Cross-border" },
    { city: "Gaborone, BW", flag: "🇧🇼", href: "/freight-botswana", desc: "Regional Hub" },
    { city: "Harare, ZW", flag: "🇿🇼", href: "/freight-zimbabwe", desc: "Southern Region" }
  ];

  return (
    <FreightPageClient 
      city="Durban"
      defaultPickup="Durban"
      description="Connect with verified transporters across Southern Africa. Quick quotes. Real-time tracking for all shipments."
      routes={routes}
      otherLocations={otherLocations}
    />
  );
}
