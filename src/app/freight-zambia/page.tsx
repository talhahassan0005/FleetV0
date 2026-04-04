import type { Metadata } from "next";
import FreightPageClient from "@/components/FreightPageClient";

export const metadata: Metadata = {
  title: "Cross-Border Logistics Zambia | Lusaka Freight | International Shipping",
  description: "Cross-border logistics from Lusaka, Zambia. Book trucks for Johannesburg, Bulawayo, Harare. International freight rates, customs assistance, real-time tracking.",
  keywords: "cross-border logistics zambia, lusaka freight, truck hire zambia, international shipping, zambia to johnesburg freight, customs forwarding",
  openGraph: {
    title: "Cross-Border Logistics Zambia | Lusaka to Regional Hubs",
    description: "Fast cross-border freight from Zambia. Real-time tracking, customs support.",
    type: "website",
    url: "https://fleetxchange.africa/freight-zambia",
  },
};

export default function FreightZambiaPage() {
  const routes = [
    { to: "Johannesburg, RSA", hours: "~18 hrs" },
    { to: "Bulawayo, Zimbabwe", hours: "~12 hrs" },
    { to: "Harare, Zimbabwe", hours: "~16 hrs" },
    { to: "Ndola, Zambia", hours: "~4 hrs" }
  ];

  const otherLocations = [
    { city: "Johannesburg", flag: "🏢", href: "/freight-johannesburg", desc: "SA Hub" },
    { city: "Cape Town", flag: "🌊", href: "/freight-cape-town", desc: "SA Coast" },
    { city: "Durban", flag: "⛴️", href: "/freight-durban", desc: "SA Port" },
    { city: "Gaborone, BW", flag: "🇧🇼", href: "/freight-botswana", desc: "Regional" },
    { city: "Harare, ZW", flag: "🇿🇼", href: "/freight-zimbabwe", desc: "Zimbabwe" }
  ];

  return (
    <FreightPageClient 
      city="Lusaka, Zambia"
      defaultPickup="Lusaka, Zambia"
      description="Cross-border freight from Zambia. International logistics, customs assistance, real-time tracking to South Africa, Zimbabwe & beyond."
      routes={routes}
      otherLocations={otherLocations}
    />
  );
}
