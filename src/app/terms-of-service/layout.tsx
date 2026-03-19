import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | FleetXchange",
  description: "Read FleetXchange's terms of service governing the use of our freight booking platform and logistics coordination services.",
  robots: "index, follow",
};

export default function TermsOfServiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
