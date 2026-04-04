import type { Metadata } from "next";
import FreightPageClient from "@/components/FreightPageClient";

export const metadata: Metadata = {
  title: "Zimbabwe Freight Forwarding | Harare Truck Hire | Southern Africa Logistics",
  description: "Freight forwarding from Harare, Zimbabwe. Book trucks to South Africa, Zambia, Botswana. International logistics, customs, real-time tracking.",
  keywords: "zimbabwe freight, harare logistics, southern africa shipping, truck hire zimbabwe, cross-border freight, international transportation",
  openGraph: {
    title: "Zimbabwe Freight Forwarding | Harare Regional Shipping",
    description: "Regional trucking from Zimbabwe. Instant rates, customs support.",
    type: "website",
    url: "https://fleetxchange.africa/freight-zimbabwe",
  },
};

export default function FreightZimbabwePage() {
  const routes = [
    { to: "Johannesburg, RSA", hours: "~16 hrs" },
    { to: "Bulawayo, ZW", hours: "~6 hrs" },
    { to: "Lusaka, Zambia", hours: "~16 hrs" },
    { to: "Mutare, ZW", hours: "~4 hrs" }
  ];

  const otherLocations = [
    { city: "Johannesburg", flag: "🏢", href: "/freight-johannesburg", desc: "SA Hub" },
    { city: "Cape Town", flag: "🌊", href: "/freight-cape-town", desc: "SA Coast" },
    { city: "Durban", flag: "⛴️", href: "/freight-durban", desc: "SA Port" },
    { city: "Lusaka, ZM", flag: "🇿🇲", href: "/freight-zambia", desc: "Regional" },
    { city: "Gaborone, BW", flag: "🇧🇼", href: "/freight-botswana", desc: "Hub" }
  ];

  return (
    <FreightPageClient 
      city="Harare, Zimbabwe"
      defaultPickup="Harare, Zimbabwe"
      description="Southern Africa freight from Zimbabwe. Cross-border logistics, customs forwarding, real-time tracking to all regional hubs."
      routes={routes}
      otherLocations={otherLocations}
    />
  );
}
