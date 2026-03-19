import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | FleetXchange Freight Booking Process",
  description: "Learn how FleetXchange simplifies freight booking. Easy load posting, instant matching with verified transporters, and real-time tracking.",
  keywords: "how it works, freight booking process, truck matching, real-time tracking, South Africa logistics",
};

export default function HowItWorksLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
