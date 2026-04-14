import type { Metadata } from "next";
import FreightPageClient from "@/components/FreightPageClient";

export const metadata: Metadata = {
  title: "Book Trucks Cape Town | Freight Quotes | Transport Services",
  description: "Book freight from Cape Town instantly. Connect with verified transporters. Fast quotes, real-time tracking across South Africa and Southern Africa.",
  keywords: "book truck cape town, freight transport cape town, logistics cape town, truck hire western cape, same-day delivery, cross-border freight",
  openGraph: {
    title: "Book Trucks Cape Town | Fast Freight Booking",
    description: "Instant truck booking from Cape Town. 500+ verified transporters, real-time tracking.",
    type: "website",
    url: "https://fleetxchange.africa/freight-cape-town",
  },
};

export default function FreightCapeTownPage() {
  const routes = [
    { to: "Johannesburg", hours: "~20 hrs" },
    { to: "Durban", hours: "~26 hrs" },
    { to: "Stellenbosch", hours: "~1 hr" },
    { to: "Bloemfontein", hours: "~14 hrs" }
  ];

  const otherLocations = [
    { city: "Johannesburg", flag: "🏢", href: "/freight-johannesburg", desc: "SA Hub" },
    { city: "Durban", flag: "⛴️", href: "/freight-durban", desc: "SA East Coast" },
    { city: "Lusaka, Zambia", flag: "🇿🇲", href: "/freight-zambia", desc: "Cross-border" },
    { city: "Gaborone, BW", flag: "🇧🇼", href: "/freight-botswana", desc: "Regional Hub" },
    { city: "Harare, ZW", flag: "🇿🇼", href: "/freight-zimbabwe", desc: "Southern Region" }
  ];

  return (
    <FreightPageClient 
      city="Cape Town"
      defaultPickup="Cape Town"
      description="Connect with verified transporters across South Africa. Instant quotes. Real-time tracking across the region."
      routes={routes}
      otherLocations={otherLocations}
    />
  );
}
