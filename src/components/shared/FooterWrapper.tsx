"use client";
// src/components/shared/FooterWrapper.tsx
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export function FooterWrapper() {
  const pathname = usePathname();

  // Hide footer on portal and auth pages (same as HeaderWrapper)
  const isPortalPage =
    pathname?.startsWith("/client/") ||
    pathname?.startsWith("/admin/") ||
    pathname === "/transporter" ||
    pathname?.startsWith("/transporter/") ||  // Hide all /transporter/* portal, but NOT /transp
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname === "/landing" ||
    pathname === "/client" ||
    pathname === "/admin" ||
    pathname === "/dashboard";

  if (isPortalPage) {
    return null;
  }

  return (
    <>
      <Footer />
    </>
  );
}
