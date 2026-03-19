import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get a Quote | Request Freight Booking or Apply as Transporter | FleetXchange",
  description: "Submit a load request for freight booking or apply as a verified transporter with FleetXchange. Connect with logistics solutions across South Africa.",
  keywords: "freight quote, book load, transporter application, logistics coordination, South Africa logistics",
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
