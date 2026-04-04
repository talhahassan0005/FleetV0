import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join as a Verified Transporter | Grow Your Business | FleetXchange South Africa",
  description: "Become a verified transporter on FleetXchange. Get 50,000+ monthly freight loads, flexible scheduling, fair rates, and dedicated 24/7 support. Apply now.",
  keywords: "become transporter, transport jobs South Africa, freight operator, truck driver jobs, logistics opportunities",
};

export default function TransportersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
