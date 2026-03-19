import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | FleetXchange",
  description: "Our privacy policy outlines how FleetXchange collects, uses, and protects your personal and business information.",
  robots: "index, follow",
};

export default function PrivacyPolicyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
