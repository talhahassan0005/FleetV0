import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why Choose FleetXchange | Best Freight Platform South Africa",
  description: "Discover why logistics businesses across South Africa trust FleetXchange for reliable freight booking, verified transporters, and 24/7 support.",
  keywords: "why choose FleetXchange, best logistics platform, transporter network, South Africa",
};

export default function WhyChooseUsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
