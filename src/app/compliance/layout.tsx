import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compliance & Regulations | FleetXchange",
  description: "FleetXchange meets all compliance requirements for cross-border freight transport and logistics operations in South Africa and Southern Africa.",
  keywords: "compliance, regulations, cross-border logistics, transport compliance, South Africa",
  robots: "index, follow",
};

export default function ComplianceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
