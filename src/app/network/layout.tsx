import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Network & Logistics Routes | South Africa | FleetXchange",
  description: "Explore FleetXchange's extensive network covering all major routes across South Africa and Southern Africa. Connect with transporters nationwide.",
  keywords: "logistics network, South Africa routes, Johannesburg, Cape Town, cross-border logistics, transport network",
};

export default function NetworkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
