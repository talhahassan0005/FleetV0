import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Freight Network Across Southern Africa | FleetXchange",
  description: "FleetXchange covers all major routes across South Africa, Botswana, Zimbabwe, and beyond. Real-time tracking on 50,000+ monthly shipments. Coverage everywhere you ship.",
  keywords: "freight network South Africa, cross-border logistics, transport routes, Johannesburg, Cape Town, Durban, regional logistics",
};

export default function NetworkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
