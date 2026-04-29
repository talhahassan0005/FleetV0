"use client";
// src/components/shared/HeaderWrapper.tsx
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import path from "path";

export function HeaderWrapper() {
  const pathname = usePathname();

  // Hide headers on portal and auth pages
  const isPortalPage =
    pathname?.startsWith("/client/") ||
    pathname?.startsWith("/admin/") ||
    pathname?.startsWith("/transporter/") ||
    pathname === "/transporter" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname === "/landing" ||
    pathname === "/client" ||
    pathname === "/admin" ||
    pathname === "/transporters" ||
    pathname === "/dashboard";

  if (isPortalPage) {
    return null;
  }

  return (
    <>
      <Header />
    </>
  );
}