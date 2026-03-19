import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About FleetXchange | Logistics Innovation in South Africa",
  description: "Learn about FleetXchange, the leading freight coordination platform connecting logistics businesses with verified transporters across Southern Africa.",
  keywords: "about FleetXchange, freight coordination, logistics platform, South Africa",
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
