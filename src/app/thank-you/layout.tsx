import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You | FleetXchange - Your Request Received",
  description: "Your freight or transporter request has been received successfully. Our team will review it and get back to you within 24 hours.",
  robots: "noindex, nofollow", // Don't index thank you page for SEO
};

export default function ThankYouLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
