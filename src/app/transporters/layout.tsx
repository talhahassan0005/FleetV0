import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Transporters | Grow Your Business | FleetXchange",
  description: "Join FleetXchange as a verified transporter. Get consistent freight loads, reliable clients, and grow your logistics business across South Africa.",
  keywords: "transporter network, truck owner opportunities, freight loads, become a transporter, logistics opportunity",
};

export default function TransportersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
