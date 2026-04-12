import type { Metadata } from "next";
import FreightPageClient from "@/components/FreightPageClient";

export const metadata: Metadata = {
  title: "Freight Forwarding Botswana | Gaborone Truck Hire | Regional Logistics",
  description: "Book trucks from Gaborone, Botswana. Freight to Johannesburg, Zambia, Zimbabwe. Regional logistics hub, instant quotes, customs support.",
  keywords: "freight forwarding botswana, gaborone truck hire, botswana logistics, regional shipping, border freight, customs clearance",
  openGraph: {
    title: "Freight Forwarding Botswana | Gaborone to Regional Hubs",
    description: "Regional trucking from Botswana. Instant quotes, real-time tracking.",
    type: "website",
    url: "https://fleetxchange.africa/freight-botswana",
  },
};

export default function FreightBotswanaPage() {
  const routes = [
    { to: "Johannesburg, RSA", hours: "~5 hrs" },
    { to: "Lusaka, Zambia", hours: "~14 hrs" },
    { to: "Francistown, BW", hours: "~4 hrs" },
    { to: "Harare, Zimbabwe", hours: "~10 hrs" }
  ];

  const otherLocations = [
    { city: "Johannesburg", flag: "🏢", href: "/freight-johannesburg", desc: "SA Hub" },
    { city: "Cape Town", flag: "🌊", href: "/freight-cape-town", desc: "SA Coast" },
    { city: "Durban", flag: "⛴️", href: "/freight-durban", desc: "SA Port" },
    { city: "Lusaka, ZM", flag: "🇿🇲", href: "/freight-zambia", desc: "Cross-border" },
    { city: "Harare, ZW", flag: "🇿🇼", href: "/freight-zimbabwe", desc: "Zimbabwe" }
  ];

  return (
    <FreightPageClient 
      city="Gaborone, Botswana"
      defaultPickup="Gaborone, Botswana"
      description="Regional logistics from Botswana. International freight to South Africa, Zambia, Zimbabwe. Real-time tracking, customs assistance."
      routes={routes}
      otherLocations={otherLocations}
    />
  );
}
